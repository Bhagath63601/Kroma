'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag, Percent, ArrowLeft, Tag } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { formatCurrency, getEffectivePrice, isSaleActive } from '@/lib/utils';
import Button from '@/components/ui/Button';

const FREE_SHIPPING_THRESHOLD = 3000;

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal, itemCount } = useCart();
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discountPercent: number } | null>(null);
  const [promoError, setPromoError] = useState('');
  const [shippingCost, setShippingCost] = useState(150);

  // Sync shipping cost depending on free shipping threshold
  useEffect(() => {
    if (subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0) {
      setShippingCost(0);
    } else {
      setShippingCost(150);
    }
  }, [subtotal]);

  // Load promo code from session if exists
  useEffect(() => {
    const savedPromo = sessionStorage.getItem('kroma_promo');
    if (savedPromo) {
      try {
        setAppliedPromo(JSON.parse(savedPromo));
      } catch {
        // Ignore parsing errors
      }
    }
  }, []);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError('');
    const code = promoCode.trim().toUpperCase();

    if (!code) return;

    // Standard coupons simulation
    const coupons: Record<string, number> = {
      'WELCOME10': 10,
      'ARTISAN20': 20,
      'KROMA15': 15,
    };

    if (coupons[code]) {
      const discountPercent = coupons[code];
      const promoObj = { code, discountPercent };
      setAppliedPromo(promoObj);
      sessionStorage.setItem('kroma_promo', JSON.stringify(promoObj));
      setPromoCode('');
    } else {
      setPromoError('Invalid coupon code. Try WELCOME10 (10%), KROMA15 (15%), or ARTISAN20 (20%)');
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    sessionStorage.removeItem('kroma_promo');
  };

  const discountAmount = appliedPromo ? (subtotal * appliedPromo.discountPercent) / 100 : 0;
  const total = Math.max(0, subtotal - discountAmount + shippingCost);

  // Free shipping progress variables
  const distance = FREE_SHIPPING_THRESHOLD - subtotal;
  const progressPercent = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100);

  // Helper to resolve effective price of an item
  const getItemPrice = (item: any) => {
    const prod = item.product;
    const saleActive = isSaleActive(prod.sale_price, prod.sale_start, prod.sale_end);
    const itemUnit = saleActive && prod.sale_price ? prod.sale_price : prod.price;
    return item.variant?.price ?? itemUnit;
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] pt-[120px] pb-24 flex items-center justify-center">
        <div className="text-center p-8 md:p-12 bg-white border border-[#000]/[0.05] rounded-[32px] max-w-[500px] shadow-sm flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-[#F5F5F0] flex items-center justify-center text-[28px] mb-6 animate-bounce">
            🏺
          </div>
          <h1 className="text-[24px] font-normal mb-3 text-[#1A1A1A]" style={{ fontFamily: 'var(--font-serif)' }}>
            Your Cart is Empty
          </h1>
          <p className="text-[14px] text-[#6B6B6B] mb-8 leading-relaxed max-w-[340px]">
            Explore our curated arrangements and discover the beauty of handcrafted ceramic vases.
          </p>
          <Link href="/products">
            <Button variant="primary" size="lg">
              <ArrowLeft size={16} /> Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] pt-[120px] pb-24">
      <div className="max-w-[1440px] mx-auto px-6 md:px-16">
        {/* Page title */}
        <div className="mb-10">
          <Link href="/products" className="inline-flex items-center gap-1.5 text-[12px] uppercase tracking-widest text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors mb-4">
            <ArrowLeft size={14} /> Back to Catalog
          </Link>
          <h1 className="text-[36px] md:text-[48px] font-normal text-[#1A1A1A]" style={{ fontFamily: 'var(--font-serif)' }}>
            Shopping Cart ({itemCount})
          </h1>
        </div>

        {/* Shipping Progression Bar */}
        <div className="bg-white border border-[#000]/[0.05] rounded-[16px] p-5 mb-8 shadow-sm">
          {subtotal < FREE_SHIPPING_THRESHOLD ? (
            <p className="text-[14px] text-[#1A1A1A] mb-3">
              You are just <span className="font-semibold">{formatCurrency(distance)}</span> away from <span className="font-semibold">Free Shipping</span>!
            </p>
          ) : (
            <p className="text-[14px] text-green-700 font-medium mb-3 flex items-center gap-1.5">
              🎉 Congratulations! Your order qualifies for Free Shipping.
            </p>
          )}
          <div className="w-full h-2 bg-[#F5F5F0] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className={`h-full ${subtotal >= FREE_SHIPPING_THRESHOLD ? 'bg-green-600' : 'bg-[#2563EB]'}`}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence initial={false}>
              {items.map((item) => {
                const itemPrice = getItemPrice(item);
                const displayImage = item.product.images?.[0]?.image_url || '/samples/1/pomelli_photoshoot-1.png';

                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 bg-white border border-[#000]/[0.05] rounded-[16px] gap-4 shadow-sm group hover:border-[#000]/[0.1] transition-all"
                  >
                    <div className="flex gap-4 items-center">
                      {/* Product Thumbnail */}
                      <Link href={`/products/${item.product.slug}`} className="w-20 h-20 rounded-[12px] overflow-hidden bg-[#F5F5F0] flex-shrink-0 border border-[#000]/[0.05]">
                        <img
                          src={displayImage}
                          alt={item.product.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </Link>

                      {/* Product Title and Details */}
                      <div>
                        <Link href={`/products/${item.product.slug}`} className="font-normal text-[16px] text-[#1A1A1A] hover:text-[#2563EB] transition-colors leading-snug block">
                          {item.product.title}
                        </Link>
                        {item.variant && (
                          <p className="text-[12px] text-[#6B6B6B] mt-1">
                            Style: {item.variant.option_values.map(ov => ov.value).join(', ')}
                          </p>
                        )}
                        <p className="text-[14px] font-semibold text-[#1A1A1A] mt-1.5 sm:hidden">
                          {formatCurrency(itemPrice)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between w-full sm:w-auto gap-8 sm:gap-6 pt-3 sm:pt-0 border-t sm:border-0 border-gray-100">
                      {/* Quantity Selector */}
                      <div className="flex items-center border border-[#000]/[0.08] rounded-full p-1 bg-[#FAFAFA]">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white transition-colors cursor-pointer text-[#6B6B6B]"
                        >
                          <Minus size={13} />
                        </button>
                        <span className="w-8 text-center text-[13px] font-semibold text-[#1a1a1a]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white transition-colors cursor-pointer text-[#6B6B6B]"
                        >
                          <Plus size={13} />
                        </button>
                      </div>

                      {/* Total Price and Remove Button */}
                      <div className="flex items-center gap-4">
                        <span className="hidden sm:block font-semibold text-[15px] text-[#1A1A1A] w-[90px] text-right">
                          {formatCurrency(itemPrice * item.quantity)}
                        </span>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-2 text-[#9CA3AF] hover:text-red-600 rounded-full hover:bg-red-50 transition-all cursor-pointer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Cart Summary Side Card */}
          <div className="space-y-6">
            <div className="bg-white border border-[#000]/[0.05] rounded-[24px] p-6 shadow-sm sticky top-[100px]">
              <h3 className="text-[18px] font-semibold mb-5 text-[#1A1A1A]">Order Summary</h3>

              {/* Order breakdown details */}
              <div className="space-y-4 text-[14px] pb-5 border-b border-[#000]/[0.05]">
                <div className="flex justify-between text-[#6B6B6B]">
                  <span>Subtotal</span>
                  <span className="text-[#1A1A1A] font-medium">{formatCurrency(subtotal)}</span>
                </div>

                {appliedPromo && (
                  <div className="flex justify-between text-green-700 items-center">
                    <span className="flex items-center gap-1">
                      <Tag size={13} /> Coupon Discount ({appliedPromo.code})
                    </span>
                    <span>-{formatCurrency(discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-[#6B6B6B]">
                  <span>Shipping</span>
                  {shippingCost === 0 ? (
                    <span className="text-green-700 font-medium">FREE</span>
                  ) : (
                    <span className="text-[#1A1A1A] font-medium">{formatCurrency(shippingCost)}</span>
                  )}
                </div>
              </div>

              {/* Total Summary */}
              <div className="flex justify-between items-end my-5">
                <span className="text-[15px] font-medium text-[#1A1A1A]">Grand Total</span>
                <div className="text-right">
                  <span className="text-[22px] font-bold text-[#1A1A1A] block leading-none">
                    {formatCurrency(total)}
                  </span>
                  <span className="text-[11px] text-[#9CA3AF] mt-1 block">Inclusive of GST</span>
                </div>
              </div>

              {/* Promo Code Input Form */}
              <form onSubmit={handleApplyPromo} className="mb-6">
                <label className="block text-[12px] uppercase tracking-wider text-[#6B6B6B] mb-2 font-medium">
                  Apply Promo Code
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="e.g. WELCOME10"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="w-full h-10 px-3 border border-[#000]/[0.08] rounded-[8px] text-[13px] uppercase outline-none focus:border-[#2563EB] transition-colors"
                    />
                    <Percent size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                  </div>
                  <Button type="submit" variant="outline" className="h-10 text-[13px] px-4">
                    Apply
                  </Button>
                </div>
                {promoError && (
                  <p className="text-[11px] text-red-600 mt-2 leading-relaxed">{promoError}</p>
                )}
                {appliedPromo && (
                  <div className="flex items-center justify-between mt-3 bg-green-50 border border-green-200/50 rounded-[8px] px-3 py-1.5">
                    <span className="text-[12px] text-green-800 font-medium flex items-center gap-1">
                      ✓ Coupon Applied: {appliedPromo.code}
                    </span>
                    <button
                      type="button"
                      onClick={handleRemovePromo}
                      className="text-[11px] text-green-700 hover:text-red-600 font-semibold cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </form>

              {/* Proceed to checkout link */}
              <Link href="/checkout" className="block w-full">
                <Button variant="primary" className="w-full py-3 h-12 text-[14px]" shimmer>
                  Proceed to Checkout <ArrowRight size={16} />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
