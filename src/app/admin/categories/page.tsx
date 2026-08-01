'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { Plus, Edit2, Trash2, X, Loader2, Save, FolderOpen } from 'lucide-react';
import Button from '@/components/ui/Button';
import ImageUploader from '@/components/ui/ImageUploader';
import type { Category } from '@/types';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit / Add form overlay states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch categories
  const fetchData = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (err) {
      console.error('Failed to query categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddForm = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setImageUrl('');
    setIsFormOpen(true);
  };

  const openEditForm = (c: Category) => {
    setEditingCategory(c);
    setName(c.name);
    setDescription(c.description || '');
    setImageUrl(c.image_url || '');
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      alert('Please provide a category name.');
      return;
    }

    setIsSubmitting(true);
    try {
      const supabase = createClient();
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

      const payload = {
        name,
        slug,
        description: description || null,
        image_url: imageUrl || null,
        sort_order: categories.length + 1
      };

      if (editingCategory) {
        // Edit flow
        const { error } = await supabase
          .from('categories')
          .update(payload)
          .eq('id', editingCategory.id);

        if (error) throw error;
      } else {
        // Add flow
        const { error } = await supabase
          .from('categories')
          .insert(payload);

        if (error) throw error;
      }

      setIsFormOpen(false);
      fetchData();
    } catch (err: any) {
      console.error('Failed to save category:', err);
      alert(err.message || 'An error occurred while saving the category.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you absolutely sure you want to delete this category? Products associated with it might be affected.')) {
      return;
    }

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchData();
    } catch (err: any) {
      console.error('Failed to delete category:', err);
      alert(err.message || 'An error occurred while trying to delete this category.');
    }
  };

  if (loading && categories.length === 0) {
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
            Category Manager
          </h2>
          <p className="text-[13px] text-gray-500 mt-1">Organize your product catalog into thematic collections.</p>
        </div>
        <Button onClick={openAddForm} variant="primary" className="h-10 text-[12.5px] px-4 py-2 flex items-center gap-1.5">
          <Plus size={16} /> Add Category
        </Button>
      </div>

      {/* Catalog Table */}
      <div className="bg-white border border-gray-200 rounded-[24px] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[13px]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50 text-gray-400 font-semibold">
                <th className="p-4 pl-6">Category Name</th>
                <th className="p-4">Slug URL</th>
                <th className="p-4">Description</th>
                <th className="p-4 pr-6 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-400">No categories found.</td>
                </tr>
              ) : (
                categories.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/20">
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        {c.image_url ? (
                           <img
                             src={c.image_url}
                             alt={c.name}
                             className="w-10 h-10 rounded-lg object-cover bg-gray-50 border border-gray-100 flex-shrink-0"
                           />
                        ) : (
                           <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                             <FolderOpen size={16} />
                           </div>
                        )}
                        <span className="font-semibold text-gray-900 block truncate max-w-[200px]">{c.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-gray-500 font-mono text-[12px]">/{c.slug}</td>
                    <td className="p-4 text-gray-500 truncate max-w-[300px]">{c.description || '—'}</td>
                    <td className="p-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditForm(c)}
                          className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit Category"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50/50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Category"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit / Add Modal Overlay */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white border border-gray-200 rounded-[32px] max-w-[500px] w-full max-h-[85vh] overflow-y-auto shadow-2xl flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="font-semibold text-[17px] text-gray-900" style={{ fontFamily: 'var(--font-serif)' }}>
                {editingCategory ? 'Edit Category' : 'Create Category'}
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
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-gray-400 mb-1.5 font-bold">Category Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Living Room Decor"
                  className="w-full h-11 px-4 border border-gray-200 rounded-[10px] text-[13.5px] outline-none focus:border-[#2563EB] transition-colors"
                />
              </div>

              <div>
                <ImageUploader 
                  label="Category Cover Image"
                  value={imageUrl} 
                  onChange={(url) => setImageUrl(url)} 
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-gray-400 mb-1.5 font-bold">Description</label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of the items in this collection..."
                  className="w-full p-4 border border-gray-200 rounded-[12px] text-[13.5px] outline-none focus:border-[#2563EB] transition-colors resize-none"
                />
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
                  Save Category
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
