'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, 
  Minus, 
  Plus, 
  ShoppingBag, 
  Heart, 
  Truck, 
  ShieldCheck, 
  Sparkles, 
  Star, 
  ChevronDown
} from 'lucide-react';
import type { Product } from '@/types';
import ProductCard from '@/components/storefront/ProductCard';
import StarRating from '@/components/ui/StarRating';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { useCart } from '@/hooks/useCart';
import { formatCurrency, isSaleActive } from '@/lib/utils';
import Link from 'next/link';

interface ReviewItem {
  id: string;
  author: string;
  rating: number;
  date: string;
  title: string;
  content: string;
  verified: boolean;
}

export default function ProductDetailContent({
  product,
  relatedProducts,
}: {
  product: Product;
  relatedProducts: Product[];
}) {
  const { addItem } = useCart();

  // Interactive page states
  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState<string | null>('story');

  // Hover Zoom States
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const [isZooming, setIsZooming] = useState(false);

  // Accordion Toggle
  const toggleAccordion = (section: string) => {
    setActiveAccordion(activeAccordion === section ? null : section);
  };

  // Mock initial reviews
  const [reviewsList, setReviewsList] = useState<ReviewItem[]>([
    {
      id: 'rev-1',
      author: 'Aishwarya R.',
      rating: 5,
      date: 'June 10, 2026',
      title: 'Stunning craftsmanship!',
      content: 'I was amazed by the quality of this creation. It sits beautifully as the centerpiece of my dining room table. The details on the handmade ceramic are wonderful.',
      verified: true,
    },
    {
      id: 'rev-2',
      author: 'Kabir S.',
      rating: 4,
      date: 'May 28, 2026',
      title: 'Very elegant, packaged perfectly',
      content: 'Beautiful arrangement! I was worried about shipping a delicate vase, but it was packaged securely with lots of protection. Looks very premium.',
      verified: true,
    },
  ]);

  // Review Form States
  const [newReviewAuthor, setNewReviewAuthor] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewTitle, setNewReviewTitle] = useState('');
  const [newReviewContent, setNewReviewContent] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewAuthor.trim() || !newReviewContent.trim() || !newReviewTitle.trim()) return;

    const newRev: ReviewItem = {
      id: `rev-${Date.now()}`,
      author: newReviewAuthor,
      rating: newReviewRating,
      date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      title: newReviewTitle,
      content: newReviewContent,
      verified: false,
    };

    setReviewsList([newRev, ...reviewsList]);
    setNewReviewAuthor('');
    setNewReviewTitle('');
    setNewReviewContent('');
    setNewReviewRating(5);
    setReviewSubmitted(true);
    setTimeout(() => setReviewSubmitted(false), 4000);
  };

  // Zoom Handler
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y });
  };

  const category = product.category;
  const onSale = isSaleActive(product.sale_price, product.sale_start, product.sale_end);

  return (
    <div className="min-h-screen bg-[#FAFAFA] pt-[100px] pb-24">
      <div className="max-w-[1440px] mx-auto px-6 md:px-16">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-1 text-[12px] uppercase tracking-wider text-[#6B6B6B] mb-8 overflow-x-auto whitespace-nowrap">
          <Link href="/" className="hover:text-[#1A1A1A] transition-colors">Home</Link>
          <ChevronRight size={10} className="text-[#9CA3AF]" />
          <Link href="/products" className="hover:text-[#1A1A1A] transition-colors">Creations</Link>
          {category && (
            <>
              <ChevronRight size={10} className="text-[#9CA3AF]" />
              <Link href={`/products?category=${category.slug}`} className="hover:text-[#1A1A1A] transition-colors">
                {category.name}
              </Link>
            </>
          )}
          <ChevronRight size={10} className="text-[#9CA3AF]" />
          <span className="text-[#1A1A1A] font-medium truncate max-w-[200px]">{product.title}</span>
        </nav>

        {/* Product Main Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start mb-24">
          
          {/* Image Gallery Column (Left) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {/* Main Interactive Zoom Panel */}
            <div 
              className="relative aspect-[4/5] rounded-[16px] overflow-hidden bg-white border border-[#000]/[0.05] cursor-zoom-in"
              onMouseEnter={() => setIsZooming(true)}
              onMouseLeave={() => setIsZooming(false)}
              onMouseMove={handleMouseMove}
            >
              <AnimatePresence mode="wait">
                {product.images && product.images[activeImgIdx] && (
                  <motion.img
                    key={activeImgIdx}
                    src={product.images[activeImgIdx].image_url}
                    alt={product.images[activeImgIdx].alt_text || product.title}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`w-full h-full ${(product.images[activeImgIdx].image_url.includes('creative') || product.images[activeImgIdx].image_url.includes('9_16')) ? 'object-contain p-4' : 'object-cover'}`}
                    style={{
                      transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                      transform: isZooming ? 'scale(1.8)' : 'scale(1)',
                      transition: isZooming ? 'none' : 'transform 0.3s ease'
                    }}
                  />
                )}
              </AnimatePresence>

              {onSale && (
                <div className="absolute top-4 left-4 z-10">
                  <Badge variant="sale">Sale</Badge>
                </div>
              )}
              {product.stock_quantity === 0 && (
                <div className="absolute top-4 left-4 z-10">
                  <Badge variant="outOfStock">Sold Out</Badge>
                </div>
              )}
            </div>

            {/* Thumbnails Row */}
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {product.images.map((img, idx) => (
                  <button
                    key={img.id}
                    onClick={() => setActiveImgIdx(idx)}
                    className={`relative aspect-[4/5] rounded-[10px] overflow-hidden border bg-white transition-all cursor-pointer ${
                      activeImgIdx === idx 
                        ? 'border-[#2563EB] ring-2 ring-[#2563EB]/10' 
                        : 'border-[#000]/[0.06] hover:border-[#000]/[0.2]'
                    }`}
                  >
                    <img 
                      src={img.image_url} 
                      alt={`Thumbnail ${idx + 1}`} 
                      className={`w-full h-full ${(img.image_url.includes('creative') || img.image_url.includes('9_16')) ? 'object-contain p-1' : 'object-cover'}`}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Detail Column (Right) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div>
              {category && (
                <span className="text-[12px] uppercase tracking-[0.15em] text-[#6B6B6B] font-semibold mb-2 block">
                  {category.name}
                </span>
              )}
              <h1 className="text-[32px] md:text-[38px] font-normal text-[#1A1A1A] leading-tight mb-3" style={{ fontFamily: 'var(--font-serif)' }}>
                {product.title}
              </h1>

              {/* Star Rating Overview */}
              <div className="flex items-center gap-2.5">
                <StarRating rating={product.average_rating || 5} />
                <span className="text-[13px] text-[#6B6B6B]">
                  ({product.review_count || 0} reviews)
                </span>
              </div>
            </div>

            {/* Price section */}
            <div className="flex items-baseline gap-4 py-4 border-y border-[#000]/[0.05]">
              {onSale && product.sale_price ? (
                <>
                  <span className="text-[28px] font-semibold text-[#DC2626]">
                    {formatCurrency(product.sale_price)}
                  </span>
                  <span className="text-[18px] text-[#6B6B6B] line-through">
                    {formatCurrency(product.price)}
                  </span>
                </>
              ) : (
                <span className="text-[28px] font-semibold text-[#1A1A1A]">
                  {formatCurrency(product.price)}
                </span>
              )}
            </div>

            <p className="text-[15px] text-[#6B6B6B] leading-relaxed">
              {product.description}
            </p>

            {/* Option A Notice: One-of-a-kind original arrangement */}
            <div className="p-4 rounded-[12px] bg-[#F5F5F0] border border-[#000]/[0.04] flex items-start gap-3">
              <Sparkles size={18} className="text-[#2563EB] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[13px] font-semibold text-[#1A1A1A]">Original Handmade Arrangement</p>
                <p className="text-[12px] text-[#6B6B6B] mt-0.5">
                  Each creation is one-of-a-kind. Handmade with handpicked preserved stems, no two arrangements are identical.
                </p>
              </div>
            </div>

            {/* Quantity Selector & Add to Cart Controls */}
            {product.stock_quantity > 0 ? (
              <div className="flex flex-col gap-4 mt-2">
                <div className="flex items-center gap-4">
                  <span className="text-[13px] uppercase tracking-wider text-[#6B6B6B] font-semibold">Quantity</span>
                  <div className="flex items-center border border-[#000]/[0.08] rounded-[8px] bg-white">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 flex items-center justify-center text-[#1A1A1A] hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-12 text-center text-[14px] font-medium text-[#1A1A1A]">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                      className="w-10 h-10 flex items-center justify-center text-[#1A1A1A] hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <span className="text-[12px] text-[#9CA3AF]">
                    {product.stock_quantity} left in studio
                  </span>
                </div>

                <div className="flex gap-3 mt-2">
                  <Button
                    variant="primary"
                    className="flex-1 py-4 flex items-center justify-center gap-2.5 text-[15px]"
                    onClick={() => addItem(product, quantity)}
                  >
                    <ShoppingBag size={18} /> Add to Cart
                  </Button>
                  
                  <button
                    onClick={() => setIsWishlisted(!isWishlisted)}
                    className={`w-14 h-14 border rounded-[8px] flex items-center justify-center cursor-pointer transition-colors ${
                      isWishlisted 
                        ? 'border-[#DC2626] bg-[#DC2626]/[0.02] text-[#DC2626]' 
                        : 'border-[#000]/[0.08] hover:border-[#1A1A1A] text-[#1A1A1A]'
                    }`}
                  >
                    <Heart size={20} fill={isWishlisted ? '#DC2626' : 'none'} />
                  </button>
                </div>
              </div>
            ) : (
              <Button variant="outline" className="w-full py-4 text-gray-400 cursor-not-allowed" disabled>
                Out of Stock
              </Button>
            )}

            {/* Accordions */}
            <div className="border-t border-[#000]/[0.05] mt-6 pt-4">
              
              {/* Accordion 1: Story */}
              <div className="border-b border-[#000]/[0.05] py-4">
                <button 
                  onClick={() => toggleAccordion('story')}
                  className="w-full flex items-center justify-between font-medium text-[14px] text-[#1A1A1A] cursor-pointer"
                >
                  <span>Artisan Story & Details</span>
                  <ChevronDown size={16} className={`transition-transform duration-300 ${activeAccordion === 'story' ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence initial={false}>
                  {activeAccordion === 'story' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <p className="text-[13px] text-[#6B6B6B] leading-relaxed pt-3">
                        Crafted locally in our studio, Pomelli arrangements represent a meticulous balancing of color, shape, and longevity. Using preserved floral elements set inside hand-crafted vases, they are dried using an organic chemical-free process to ensure that their vibrant texture lasts for years without watering.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Accordion 2: Specs */}
              <div className="border-b border-[#000]/[0.05] py-4">
                <button 
                  onClick={() => toggleAccordion('specs')}
                  className="w-full flex items-center justify-between font-medium text-[14px] text-[#1A1A1A] cursor-pointer"
                >
                  <span>Specifications & Materials</span>
                  <ChevronDown size={16} className={`transition-transform duration-300 ${activeAccordion === 'specs' ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence initial={false}>
                  {activeAccordion === 'specs' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-3 text-[13px] text-[#6B6B6B] space-y-2">
                        <div className="flex justify-between py-1 border-b border-[#000]/[0.02]">
                          <span className="font-medium">SKU</span>
                          <span>{product.sku}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-[#000]/[0.02]">
                          <span className="font-medium">Materials</span>
                          <span>Preserved blossoms, Ceramic/Glass base, natural moss</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-[#000]/[0.02]">
                          <span className="font-medium">Arrangement Dimensions</span>
                          <span>Approx. 35cm x 28cm x 28cm</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="font-medium">Care Instructions</span>
                          <span>Keep out of direct sunlight. Dust lightly. Do not water.</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Accordion 3: Shipping */}
              <div className="border-b border-[#000]/[0.05] py-4">
                <button 
                  onClick={() => toggleAccordion('shipping')}
                  className="w-full flex items-center justify-between font-medium text-[14px] text-[#1A1A1A] cursor-pointer"
                >
                  <span>Safe Shipping & Delivery</span>
                  <ChevronDown size={16} className={`transition-transform duration-300 ${activeAccordion === 'shipping' ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence initial={false}>
                  {activeAccordion === 'shipping' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <p className="text-[13px] text-[#6B6B6B] leading-relaxed pt-3">
                        Delicate vases require supreme packaging. We box our creations inside high-density expandable foam grids to guarantee safe, crack-free transit. Dispatched within 24-48 hours. Express shipping options are calculated during checkout.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>
          </div>
        </div>

        {/* Customer Reviews Section */}
        <section className="mb-24 pt-16 border-t border-[#000]/[0.05]">
          <h2 className="text-[24px] font-normal mb-8 text-[#1A1A1A]" style={{ fontFamily: 'var(--font-serif)' }}>
            Customer Reviews
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left Column: Review Overview */}
            <div className="lg:col-span-4 bg-white border border-[#000]/[0.05] rounded-[16px] p-6 shadow-sm">
              <div className="text-center mb-6">
                <h3 className="text-[44px] font-bold text-[#1A1A1A] leading-none mb-2">
                  {product.average_rating || 5.0}
                </h3>
                <div className="flex justify-center mb-2">
                  <StarRating rating={product.average_rating || 5} />
                </div>
                <p className="text-[13px] text-[#6B6B6B]">Based on {reviewsList.length} reviews</p>
              </div>

              {/* Progress bars */}
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((stars) => {
                  const count = reviewsList.filter((r) => Math.floor(r.rating) === stars).length;
                  const pct = reviewsList.length > 0 ? (count / reviewsList.length) * 100 : 0;
                  return (
                    <div key={stars} className="flex items-center gap-3 text-[12px] text-[#6B6B6B]">
                      <span className="w-3">{stars}</span>
                      <Star size={11} className="fill-[#2563EB] text-[#2563EB] flex-shrink-0" />
                      <div className="flex-1 h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
                        <div className="h-full bg-[#2563EB] rounded-full" style={{ width: `${pct}%` }}></div>
                      </div>
                      <span className="w-6 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Reviews List & Write Review form */}
            <div className="lg:col-span-8 flex flex-col gap-8">
              
              {/* Write review form */}
              <div className="border border-[#000]/[0.05] rounded-[16px] bg-white p-6 shadow-sm">
                <h3 className="text-[15px] font-semibold text-[#1A1A1A] mb-4">Write a Review</h3>
                
                {reviewSubmitted && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-[13px] flex items-center gap-2">
                    <ShieldCheck size={16} /> Thank you! Your review has been added to our catalog.
                  </div>
                )}

                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[12px] uppercase tracking-wider text-[#6B6B6B] mb-1.5 font-medium">Your Name</label>
                      <input 
                        type="text" 
                        required
                        value={newReviewAuthor}
                        onChange={(e) => setNewReviewAuthor(e.target.value)}
                        placeholder="John Doe"
                        className="w-full h-11 px-3.5 py-2.5 rounded-[8px] bg-[#FAFAFA] border border-[#000]/[0.08] text-[13px] focus:outline-none focus:border-[#2563EB]"
                      />
                    </div>
                    <div>
                      <label className="block text-[12px] uppercase tracking-wider text-[#6B6B6B] mb-1.5 font-medium">Rating</label>
                      <div className="flex h-11 items-center gap-1.5">
                        {[1, 2, 3, 4, 5].map((val) => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setNewReviewRating(val)}
                            className="text-[#2563EB] hover:scale-110 transition-transform cursor-pointer"
                          >
                            <Star size={20} fill={newReviewRating >= val ? '#2563EB' : 'none'} />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[12px] uppercase tracking-wider text-[#6B6B6B] mb-1.5 font-medium">Review Title</label>
                    <input 
                      type="text" 
                      required
                      value={newReviewTitle}
                      onChange={(e) => setNewReviewTitle(e.target.value)}
                      placeholder="e.g. Gorgeous centerpiece!"
                      className="w-full h-11 px-3.5 py-2.5 rounded-[8px] bg-[#FAFAFA] border border-[#000]/[0.08] text-[13px] focus:outline-none focus:border-[#2563EB]"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] uppercase tracking-wider text-[#6B6B6B] mb-1.5 font-medium">Review Comments</label>
                    <textarea 
                      required
                      rows={3}
                      value={newReviewContent}
                      onChange={(e) => setNewReviewContent(e.target.value)}
                      placeholder="Share your thoughts about this custom arrangement..."
                      className="w-full px-3.5 py-2.5 rounded-[8px] bg-[#FAFAFA] border border-[#000]/[0.08] text-[13px] focus:outline-none focus:border-[#2563EB] resize-none"
                    />
                  </div>

                  <Button type="submit" variant="primary" className="py-2.5 px-6 text-[13px]">
                    Submit Review
                  </Button>
                </form>
              </div>

              {/* Reviews list */}
              <div className="space-y-6">
                {reviewsList.map((rev) => (
                  <div key={rev.id} className="border-b border-[#000]/[0.05] pb-6">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <span className="font-semibold text-[14px] text-[#1A1A1A]">{rev.author}</span>
                        {rev.verified && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] uppercase tracking-wider text-green-700 bg-green-50 px-2 py-0.5 rounded-full font-medium">
                            <ShieldCheck size={10} /> Verified Purchase
                          </span>
                        )}
                      </div>
                      <span className="text-[12px] text-[#9CA3AF]">{rev.date}</span>
                    </div>

                    <div className="flex items-center gap-1.5 mb-2.5">
                      <StarRating rating={rev.rating} />
                    </div>

                    <h4 className="text-[14px] font-semibold text-[#1A1A1A] mb-1">{rev.title}</h4>
                    <p className="text-[13px] text-[#6B6B6B] leading-relaxed">{rev.content}</p>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </section>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <section className="pt-16 border-t border-[#000]/[0.05]">
            <h2 className="text-[24px] font-normal mb-8 text-[#1A1A1A]" style={{ fontFamily: 'var(--font-serif)' }}>
              Related Creations
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((p, idx) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  index={idx}
                  onAddToCart={(prod) => addItem(prod)}
                />
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
