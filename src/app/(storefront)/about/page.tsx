'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

export default function AboutPage() {
  const staggerContainer: any = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const fadeInUp: any = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#1A1A1A]">
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden bg-[#F5F5F0]">
        <div className="absolute inset-0 z-0 opacity-40">
          <Image
            src="https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=2000"
            alt="Handcrafted Ceramic Vases"
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="relative z-10 text-center px-6 max-w-3xl">
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-[12px] tracking-[0.2em] uppercase text-gray-500 mb-4 font-bold"
          >
            OUR STORY
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-[44px] md:text-[60px] font-normal leading-tight tracking-tight text-gray-900"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            Artisanal Vases for the Modern Home
          </motion.h1>
        </div>
      </section>

      {/* Brand Philosophy */}
      <section className="max-w-[1440px] mx-auto px-6 md:px-16 py-24 md:py-32">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
        >
          <motion.div variants={fadeInUp} className="space-y-8">
            <h2
              className="text-[32px] md:text-[42px] font-normal leading-tight"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              Curated elegance, designed to transcend time.
            </h2>
            <p className="text-[16px] text-[#6B6B6B] leading-relaxed">
              At Kroma, we believe that everyday objects should inspire. We partner with master ceramists and artisans worldwide to curate a collection of exceptional flower vases that balance sculptural presence with functional beauty.
            </p>
            <p className="text-[16px] text-[#6B6B6B] leading-relaxed">
              Every vase in our collection is selected for its unique story, organic texture, and dedication to details. From minimal contemporary silhouettes to rustic hand-thrown clay vessels, our pieces are intended to elevate your living space, whether filled with fresh blooms or standing as standalone art.
            </p>
          </motion.div>

          <motion.div variants={fadeInUp} className="relative aspect-square w-full rounded-[24px] overflow-hidden border border-[rgba(0,0,0,0.06)] shadow-md">
            <Image
              src="https://images.unsplash.com/photo-1578500494198-246f612d3b3d?auto=format&fit=crop&q=80&w=1000"
              alt="Meticulous artisan craftsmanship"
              fill
              className="object-cover hover:scale-105 transition-transform duration-[1.5s]"
            />
          </motion.div>
        </motion.div>
      </section>

      {/* Grid Highlights */}
      <section className="bg-[#F5F5F0] py-24 md:py-32">
        <div className="max-w-[1440px] mx-auto px-6 md:px-16">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-100px' }}
            className="grid grid-cols-1 md:grid-cols-3 gap-12"
          >
            <motion.div variants={fadeInUp} className="space-y-4">
              <span className="text-[36px] font-light text-[#2563EB]" style={{ fontFamily: 'var(--font-serif)' }}>01.</span>
              <h3 className="text-[20px] font-medium" style={{ fontFamily: 'var(--font-serif)' }}>Sustainably Handcrafted</h3>
              <p className="text-[14.5px] text-[#6B6B6B] leading-relaxed">
                We work exclusively with independent artisans who use traditional wood-firing and solar-powered kilns, minimizing environmental footprint while maintaining authentic craft heritage.
              </p>
            </motion.div>

            <motion.div variants={fadeInUp} className="space-y-4">
              <span className="text-[36px] font-light text-[#2563EB]" style={{ fontFamily: 'var(--font-serif)' }}>02.</span>
              <h3 className="text-[20px] font-medium" style={{ fontFamily: 'var(--font-serif)' }}>Unique Formations</h3>
              <p className="text-[14.5px] text-[#6B6B6B] leading-relaxed">
                Because each vase is thrown, glazed, and finished individually by hand, no two items are exactly identical. You receive a unique piece of functional art.
              </p>
            </motion.div>

            <motion.div variants={fadeInUp} className="space-y-4">
              <span className="text-[36px] font-light text-[#2563EB]" style={{ fontFamily: 'var(--font-serif)' }}>03.</span>
              <h3 className="text-[20px] font-medium" style={{ fontFamily: 'var(--font-serif)' }}>Lifetime Guarantee</h3>
              <p className="text-[14.5px] text-[#6B6B6B] leading-relaxed">
                We design and select our products with premium clays and double-glazing, built to withstand water exposure, temperature fluctuations, and the test of generations.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
