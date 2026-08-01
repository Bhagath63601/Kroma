'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Heart, ShoppingBag, User, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import SearchOverlay from './SearchOverlay';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { itemCount, setIsCartOpen } = useCart();
  const { user, profile } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '/products', label: 'Shop All' },
    { href: '/products?category=baskets-arrangements', label: 'Baskets' },
    { href: '/products?category=wall-mounts', label: 'Wall Mounts' },
    { href: '/products?category=floral-wreaths', label: 'Wreaths' },
    { href: '/about', label: 'About' },
  ];

  return (
    <>
      {/* Announcement Bar */}
      <div className="bg-[#1A1A1A] text-white text-center py-2.5 px-4">
        <p className="text-[12px] tracking-[0.1em] uppercase">
          Free shipping on orders above ₹3,000 · Handcrafted with love
        </p>
      </div>

      {/* Header */}
      <motion.header
        animate={{
          height: scrolled ? 60 : 80,
          borderBottomColor: scrolled ? 'rgba(0,0,0,0.06)' : 'rgba(0,0,0,0)',
        }}
        transition={{ duration: 0.3 }}
        className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b"
        style={{ borderBottom: '1px solid transparent' }}
      >
        <div className="max-w-[1440px] mx-auto px-6 md:px-16 h-full flex items-center justify-between">
          {/* Left: Mobile Menu + Logo */}
          <div className="flex items-center gap-4">
            <button
              className="md:hidden p-1 cursor-pointer"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu size={22} />
            </button>
            <Link href="/" className="flex items-center">
              <motion.h1
                className="text-[24px] md:text-[28px] tracking-[-0.02em]"
                style={{ fontFamily: 'var(--font-serif)', fontWeight: 700 }}
                animate={{ fontSize: scrolled ? '22px' : '28px' }}
                transition={{ duration: 0.3 }}
              >
                KROMA
              </motion.h1>
            </Link>
          </div>

          {/* Center: Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[13px] uppercase tracking-[0.08em] text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors relative group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-[1.5px] bg-[#1A1A1A] transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            <button 
              className="p-2 hover:bg-[#F5F5F0] rounded-full transition-colors cursor-pointer"
              onClick={() => setSearchOpen(true)}
            >
              <Search size={18} className="text-[#1A1A1A]" />
            </button>
            <Link
              href="/account/wishlist"
              className="p-2 hover:bg-[#F5F5F0] rounded-full transition-colors hidden sm:flex"
            >
              <Heart size={18} className="text-[#1A1A1A]" />
            </Link>
            {user ? (
              <Link
                href="/account"
                className="w-8 h-8 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center font-bold text-[12px] hover:bg-[#2563EB] transition-colors cursor-pointer flex-shrink-0"
              >
                {profile?.full_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'K'}
              </Link>
            ) : (
              <Link
                href="/login"
                className="p-2 hover:bg-[#F5F5F0] rounded-full transition-colors hidden sm:flex"
              >
                <User size={18} className="text-[#1A1A1A]" />
              </Link>
            )}
            <button
              className="relative p-2 hover:bg-[#F5F5F0] rounded-full transition-colors cursor-pointer"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingBag size={18} className="text-[#1A1A1A]" />
              <AnimatePresence>
                {itemCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-0.5 -right-0.5 w-[18px] h-[18px] bg-[#2563EB] text-white text-[10px] font-bold rounded-full flex items-center justify-center"
                  >
                    {itemCount > 9 ? '9+' : itemCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-white"
          >
            <div className="p-6 flex justify-between items-center">
              <h2
                className="text-[24px] tracking-[-0.02em]"
                style={{ fontFamily: 'var(--font-serif)', fontWeight: 700 }}
              >
                KROMA
              </h2>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 cursor-pointer"
              >
                <X size={24} />
              </button>
            </div>
            <nav className="px-6 pt-8 space-y-0">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ x: -30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.08, duration: 0.4 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-4 text-[28px] font-light text-[#1A1A1A] border-b border-[rgba(0,0,0,0.06)]"
                    style={{ fontFamily: 'var(--font-serif)' }}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </nav>
            <div className="px-6 pt-8 flex gap-4">
              <Link
                href={user ? "/account" : "/login"}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 text-[14px] text-[#6B6B6B]"
              >
                <User size={18} /> {user ? 'Account' : 'Sign In'}
              </Link>
              <Link
                href="/account/wishlist"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 text-[14px] text-[#6B6B6B]"
              >
                <Heart size={18} /> Wishlist
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
