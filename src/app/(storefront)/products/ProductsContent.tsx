'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, X, SlidersHorizontal, Search, RotateCcw } from 'lucide-react';
import type { Product, Category } from '@/types';
import ProductCard from '@/components/storefront/ProductCard';
import Button from '@/components/ui/Button';
import { useCart } from '@/hooks/useCart';
import FlowerVaseLoader from '@/components/ui/FlowerVaseLoader';

export default function ProductsContent({
  initialProducts,
  initialCategories,
}: {
  initialProducts: Product[];
  initialCategories: Category[];
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { addItem } = useCart();

  const [products] = useState<Product[]>(initialProducts);
  const [categories] = useState<Category[]>(initialCategories);
  const [loading] = useState(false);

  // Read initial query params
  const categoryQuery = searchParams.get('category') || 'all';
  const searchQuery = searchParams.get('search') || '';
  const sortQuery = searchParams.get('sort') || 'default';

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState(categoryQuery);
  const [searchVal, setSearchVal] = useState(searchQuery);
  const [maxPrice, setMaxPrice] = useState(10000);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState(sortQuery);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Sync category from URL query param when it changes
  useEffect(() => {
    setSelectedCategory(categoryQuery);
  }, [categoryQuery]);

  // Sync search from URL query param when it changes
  useEffect(() => {
    setSearchVal(searchQuery);
  }, [searchQuery]);

  // Update URL query params when filters change
  const updateUrlParams = (params: { category?: string; search?: string; sort?: string }) => {
    const newParams = new URLSearchParams(searchParams.toString());
    
    if (params.category !== undefined) {
      if (params.category === 'all') {
        newParams.delete('category');
      } else {
        newParams.set('category', params.category);
      }
    }
    
    if (params.search !== undefined) {
      if (!params.search) {
        newParams.delete('search');
      } else {
        newParams.set('search', params.search);
      }
    }

    if (params.sort !== undefined) {
      if (params.sort === 'default') {
        newParams.delete('sort');
      } else {
        newParams.set('sort', params.sort);
      }
    }

    router.push(`/products?${newParams.toString()}`);
  };

  const handleCategorySelect = (slug: string) => {
    setSelectedCategory(slug);
    updateUrlParams({ category: slug });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrlParams({ search: searchVal });
  };

  const handleSortChange = (val: string) => {
    setSortBy(val);
    updateUrlParams({ sort: val });
  };

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSearchVal('');
    setMaxPrice(10000);
    setMinRating(0);
    setSortBy('default');
    router.push('/products');
  };

  // Filter and Sort Logic
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Category Filter
    if (selectedCategory && selectedCategory !== 'all') {
      const categoryObj = categories.find((cat) => cat.slug === selectedCategory);
      if (categoryObj) {
        result = result.filter((prod) => prod.category_id === categoryObj.id);
      }
    }

    // Search Filter
    if (searchVal.trim()) {
      const term = searchVal.toLowerCase();
      result = result.filter(
        (prod) =>
          prod.title.toLowerCase().includes(term) ||
          prod.description?.toLowerCase().includes(term) ||
          prod.tags?.some((t) => t.toLowerCase().includes(term))
      );
    }

    // Price Filter
    result = result.filter((prod) => prod.price <= maxPrice);

    // Rating Filter
    if (minRating > 0) {
      result = result.filter((prod) => (prod.average_rating || 0) >= minRating);
    }

    // Sorting
    if (sortBy === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0));
    } else if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sortBy === 'best-selling') {
      result.sort((a, b) => (b.total_orders || 0) - (a.total_orders || 0));
    }

    return result;
  }, [products, categories, selectedCategory, searchVal, maxPrice, minRating, sortBy]);

  // Count active filters (for chips and reset states)
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedCategory !== 'all') count++;
    if (searchVal) count++;
    if (maxPrice < 10000) count++;
    if (minRating > 0) count++;
    return count;
  }, [selectedCategory, searchVal, maxPrice, minRating]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] pt-[120px] pb-24 flex items-center justify-center">
        <FlowerVaseLoader label="Warming up our collections..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] pt-[100px] pb-24">
      <div className="max-w-[1440px] mx-auto px-6 md:px-16">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 border-b border-[#000]/[0.06] pb-8 gap-6">
          <div>
            <h1 className="text-[36px] md:text-[48px] font-normal leading-tight text-[#1A1A1A] mb-3" style={{ fontFamily: 'var(--font-serif)' }}>
              {selectedCategory !== 'all' 
                ? categories.find(c => c.slug === selectedCategory)?.name 
                : 'All Creations'}
            </h1>
            <p className="text-[14px] text-[#6B6B6B]">
              Showing {filteredProducts.length} of {products.length} handmade floral artifacts
            </p>
          </div>

          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-[320px]">
            <input
              type="text"
              placeholder="Search catalog..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="w-full px-4 py-2.5 pl-10 rounded-[8px] bg-white border border-[#000]/[0.08] text-[14px] text-[#1A1A1A] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-all"
            />
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
            {searchVal && (
              <button
                type="button"
                onClick={() => {
                  setSearchVal('');
                  updateUrlParams({ search: '' });
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#1A1A1A]"
              >
                <X size={14} />
              </button>
            )}
          </form>
        </div>

        {/* Toolbar (Mobile Filters button + Desktop Sort) */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="outline"
            className="md:hidden flex items-center gap-2"
            onClick={() => setMobileFiltersOpen(true)}
          >
            <Filter size={16} /> Filters
          </Button>

          <div className="hidden md:flex items-center gap-2 text-[13px] text-[#6B6B6B]">
            <SlidersHorizontal size={14} />
            <span>Refine your selection</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[13px] text-[#6B6B6B] hidden sm:inline">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="px-3 py-2 bg-white border border-[#000]/[0.08] rounded-[8px] text-[13px] text-[#1A1A1A] focus:outline-none focus:border-[#2563EB] cursor-pointer"
            >
              <option value="default">Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
              <option value="best-selling">Best Sellers</option>
              <option value="newest">Newest Arrivals</option>
            </select>
          </div>
        </div>

        {/* Active Filter Chips */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2 items-center mb-8">
            <span className="text-[12px] text-[#6B6B6B] uppercase tracking-wider mr-2">Active Filters:</span>
            
            {selectedCategory !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#000]/[0.06] text-[12px] text-[#1A1A1A] shadow-sm">
                Category: {categories.find(c => c.slug === selectedCategory)?.name}
                <button onClick={() => handleCategorySelect('all')} className="text-[#9CA3AF] hover:text-[#DC2626] transition-colors">
                  <X size={12} />
                </button>
              </span>
            )}

            {searchVal && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#000]/[0.06] text-[12px] text-[#1A1A1A] shadow-sm">
                Search: "{searchVal}"
                <button onClick={() => { setSearchVal(''); updateUrlParams({ search: '' }); }} className="text-[#9CA3AF] hover:text-[#DC2626] transition-colors">
                  <X size={12} />
                </button>
              </span>
            )}

            {maxPrice < 10000 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#000]/[0.06] text-[12px] text-[#1A1A1A] shadow-sm">
                Price: Under ₹{maxPrice}
                <button onClick={() => setMaxPrice(10000)} className="text-[#9CA3AF] hover:text-[#DC2626] transition-colors">
                  <X size={12} />
                </button>
              </span>
            )}

            {minRating > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#000]/[0.06] text-[12px] text-[#1A1A1A] shadow-sm">
                Rating: {minRating}+ ★
                <button onClick={() => setMinRating(0)} className="text-[#9CA3AF] hover:text-[#DC2626] transition-colors">
                  <X size={12} />
                </button>
              </span>
            )}

            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 text-[12px] text-[#2563EB] hover:text-[#1d4ed8] font-medium ml-2 cursor-pointer"
            >
              <RotateCcw size={12} /> Reset All
            </button>
          </div>
        )}

        <div className="flex gap-10">
          {/* Desktop Sidebar Filters */}
          <aside className="w-[260px] flex-shrink-0 hidden md:block">
            <div className="sticky top-[100px] border border-[#000]/[0.05] rounded-[16px] bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6 border-b border-[#000]/[0.05] pb-4">
                <h3 className="font-semibold text-[#1A1A1A] text-[15px]">Filters</h3>
                {activeFiltersCount > 0 && (
                  <button onClick={handleResetFilters} className="text-[12px] text-[#6B6B6B] hover:text-[#DC2626] transition-colors">
                    Reset
                  </button>
                )}
              </div>

              {/* Categories */}
              <div className="mb-8">
                <h4 className="text-[12px] uppercase tracking-wider text-[#6B6B6B] mb-3 font-semibold">Collections</h4>
                <div className="space-y-2">
                  <label className="flex items-center gap-2.5 text-[14px] text-[#1A1A1A] cursor-pointer">
                    <input
                      type="radio"
                      name="desktop-category"
                      checked={selectedCategory === 'all'}
                      onChange={() => handleCategorySelect('all')}
                      className="accent-[#2563EB]"
                    />
                    <span>All Collections</span>
                  </label>
                  {categories.map((cat) => (
                    <label key={cat.id} className="flex items-center gap-2.5 text-[14px] text-[#1A1A1A] cursor-pointer">
                      <input
                        type="radio"
                        name="desktop-category"
                        checked={selectedCategory === cat.slug}
                        onChange={() => handleCategorySelect(cat.slug)}
                        className="accent-[#2563EB]"
                      />
                      <span>{cat.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-[12px] uppercase tracking-wider text-[#6B6B6B] font-semibold">Max Price</h4>
                  <span className="text-[13px] font-medium text-[#1A1A1A]">₹{maxPrice}</span>
                </div>
                <input
                  type="range"
                  min="3000"
                  max="10000"
                  step="500"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                  className="w-full h-1 bg-[#E5E7EB] rounded-lg appearance-none cursor-pointer accent-[#2563EB]"
                />
                <div className="flex justify-between text-[11px] text-[#9CA3AF] mt-1.5">
                  <span>₹3,000</span>
                  <span>₹10,000</span>
                </div>
              </div>

              {/* Rating Filter */}
              <div>
                <h4 className="text-[12px] uppercase tracking-wider text-[#6B6B6B] mb-3 font-semibold">Minimum Rating</h4>
                <div className="space-y-2">
                  {[4, 4.5, 5].map((stars) => (
                    <label key={stars} className="flex items-center gap-2.5 text-[14px] text-[#1A1A1A] cursor-pointer">
                      <input
                        type="radio"
                        name="desktop-rating"
                        checked={minRating === stars}
                        onChange={() => setMinRating(stars)}
                        className="accent-[#2563EB]"
                      />
                      <span>{stars} Stars & above</span>
                    </label>
                  ))}
                  <label className="flex items-center gap-2.5 text-[14px] text-[#1A1A1A] cursor-pointer">
                    <input
                      type="radio"
                      name="desktop-rating"
                      checked={minRating === 0}
                      onChange={() => setMinRating(0)}
                      className="accent-[#2563EB]"
                    />
                    <span>Any rating</span>
                  </label>
                </div>
              </div>
            </div>
          </aside>

          {/* Product Grid Area */}
          <main className="flex-1">
            {filteredProducts.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20 bg-white border border-[#000]/[0.05] rounded-[24px] px-8 shadow-sm"
              >
                <div className="w-16 h-16 rounded-full bg-[#F5F5F0] flex items-center justify-center mx-auto mb-4 text-[24px]">
                  🏺
                </div>
                <h3 className="text-[18px] font-medium text-[#1A1A1A] mb-2" style={{ fontFamily: 'var(--font-serif)' }}>
                  No Creations Found
                </h3>
                <p className="text-[14px] text-[#6B6B6B] max-w-[360px] mx-auto mb-6">
                  We couldn't find any homemade arrangements matching your filters. Try resetting them!
                </p>
                <Button onClick={handleResetFilters} variant="primary">
                  Clear All Filters
                </Button>
              </motion.div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                  {filteredProducts.map((product, idx) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      index={idx}
                      onAddToCart={(prod) => addItem(prod)}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Drawer Slide-over */}
      <AnimatePresence>
        {mobileFiltersOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileFiltersOpen(false)}
              className="fixed inset-0 bg-black z-50 backdrop-blur-xs"
            />

            {/* Bottom Drawer */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 max-h-[85vh] bg-white rounded-t-[24px] z-50 overflow-y-auto p-6 shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between border-b border-[#000]/[0.05] pb-4 mb-6">
                <h3 className="text-[18px] font-semibold text-[#1A1A1A]">Filters</h3>
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="p-1 rounded-full hover:bg-gray-100 text-[#1A1A1A]"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Categories */}
              <div className="mb-6">
                <h4 className="text-[12px] uppercase tracking-wider text-[#6B6B6B] mb-3 font-semibold">Collections</h4>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleCategorySelect('all')}
                    className={`px-3.5 py-2 rounded-full text-[13px] border transition-colors ${
                      selectedCategory === 'all'
                        ? 'bg-[#1A1A1A] border-[#1A1A1A] text-white'
                        : 'bg-white border-[#000]/[0.08] text-[#1A1A1A] hover:bg-gray-50'
                    }`}
                  >
                    All
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => handleCategorySelect(cat.slug)}
                      className={`px-3.5 py-2 rounded-full text-[13px] border transition-colors ${
                        selectedCategory === cat.slug
                          ? 'bg-[#1A1A1A] border-[#1A1A1A] text-white'
                          : 'bg-white border-[#000]/[0.08] text-[#1A1A1A] hover:bg-gray-50'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price range */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-[12px] uppercase tracking-wider text-[#6B6B6B] font-semibold">Max Price</h4>
                  <span className="text-[14px] font-medium text-[#1A1A1A]">₹{maxPrice}</span>
                </div>
                <input
                  type="range"
                  min="3000"
                  max="10000"
                  step="500"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                  className="w-full h-1 bg-[#E5E7EB] rounded-lg appearance-none cursor-pointer accent-[#2563EB]"
                />
              </div>

              {/* Ratings */}
              <div className="mb-8">
                <h4 className="text-[12px] uppercase tracking-wider text-[#6B6B6B] mb-3 font-semibold">Minimum Rating</h4>
                <div className="grid grid-cols-2 gap-2">
                  {[0, 4, 4.5, 5].map((stars) => (
                    <button
                      key={stars}
                      onClick={() => setMinRating(stars)}
                      className={`py-2 px-3 rounded-lg text-[13px] border text-center transition-colors ${
                        minRating === stars
                          ? 'bg-[#1A1A1A] border-[#1A1A1A] text-white'
                          : 'bg-white border-[#000]/[0.08] text-[#1A1A1A] hover:bg-gray-50'
                      }`}
                    >
                      {stars === 0 ? 'Any rating' : `${stars} Stars+`}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 mt-auto">
                <Button variant="outline" className="flex-1" onClick={handleResetFilters}>
                  Clear All
                </Button>
                <Button variant="primary" className="flex-1" onClick={() => setMobileFiltersOpen(false)}>
                  Apply Filters
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
