'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight, Send } from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import ProductCard from '@/components/storefront/ProductCard';
import StarRating from '@/components/ui/StarRating';
import { useCart } from '@/hooks/useCart';
import { SAMPLE_TESTIMONIALS, TRUST_BADGES } from '@/lib/sample-data';
import type { Product, Category, HeroSlide } from '@/types';

// ============================================================
// Hero Section
// ============================================================
function HeroSection({ slides }: { slides: HeroSlide[] }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = useCallback(() => {
    if (!slides || slides.length === 0) return;
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [slides?.length]);

  useEffect(() => {
    if (!slides || slides.length === 0) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [nextSlide, slides]);

  if (!slides || slides.length === 0) {
    return <section className="relative h-[85vh] min-h-[600px] bg-[#F5F5F0] overflow-hidden" />;
  }

  const words = slides[currentSlide]?.heading?.split(' ') || [];

  return (
    <section className="relative h-[85vh] min-h-[600px] bg-[#F5F5F0] overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          className="absolute inset-0"
        >
          <div
            className="w-full h-full"
            style={{
              background: [
                'linear-gradient(135deg, #f8f4f0 0%, #e8ddd4 30%, #d4c8bb 60%, #c4b5a4 100%)',
                'linear-gradient(135deg, #f0f4f0 0%, #d4ddd4 30%, #b8c8b8 60%, #a4b5a4 100%)',
                'linear-gradient(135deg, #f0f0f8 0%, #d4d4e8 30%, #b8b8d4 60%, #a4a4c4 100%)',
              ][currentSlide],
            }}
          />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 h-full max-w-[1440px] mx-auto px-6 md:px-16 flex items-center">
        <div className="max-w-2xl">
          <AnimatePresence mode="wait">
            <motion.div key={currentSlide}>
              <h2 className="text-[48px] md:text-[72px] leading-[1.1] mb-6" style={{ fontFamily: 'var(--font-serif)' }}>
                {words.map((word, i) => (
                  <motion.span
                    key={`${currentSlide}-${i}`}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.15, duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
                    className="inline-block mr-[0.3em]"
                  >
                    {word}
                  </motion.span>
                ))}
              </h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="text-[16px] md:text-[18px] text-[#6B6B6B] mb-8 leading-relaxed"
                style={{ maxWidth: '480px' }}
              >
                {slides[currentSlide].subheading}
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
              >
                <Link href={slides[currentSlide].cta_link || '/products'}>
                  <Button variant="primary" size="xl" shimmer>
                    {slides[currentSlide].cta_text || 'Shop Now'}
                    <ArrowRight size={18} />
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-6">
        <button
          onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
          className="w-10 h-10 rounded-full border border-[rgba(0,0,0,0.15)] bg-white/60 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors cursor-pointer"
        >
          <ChevronLeft size={18} />
        </button>
        <div className="flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className="cursor-pointer"
            >
              <motion.div
                className="h-[3px] rounded-full bg-[#1A1A1A]"
                animate={{
                  width: i === currentSlide ? 32 : 12,
                  opacity: i === currentSlide ? 1 : 0.3,
                }}
                transition={{ duration: 0.3 }}
              />
            </button>
          ))}
        </div>
        <button
          onClick={nextSlide}
          className="w-10 h-10 rounded-full border border-[rgba(0,0,0,0.15)] bg-white/60 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors cursor-pointer"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="absolute right-[10%] top-1/2 -translate-y-1/2 hidden lg:block">
        <motion.div
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="text-[200px] opacity-20 select-none"
          style={{ filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.1))' }}
        >
          🏺
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================
// Featured Categories
// ============================================================
function FeaturedCategories({ categories }: { categories: Category[] }) {
  const categoryGradients = [
    'linear-gradient(135deg, #fce4ec 0%, #f8bbd0 100%)',
    'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
    'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)',
    'linear-gradient(135deg, #fff3e0 0%, #ffcc80 100%)',
  ];

  return (
    <section className="py-20 md:py-[120px]">
      <div className="max-w-[1440px] mx-auto px-6 md:px-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="text-[12px] uppercase tracking-[0.15em] text-[#9CA3AF] mb-3">
            Browse by Style
          </p>
          <h2 className="text-[36px] md:text-[44px]" style={{ fontFamily: 'var(--font-serif)' }}>
            Our Collections
          </h2>
        </motion.div>

        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin -mx-6 px-6 md:mx-0 md:px-0 md:grid md:grid-cols-4 md:overflow-visible">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.6 }}
              className="flex-shrink-0 w-[200px] md:w-auto"
            >
              <Link href={`/products?category=${cat.slug}`} className="group block">
                <div
                  className="aspect-[3/4] rounded-[16px] overflow-hidden mb-3 flex items-center justify-center relative"
                  style={{ background: categoryGradients[i % categoryGradients.length] }}
                >
                  <motion.div
                    whileHover={{ scale: 1.08 }}
                    transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                    className="text-[64px]"
                  >
                    {['🧺', '🖼️', '⭕', '🏺'][i % 4]}
                  </motion.div>
                </div>
                <h3 className="text-[14px] font-medium text-center text-[#1A1A1A] group-hover:text-[#2563EB] transition-colors">
                  {cat.name}
                </h3>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================
// Product Grid Section
// ============================================================
function ProductGridSection({
  title,
  subtitle,
  products,
  ctaText,
  ctaHref,
}: {
  title: string;
  subtitle: string;
  products: Product[];
  ctaText?: string;
  ctaHref?: string;
}) {
  const { addItem } = useCart();

  return (
    <section className="py-16 md:py-20">
      <div className="max-w-[1440px] mx-auto px-6 md:px-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-10"
        >
          <div>
            <p className="text-[12px] uppercase tracking-[0.15em] text-[#9CA3AF] mb-3">
              {subtitle}
            </p>
            <h2 className="text-[32px] md:text-[40px]" style={{ fontFamily: 'var(--font-serif)' }}>
              {title}
            </h2>
          </div>
          {ctaText && ctaHref && (
            <Link
              href={ctaHref}
              className="mt-4 md:mt-0 inline-flex items-center gap-2 text-[13px] uppercase tracking-[0.08em] text-[#2563EB] hover:text-[#1D4ED8] font-medium transition-colors group"
            >
              {ctaText}
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          )}
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {products.map((product, i) => (
            <ProductCard
              key={product.id}
              product={product}
              index={i}
              onAddToCart={(p) => addItem(p)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================
// Promotional Banner
// ============================================================
function PromoBanner() {
  return (
    <section className="py-16 md:py-20">
      <div className="max-w-[1440px] mx-auto px-6 md:px-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-[20px] overflow-hidden relative"
          style={{
            background: 'linear-gradient(135deg, #1A1A1A 0%, #2d2d2d 50%, #1A1A1A 100%)',
            minHeight: '300px',
          }}
        >
          <div className="p-8 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-white text-center md:text-left max-w-lg">
              <p className="text-[12px] uppercase tracking-[0.2em] text-white/50 mb-4">
                Limited Edition
              </p>
              <h2
                className="text-[32px] md:text-[44px] leading-[1.1] mb-4"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                The Artisan's Reserve
              </h2>
              <p className="text-[15px] text-white/60 mb-6 leading-relaxed">
                Exclusive hand-signed pieces from our master ceramists. Only 50 pieces available worldwide.
              </p>
              <Link href="/products?category=luxury-collection">
                <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10 hover:text-white">
                  Discover Now <ArrowRight size={16} />
                </Button>
              </Link>
            </div>
            <div className="text-[120px] md:text-[180px] opacity-30 select-none">
              ✨
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================
// Testimonials
// ============================================================
function Testimonials() {
  return (
    <section className="py-16 md:py-20 bg-[#F5F5F0]">
      <div className="max-w-[1440px] mx-auto px-6 md:px-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="text-[12px] uppercase tracking-[0.15em] text-[#9CA3AF] mb-3">
            What Our Customers Say
          </p>
          <h2 className="text-[32px] md:text-[40px]" style={{ fontFamily: 'var(--font-serif)' }}>
            Loved by Many
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SAMPLE_TESTIMONIALS.map((testimonial, i) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className="bg-white rounded-[16px] p-8 border border-[rgba(0,0,0,0.06)]"
              style={{ boxShadow: 'var(--shadow-card)' }}
            >
              <StarRating rating={testimonial.rating} size={14} />
              <p className="text-[15px] text-[#1A1A1A] mt-4 mb-6 leading-relaxed italic">
                &ldquo;{testimonial.text}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#F5F5F0] flex items-center justify-center text-[14px] font-semibold text-[#6B6B6B]">
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <p className="text-[14px] font-medium">{testimonial.name}</p>
                  <p className="text-[12px] text-[#9CA3AF]">Verified Buyer</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================
// Trust Badges
// ============================================================
function TrustSection() {
  return (
    <section className="py-16 border-y border-[rgba(0,0,0,0.06)]">
      <div className="max-w-[1440px] mx-auto px-6 md:px-16">
        <div className="flex overflow-x-auto gap-8 md:gap-0 md:grid md:grid-cols-6 md:overflow-visible">
          {TRUST_BADGES.map((badge, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="flex-shrink-0 flex flex-col items-center text-center gap-2 px-4"
            >
              <span className="text-[28px]">{badge.icon}</span>
              <span className="text-[12px] uppercase tracking-[0.08em] text-[#6B6B6B] font-medium whitespace-nowrap">
                {badge.text}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================
// Newsletter Section
// ============================================================
function Newsletter() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      setEmail('');
      setTimeout(() => setSubmitted(false), 3000);
    }
  };

  return (
    <section className="py-20 md:py-[120px]">
      <div className="max-w-[1440px] mx-auto px-6 md:px-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto text-center"
        >
          <p className="text-[12px] uppercase tracking-[0.15em] text-[#9CA3AF] mb-3">
            Stay Inspired
          </p>
          <h2
            className="text-[32px] md:text-[40px] mb-4"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            Join Our World
          </h2>
          <p className="text-[15px] text-[#6B6B6B] mb-8 leading-relaxed">
            Subscribe for early access to new collections, artisan stories, and exclusive offers.
          </p>

          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="flex-1 h-12 px-5 bg-white border border-[rgba(0,0,0,0.1)] rounded-[8px] text-[15px] outline-none focus:border-[#2563EB] transition-colors"
              required
            />
            <motion.button
              type="submit"
              whileTap={{ scale: 0.97 }}
              className="h-12 px-6 bg-[#2563EB] text-white rounded-[8px] font-medium text-[14px] flex items-center gap-2 cursor-pointer hover:bg-[#1D4ED8] transition-colors"
            >
              <AnimatePresence mode="wait">
                {submitted ? (
                  <motion.span
                    key="done"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    ✓ Subscribed!
                  </motion.span>
                ) : (
                  <motion.span
                    key="submit"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    Subscribe <Send size={14} />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </form>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================
// Homepage Content Component
// ============================================================
export default function HomeContent({
  initialSlides,
  initialCategories,
  initialProducts,
}: {
  initialSlides: HeroSlide[];
  initialCategories: Category[];
  initialProducts: Product[];
}) {
  const [slides] = useState<HeroSlide[]>(initialSlides);
  const [categories] = useState<Category[]>(initialCategories);
  const [products] = useState<Product[]>(initialProducts);

  const newArrivals = useMemo(() => {
    return [...products]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 4);
  }, [products]);

  const bestSellers = useMemo(() => {
    return [...products]
      .sort((a, b) => (b.total_orders || 0) - (a.total_orders || 0))
      .slice(0, 4);
  }, [products]);

  return (
    <>
      <HeroSection slides={slides} />
      <TrustSection />
      <FeaturedCategories categories={categories} />
      <ProductGridSection
        title="New Arrivals"
        subtitle="Just In"
        products={newArrivals}
        ctaText="View All"
        ctaHref="/products?sort=newest"
      />
      <PromoBanner />
      <ProductGridSection
        title="Best Sellers"
        subtitle="Customer Favorites"
        products={bestSellers}
        ctaText="Shop All"
        ctaHref="/products?sort=best_selling"
      />
      <Testimonials />
      <Newsletter />
    </>
  );
}
