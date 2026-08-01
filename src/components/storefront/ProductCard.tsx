'use client';

import { motion } from 'framer-motion';
import { Heart, ShoppingBag } from 'lucide-react';
import { useState } from 'react';
import type { Product } from '@/types';
import { formatCurrency, isSaleActive, calcDiscount } from '@/lib/utils';
import Badge from '@/components/ui/Badge';
import StarRating from '@/components/ui/StarRating';
import Link from 'next/link';
import { SAMPLE_CATEGORIES } from '@/lib/sample-data';

interface ProductCardProps {
  product: Product;
  index?: number;
  onAddToCart?: (product: Product) => void;
  onToggleWishlist?: (productId: string) => void;
  isWishlisted?: boolean;
}

export default function ProductCard({
  product,
  index = 0,
  onAddToCart,
  onToggleWishlist,
  isWishlisted = false,
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const onSale = isSaleActive(product.sale_price, product.sale_start, product.sale_end);
  const effectivePrice = onSale && product.sale_price ? product.sale_price : product.price;
  const discount = onSale && product.sale_price ? calcDiscount(product.price, product.sale_price) : 0;
  const mainImage = product.images?.[0]?.image_url;
  const hoverImage = product.images?.[1]?.image_url;
  const isCampaignImage = mainImage?.includes('creative') || mainImage?.includes('9_16');
  const isNew = new Date(product.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const outOfStock = product.stock_quantity === 0;
  const category = product.category || SAMPLE_CATEGORIES.find((c) => c.id === product.category_id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, delay: index * 0.08, ease: [0.25, 0.1, 0.25, 1] }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative"
    >
      {/* Image Container */}
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-[3/4] rounded-[12px] overflow-hidden bg-[#F5F5F0] mb-3">
          {/* Main Image */}
          {mainImage && (
            <motion.div
              animate={{ scale: isHovered ? 1.05 : 1 }}
              transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
              className="absolute inset-0"
            >
              {/* Gradient placeholder for demo */}
              <div
                className="w-full h-full"
                style={{
                  background: imgLoaded
                     ? undefined
                    : 'linear-gradient(135deg, #f5f5f0 0%, #e8e8e0 50%, #f0f0e8 100%)',
                }}
              >
                <img
                  src={mainImage}
                  alt={product.images?.[0]?.alt_text || product.title}
                  className={`w-full h-full ${isCampaignImage ? 'object-contain p-2' : 'object-cover'}`}
                  onLoad={() => setImgLoaded(true)}
                  onError={(e) => {
                    // Use a colored gradient as fallback
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            </motion.div>
          )}

          {/* Hover Image Crossfade */}
          {hoverImage && (
            <motion.div
              className="absolute inset-0"
              animate={{ opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.5 }}
            >
              <img
                src={hoverImage}
                alt={product.images?.[1]?.alt_text || `${product.title} alternate`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </motion.div>
          )}

          {/* Demo gradient overlay for products without real images */}
          {!mainImage && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center p-4">
                <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-white/50 flex items-center justify-center">
                  <span className="text-3xl">🏺</span>
                </div>
                <p className="text-[12px] text-[#9CA3AF] uppercase tracking-[0.1em]">{product.title}</p>
              </div>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
            {isNew && <Badge variant="new">New</Badge>}
            {onSale && <Badge variant="sale">-{discount}%</Badge>}
            {outOfStock && <Badge variant="outOfStock">Sold Out</Badge>}
          </div>

          {/* Wishlist Button */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center cursor-pointer shadow-sm"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleWishlist?.(product.id);
            }}
            whileTap={{ scale: 0.85 }}
          >
            <Heart
              size={16}
              fill={isWishlisted ? '#DC2626' : 'none'}
              color={isWishlisted ? '#DC2626' : '#1A1A1A'}
            />
          </motion.button>

          {/* Quick Add Button */}
          {!outOfStock && (
            <motion.button
              initial={{ y: 20, opacity: 0 }}
              animate={{
                y: isHovered ? 0 : 20,
                opacity: isHovered ? 1 : 0,
              }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="absolute bottom-3 left-3 right-3 z-10 py-2.5 bg-white/95 backdrop-blur-sm rounded-[8px] text-[13px] font-semibold text-[#1A1A1A] cursor-pointer flex items-center justify-center gap-2 hover:bg-white transition-colors shadow-sm"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onAddToCart?.(product);
              }}
            >
              <ShoppingBag size={14} />
              Quick Add
            </motion.button>
          )}
        </div>
      </Link>

      {/* Product Info */}
      <div className="space-y-1">
        {category && (
          <p className="text-[11px] uppercase tracking-[0.1em] text-[#9CA3AF]">
            {category.name}
          </p>
        )}
        <Link href={`/products/${product.slug}`}>
          <h3 className="text-[15px] font-medium text-[#1A1A1A] hover:text-[#2563EB] transition-colors line-clamp-1">
            {product.title}
          </h3>
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-[15px] font-semibold text-[#1A1A1A]">
            {formatCurrency(effectivePrice)}
          </span>
          {onSale && (
            <span className="text-[13px] text-[#9CA3AF] line-through">
              {formatCurrency(product.price)}
            </span>
          )}
        </div>
        {product.average_rating !== undefined && product.average_rating > 0 && (
          <div className="flex items-center gap-1.5">
            <StarRating rating={product.average_rating} size={12} />
            <span className="text-[11px] text-[#9CA3AF]">
              ({product.review_count})
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
