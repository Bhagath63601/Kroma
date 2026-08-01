'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, ShoppingBag, ArrowRight, Trash2 } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { formatCurrency } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Link from 'next/link';

export default function CartDrawer() {
  const {
    items,
    removeItem,
    updateQuantity,
    subtotal,
    itemCount,
    isCartOpen,
    setIsCartOpen,
  } = useCart();

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[150] bg-black/40 backdrop-blur-sm"
            onClick={() => setIsCartOpen(false)}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 bottom-0 z-[151] w-full max-w-md bg-white shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-[rgba(0,0,0,0.06)]">
              <div className="flex items-center gap-2">
                <ShoppingBag size={20} />
                <h2 className="text-[18px] font-semibold">Your Cart</h2>
                <span className="text-[13px] text-[#6B6B6B]">({itemCount})</span>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 hover:bg-[#F5F5F0] rounded-full transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <div className="w-24 h-24 rounded-full bg-[#F5F5F0] flex items-center justify-center mb-6">
                    <ShoppingBag size={32} className="text-[#9CA3AF]" />
                  </div>
                  <h3 className="text-[18px] font-medium mb-2">Your cart is empty</h3>
                  <p className="text-[14px] text-[#6B6B6B] mb-6">
                    Discover our beautiful collection of handcrafted vases
                  </p>
                  <Button
                    variant="primary"
                    onClick={() => setIsCartOpen(false)}
                    shimmer
                  >
                    <Link href="/products" className="flex items-center gap-2 text-white">
                      Continue Shopping
                      <ArrowRight size={16} />
                    </Link>
                  </Button>
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {items.map((item, i) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 50, height: 0, marginBottom: 0, paddingTop: 0, paddingBottom: 0 }}
                      transition={{ delay: i * 0.05, duration: 0.3 }}
                      className="flex gap-4 py-4 border-b border-[rgba(0,0,0,0.04)]"
                    >
                      {/* Product Image */}
                      <div className="w-20 h-24 rounded-[8px] bg-[#F5F5F0] flex-shrink-0 overflow-hidden flex items-center justify-center">
                        {item.product.images?.[0]?.image_url ? (
                          <img
                            src={item.product.images[0].image_url}
                            alt={item.product.title}
                            className={`w-full h-full ${(item.product.images[0].image_url.includes('creative') || item.product.images[0].image_url.includes('9_16')) ? 'object-contain p-1' : 'object-cover'}`}
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <span className="text-2xl">🏺</span>
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-[14px] font-medium text-[#1A1A1A] truncate">
                          {item.product.title}
                        </h4>
                        {item.selectedOptions && item.selectedOptions.length > 0 && (
                          <p className="text-[12px] text-[#9CA3AF] mt-0.5">
                            {item.selectedOptions.map(o => o.value).join(' / ')}
                          </p>
                        )}
                        <p className="text-[14px] font-semibold mt-1">
                          {formatCurrency(item.variant?.price ?? item.product.price)}
                        </p>

                        {/* Quantity & Remove */}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center border border-[rgba(0,0,0,0.1)] rounded-[6px]">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              className="w-8 h-8 flex items-center justify-center hover:bg-[#F5F5F0] transition-colors cursor-pointer disabled:opacity-30"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="w-8 text-center text-[13px] font-medium">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-8 h-8 flex items-center justify-center hover:bg-[#F5F5F0] transition-colors cursor-pointer"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="p-1.5 text-[#9CA3AF] hover:text-[#DC2626] transition-colors cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-[rgba(0,0,0,0.06)] px-6 py-5 space-y-4">
                {/* Subtotal */}
                <div className="flex items-center justify-between">
                  <span className="text-[14px] text-[#6B6B6B]">Subtotal</span>
                  <span className="text-[18px] font-semibold">{formatCurrency(subtotal)}</span>
                </div>
                <p className="text-[12px] text-[#9CA3AF]">
                  Shipping and taxes calculated at checkout
                </p>

                {/* Checkout Button */}
                <Button
                  variant="primary"
                  fullWidth
                  size="lg"
                  shimmer
                  onClick={() => setIsCartOpen(false)}
                >
                  <Link
                    href="/checkout"
                    className="flex items-center justify-center gap-2 w-full text-white"
                  >
                    Proceed to Checkout
                    <ArrowRight size={16} />
                  </Link>
                </Button>

                {/* View Cart / Continue Shopping */}
                <div className="flex flex-col gap-2.5 pt-1">
                  <Link
                    href="/cart"
                    onClick={() => setIsCartOpen(false)}
                    className="w-full text-center text-[13px] text-[#2563EB] hover:text-[#1d4ed8] font-medium transition-colors"
                  >
                    View Shopping Cart
                  </Link>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="w-full text-center text-[13px] text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors cursor-pointer"
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
