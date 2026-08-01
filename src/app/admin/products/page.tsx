'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { Plus, Edit2, Trash2, X, Upload, Loader2, Save, Package } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import Button from '@/components/ui/Button';
import ImageUploader from '@/components/ui/ImageUploader';
import type { Product, Category } from '@/types';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit / Add form overlay states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [sku, setSku] = useState('');
  const [price, setPrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [stock, setStock] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [status, setStatus] = useState<'active' | 'draft'>('active');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch products and categories
  const fetchData = async () => {
    try {
      setLoading(true);
      const supabase = createClient();

      // 1. Fetch categories
      const { data: catData } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      setCategories(catData || []);

      // 2. Fetch products with images and categories
      const { data: prodData } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(*),
          images:product_images(*)
        `)
        .order('created_at', { ascending: false });

      setProducts(prodData || []);
    } catch (err) {
      console.error('Failed to query products catalog:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddForm = () => {
    setEditingProduct(null);
    setTitle('');
    setSku(`KRM-${Math.floor(100000 + Math.random() * 900000)}`);
    setPrice('');
    setSalePrice('');
    setStock('10');
    setCategoryId(categories[0]?.id || '');
    setDescription('');
    setImageUrl('');
    setStatus('active');
    setIsFormOpen(true);
  };

  const openEditForm = (p: Product) => {
    setEditingProduct(p);
    setTitle(p.title);
    setSku(p.sku);
    setPrice(p.price.toString());
    setSalePrice(p.sale_price ? p.sale_price.toString() : '');
    setStock(p.stock_quantity.toString());
    setCategoryId(p.category_id || '');
    setDescription(p.description || '');
    setImageUrl(p.images?.[0]?.image_url || '');
    setStatus(p.status);
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !price || !stock) {
      alert('Please fill out all mandatory fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      const supabase = createClient();
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

      const payload = {
        title,
        slug,
        sku,
        price: parseFloat(price),
        sale_price: salePrice ? parseFloat(salePrice) : null,
        stock_quantity: parseInt(stock),
        category_id: categoryId || null,
        description,
        status,
        track_inventory: true,
      };

      if (editingProduct) {
        // Edit flow
        const { error: prodErr } = await supabase
          .from('products')
          .update(payload)
          .eq('id', editingProduct.id);

        if (prodErr) throw prodErr;

        // Update image url if set
        if (imageUrl) {
          // Check if image already exists
          const existingImage = editingProduct.images?.[0];
          if (existingImage) {
            await supabase
              .from('product_images')
              .update({ image_url: imageUrl })
              .eq('id', existingImage.id);
          } else {
            await supabase
              .from('product_images')
              .insert({
                product_id: editingProduct.id,
                image_url: imageUrl,
                sort_order: 1,
              });
          }
        }
      } else {
        // Add flow
        const { data: newProd, error: insertErr } = await supabase
          .from('products')
          .insert(payload)
          .select()
          .single();

        if (insertErr) throw insertErr;

        if (imageUrl && newProd) {
          await supabase
            .from('product_images')
            .insert({
              product_id: newProd.id,
              image_url: imageUrl,
              sort_order: 1,
            });
        }
      }

      setIsFormOpen(false);
      fetchData();
    } catch (err: any) {
      console.error('Failed to submit product details:', err);
      alert(err.message || 'An error occurred while saving the product details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you absolutely sure you want to delete this product? This action is irreversible.')) {
      return;
    }

    try {
      const supabase = createClient();
      
      // Delete images first
      await supabase
        .from('product_images')
        .delete()
        .eq('product_id', id);

      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchData();
    } catch (err: any) {
      console.error('Failed to delete product:', err);
      alert(err.message || 'An error occurred while trying to delete this product.');
    }
  };

  if (loading && products.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 text-[#2563EB] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-[26px] font-normal text-gray-900 leading-tight" style={{ fontFamily: 'var(--font-serif)' }}>
            Products Inventory
          </h2>
          <p className="text-[13px] text-gray-500 mt-1">Manage active listings, catalog options, edit details, and modify inventory quantities.</p>
        </div>
        <Button onClick={openAddForm} variant="primary" className="h-10 text-[12.5px] px-4 py-2 flex items-center gap-1.5">
          <Plus size={16} /> Add Product
        </Button>
      </div>

      {/* Catalog Table */}
      <div className="bg-white border border-gray-200 rounded-[24px] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[13px]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50 text-gray-400 font-semibold">
                <th className="p-4 pl-6">Product Item</th>
                <th className="p-4">SKU</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Status</th>
                <th className="p-4 pr-6 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-400">No products listed in catalog.</td>
                </tr>
              ) : (
                products.map((p) => {
                  const image = p.images?.[0]?.image_url || '/samples/product-1.jpg';
                  return (
                    <tr key={p.id} className="hover:bg-gray-50/20">
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={image}
                            alt={p.title}
                            className="w-10 h-10 rounded-lg object-cover bg-gray-50 border border-gray-100 flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <span className="font-semibold text-gray-900 block truncate max-w-[200px]">{p.title}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-gray-500 font-mono text-[12px]">{p.sku}</td>
                      <td className="p-4 text-gray-500">{p.category?.name || 'Uncategorized'}</td>
                      <td className="p-4 font-semibold text-gray-900">
                        {p.sale_price ? (
                          <div className="flex flex-col">
                            <span>{formatCurrency(p.sale_price)}</span>
                            <span className="text-[11px] text-gray-400 line-through">{formatCurrency(p.price)}</span>
                          </div>
                        ) : (
                          formatCurrency(p.price)
                        )}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${p.stock_quantity === 0 ? 'bg-red-50 text-red-700' : p.stock_quantity <= 3 ? 'bg-amber-50 text-amber-700' : 'bg-green-50 text-green-700'}`}>
                          {p.stock_quantity} in stock
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${p.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="p-4 pr-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditForm(p)}
                            className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit Product"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50/50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Product"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit / Add Modal Overlay */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white border border-gray-200 rounded-[32px] max-w-[600px] w-full max-h-[85vh] overflow-y-auto shadow-2xl flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="font-semibold text-[17px] text-gray-900" style={{ fontFamily: 'var(--font-serif)' }}>
                {editingProduct ? 'Edit Product Parameters' : 'Add New Product'}
              </h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-full transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form Fields */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 flex-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-[11px] uppercase tracking-wider text-gray-400 mb-1.5 font-bold">Product Title *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Handmade Terracotta Flower Vase"
                    className="w-full h-11 px-4 border border-gray-200 rounded-[10px] text-[13.5px] outline-none focus:border-[#2563EB] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-gray-400 mb-1.5 font-bold">SKU Code *</label>
                  <input
                    type="text"
                    required
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="e.g. KRM-987452"
                    className="w-full h-11 px-4 border border-gray-200 rounded-[10px] text-[13.5px] outline-none focus:border-[#2563EB] transition-colors bg-gray-50 text-gray-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-gray-400 mb-1.5 font-bold">Category *</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full h-11 px-3 border border-gray-200 rounded-[10px] text-[13.5px] bg-white outline-none focus:border-[#2563EB] transition-colors"
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-gray-400 mb-1.5 font-bold">Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="e.g. 1200"
                    className="w-full h-11 px-4 border border-gray-200 rounded-[10px] text-[13.5px] outline-none focus:border-[#2563EB] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-gray-400 mb-1.5 font-bold">Sale Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={salePrice}
                    onChange={(e) => setSalePrice(e.target.value)}
                    placeholder="e.g. 990 (Optional)"
                    className="w-full h-11 px-4 border border-gray-200 rounded-[10px] text-[13.5px] outline-none focus:border-[#2563EB] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-gray-400 mb-1.5 font-bold">Stock Quantity *</label>
                  <input
                    type="number"
                    required
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    placeholder="e.g. 15"
                    className="w-full h-11 px-4 border border-gray-200 rounded-[10px] text-[13.5px] outline-none focus:border-[#2563EB] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-gray-400 mb-1.5 font-bold">Display Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full h-11 px-3 border border-gray-200 rounded-[10px] text-[13.5px] bg-white outline-none focus:border-[#2563EB] transition-colors"
                  >
                    <option value="active">Active Listing</option>
                    <option value="draft">Draft (Hidden)</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <ImageUploader 
                    label="Product Display Image"
                    value={imageUrl} 
                    onChange={(url) => setImageUrl(url)} 
                  />
                  <p className="text-[11px] text-gray-400 mt-2">Upload a high-quality showcase image for your product. It will be hosted securely on Cloudinary.</p>
                </div>

                <div className="col-span-2">
                  <label className="block text-[11px] uppercase tracking-wider text-gray-400 mb-1.5 font-bold">Product Description</label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the artisan background, textures, dimensions, and styling suggestions..."
                    className="w-full p-4 border border-gray-200 rounded-[12px] text-[13.5px] outline-none focus:border-[#2563EB] transition-colors resize-none"
                  />
                </div>
              </div>

              {/* Submit panel */}
              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3.5 sticky bottom-0 bg-white">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsFormOpen(false)}
                  className="h-11 px-5 text-[13px]"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="h-11 px-5 text-[13px] flex items-center gap-1.5"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={16} />}
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
