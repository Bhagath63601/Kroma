'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, ShieldCheck, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import Button from '@/components/ui/Button';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, signIn, signUp, signInWithGoogle, loading } = useAuth();
  const { items } = useCart();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Resolve where to redirect post-auth
  const redirectPath = searchParams.get('redirect') || (items.length > 0 ? '/checkout' : '/account');

  // If user is already logged in, redirect them
  useEffect(() => {
    if (user && !formLoading) {
      router.push(redirectPath);
    }
  }, [user, router, redirectPath, formLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setFormLoading(true);

    try {
      const { error: signInError } = await signIn(email, password);
      if (signInError) {
        setError(signInError);
      } else {
        router.push(redirectPath);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center pt-[100px]">
        <Loader2 className="w-8 h-8 text-[#2563EB] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] pt-[120px] pb-24 flex items-center justify-center px-6">
      <div className="max-w-[480px] w-full">
        {/* Logo or Title Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block text-[28px] tracking-widest font-normal text-[#1A1A1A] uppercase mb-2" style={{ fontFamily: 'var(--font-serif)' }}>
            KROMA
          </Link>
          <p className="text-[13px] text-[#6B6B6B]">Handcrafted art pieces for modern living spaces</p>
        </div>

        <motion.div
          layout
          className="bg-white border border-[#000]/[0.05] rounded-[32px] p-8 md:p-10 shadow-lg"
        >
          {/* Header */}
          <div className="border-b border-[#000]/[0.04] pb-4 mb-6">
            <h2 className="text-[18px] font-semibold text-[#1A1A1A]">Sign In</h2>
          </div>

          {/* Form Success/Error messages */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-5 p-3.5 bg-red-50 border border-red-200/50 rounded-[12px] text-[12.5px] text-red-600 leading-relaxed"
              >
                {error}
              </motion.div>
            )}

            {successMsg && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-5 p-3.5 bg-green-50 border border-green-200/50 rounded-[12px] text-[12.5px] text-green-800 font-medium"
              >
                {successMsg}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#6B6B6B] mb-1.5 font-medium">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. yourname@example.com"
                  className="w-full h-11 pl-10 pr-4 border border-[#000]/[0.08] rounded-[8px] text-[13.5px] outline-none focus:border-[#2563EB] transition-colors"
                />
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-[11px] uppercase tracking-wider text-[#6B6B6B] font-medium">Password</label>
                <button type="button" className="text-[11px] text-[#2563EB] hover:text-[#1d4ed8] font-medium cursor-pointer">
                  Forgot?
                </button>
              </div>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 pl-10 pr-4 border border-[#000]/[0.08] rounded-[8px] text-[13.5px] outline-none focus:border-[#2563EB] transition-colors"
                />
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
              </div>
            </div>

            <Button type="submit" variant="primary" className="w-full py-3 h-11 text-[13px] mt-2" shimmer disabled={formLoading}>
              {formLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mx-auto" />
              ) : (
                <>Sign In <ArrowRight size={15} /></>
              )}
            </Button>
          </form>

          {/* Social Sign-In Divider */}
          <div className="my-6 flex items-center justify-between">
            <span className="w-full h-[1px] bg-gray-100" />
            <span className="text-[11px] uppercase tracking-wider text-[#9CA3AF] px-3 whitespace-nowrap font-medium">or continue with</span>
            <span className="w-full h-[1px] bg-gray-100" />
          </div>

          {/* Social buttons */}
          <Button
            onClick={signInWithGoogle}
            type="button"
            variant="outline"
            className="w-full h-11 text-[13px] flex items-center justify-center gap-2 border-[#000]/[0.08] hover:bg-[#FAFAFA]"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
            </svg>
            Google Identity
          </Button>

          {/* SSL Lock */}
          <div className="mt-6 flex justify-center items-center gap-1.5 text-[11px] text-[#9CA3AF]">
            <ShieldCheck size={14} className="text-green-700" />
            <span>Secure account encryption and validation.</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center pt-[100px]">
        <Loader2 className="w-8 h-8 text-[#2563EB] animate-spin" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
