'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ArrowRight, CornerDownLeft, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import type { Product } from '@/types';
import { formatCurrency } from '@/lib/utils';
import Image from 'next/image';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsContainerRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  // Load recent searches from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('kroma_recent_searches');
      if (stored) {
        try {
          setRecentSearches(JSON.parse(stored));
        } catch {
          setRecentSearches([]);
        }
      }
    }
  }, [isOpen]);

  // Focus input when overlay opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      setSelectedIndex(-1);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  // Handle Search Request with Debounce
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const delayDebounce = setTimeout(async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*, product_images(*)')
          .eq('status', 'active')
          .ilike('title', `%${query.trim()}%`)
          .limit(6);

        if (error) throw error;

        // Map product images correctly
        const mapped = (data || []).map((prod: any) => {
          const images = (prod.product_images || []).sort(
            (a: any, b: any) => a.sort_order - b.sort_order
          );
          return {
            ...prod,
            images,
          };
        });

        setResults(mapped as Product[]);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query, supabase]);

  // Save to recent searches
  const saveRecentSearch = (searchQuery: string) => {
    const trimmed = searchQuery.trim();
    if (!trimmed) return;
    const updated = [trimmed, ...recentSearches.filter((s) => s !== trimmed)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('kroma_recent_searches', JSON.stringify(updated));
  };

  const handleSelectResult = (product: Product) => {
    saveRecentSearch(query || product.title);
    onClose();
    router.push(`/products/${product.slug}`);
  };

  // Keyboard navigation handler
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter') {
      if (selectedIndex >= 0 && selectedIndex < results.length) {
        handleSelectResult(results[selectedIndex]);
      } else if (query.trim()) {
        saveRecentSearch(query);
        onClose();
        router.push(`/products?search=${encodeURIComponent(query.trim())}`);
      }
    }
  };

  // Scroll to selected element
  useEffect(() => {
    if (selectedIndex >= 0 && resultsContainerRef.current) {
      const selectedElement = resultsContainerRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[999] bg-[#FAFAFA]/98 backdrop-blur-md flex flex-col"
          onKeyDown={handleKeyDown}
        >
          {/* Top Bar: Search Input */}
          <div className="border-b border-gray-100 bg-white">
            <div className="max-w-[1440px] mx-auto px-6 md:px-16 py-6 flex items-center justify-between gap-6">
              <div className="flex-1 flex items-center gap-4 relative">
                <Search size={22} className="text-gray-400 flex-shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search our collections..."
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setSelectedIndex(-1);
                  }}
                  className="w-full text-[20px] md:text-[24px] font-light bg-transparent text-[#1A1A1A] border-none outline-none placeholder-gray-300 focus:ring-0"
                  style={{ fontFamily: 'var(--font-serif)' }}
                />
                {loading && (
                  <Loader2 size={20} className="text-[#2563EB] animate-spin absolute right-4" />
                )}
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer flex-shrink-0"
              >
                <X size={18} className="text-[#1A1A1A]" />
              </button>
            </div>
          </div>

          {/* Results/Suggestions Panel */}
          <div className="flex-1 overflow-y-auto py-12 px-6 md:px-16">
            <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-3 gap-16">
              
              {/* Left Column: Recent Searches & Categories */}
              <div className="lg:col-span-1 space-y-10">
                {recentSearches.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-[11px] uppercase tracking-widest text-gray-400 font-bold">
                      Recent Searches
                    </h3>
                    <ul className="space-y-3">
                      {recentSearches.map((search) => (
                        <li key={search}>
                          <button
                            onClick={() => setQuery(search)}
                            className="flex items-center gap-2.5 text-[14px] text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors cursor-pointer text-left"
                          >
                            <Search size={14} className="text-gray-400" />
                            {search}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="space-y-4">
                  <h3 className="text-[11px] uppercase tracking-widest text-gray-400 font-bold">
                    Suggested Categories
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { name: 'Baskets', href: '/products?category=baskets-arrangements' },
                      { name: 'Wall Mounts', href: '/products?category=wall-mounts' },
                      { name: 'Wreaths', href: '/products?category=floral-wreaths' },
                      { name: 'Table Vases', href: '/products?category=table-vases' },
                    ].map((cat) => (
                      <button
                        key={cat.name}
                        onClick={() => {
                          onClose();
                          router.push(cat.href);
                        }}
                        className="px-4 py-2 bg-white border border-gray-100 hover:border-gray-300 rounded-full text-[13px] text-gray-700 transition-colors cursor-pointer"
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Columns: Search Results */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                  <h3 className="text-[11px] uppercase tracking-widest text-gray-400 font-bold">
                    {query ? 'Search Results' : 'Trending Products'}
                  </h3>
                  {results.length > 0 && (
                    <span className="text-[12px] text-gray-400 font-medium">
                      {results.length} items found
                    </span>
                  )}
                </div>

                {query && results.length === 0 && !loading && (
                  <div className="py-12 text-center space-y-3">
                    <p className="text-[16px] text-gray-700" style={{ fontFamily: 'var(--font-serif)' }}>
                      No results found for &ldquo;{query}&rdquo;
                    </p>
                    <p className="text-[13px] text-[#6B6B6B]">
                      Try checking spelling or use more general terms.
                    </p>
                  </div>
                )}

                <div ref={resultsContainerRef} className="space-y-3">
                  {(query ? results : []).map((product, idx) => {
                    const isSelected = idx === selectedIndex;
                    const featuredImg = product.images?.[0]?.image_url || '/placeholder.jpg';
                    
                    return (
                      <div
                        key={product.id}
                        onClick={() => handleSelectResult(product)}
                        className={`flex items-center justify-between p-4 rounded-[16px] border transition-all duration-200 cursor-pointer ${
                          isSelected
                            ? 'bg-white border-[#2563EB] shadow-md'
                            : 'bg-white border-transparent hover:border-gray-200 hover:shadow-sm'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="relative w-16 h-16 rounded-[8px] bg-gray-50 overflow-hidden flex-shrink-0 border border-gray-100">
                            <Image
                              src={featuredImg}
                              alt={product.title}
                              fill
                              className="object-cover"
                              sizes="64px"
                            />
                          </div>
                          <div>
                            <h4 className="text-[15px] font-medium text-[#1A1A1A] hover:text-[#2563EB] transition-colors">
                              {product.title}
                            </h4>
                            <p className="text-[13px] text-gray-400 uppercase tracking-wider mt-0.5">
                              SKU: {product.sku}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-[14px] font-semibold text-[#1A1A1A]">
                            {formatCurrency(product.price)}
                          </span>
                          {isSelected ? (
                            <CornerDownLeft size={16} className="text-[#2563EB]" />
                          ) : (
                            <ArrowRight size={16} className="text-gray-300" />
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {!query && (
                    <div className="py-8 text-center text-gray-400 text-[13.5px]">
                      Type above to begin searching our catalog.
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
