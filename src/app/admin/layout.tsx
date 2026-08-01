'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { LayoutDashboard, ShoppingBag, FolderOpen, ClipboardList, Tag, ArrowLeft, LogOut, Loader2, ShieldAlert, Users, Image, Globe, Sliders, BarChart3 } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, profile, loading, signOut } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [user, loading, router, pathname]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#2563EB] animate-spin" />
      </div>
    );
  }

  // Deny access if user is not an admin
  if (!user || profile?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center px-6">
        <div className="max-w-[420px] w-full text-center bg-white border border-[#000]/[0.05] rounded-[32px] p-8 md:p-10 shadow-lg flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-6 border border-red-100 shadow-inner">
            <ShieldAlert className="w-8 h-8 text-red-600" />
          </div>

          <h1 className="text-[22px] font-normal mb-2 text-[#1A1A1A] leading-tight" style={{ fontFamily: 'var(--font-serif)' }}>
            Access Denied
          </h1>
          <p className="text-[13px] text-[#6B6B6B] leading-relaxed mb-6">
            You do not have administrative authorization to view this workspace. Please contact support or sign in with an admin account.
          </p>

          <div className="flex flex-col gap-3.5 w-full">
            <Link href="/">
              <Button variant="primary" className="w-full h-11 text-[13px]">
                Return to Storefront
              </Button>
            </Link>
            <Button
              onClick={async () => {
                await signOut();
                router.push('/login');
              }}
              variant="outline"
              className="w-full h-11 text-[13px]"
            >
              Sign In with Another Account
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const menuItems = [
    { name: 'Overview', href: '/admin', icon: LayoutDashboard },
    { name: 'Products', href: '/admin/products', icon: ShoppingBag },
    { name: 'Categories', href: '/admin/categories', icon: FolderOpen },
    { name: 'Orders Hub', href: '/admin/orders', icon: ClipboardList },
    { name: 'Discount Codes', href: '/admin/coupons', icon: Tag },
    { name: 'Customers', href: '/admin/customers', icon: Users },
    { name: 'Media Library', href: '/admin/media', icon: Image },
    { name: 'SEO Control', href: '/admin/seo', icon: Globe },
    { name: 'Site Settings', href: '/admin/settings', icon: Sliders },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Control Deck */}
      <aside className="w-64 border-r border-gray-200 bg-white flex flex-col justify-between sticky top-0 h-screen hidden md:flex">
        <div>
          {/* Logo brand */}
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <Link href="/" className="text-[20px] tracking-widest font-normal text-gray-900 uppercase" style={{ fontFamily: 'var(--font-serif)' }}>
              KROMA ADMIN
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-[12px] text-[13.5px] font-medium transition-colors ${isActive ? 'bg-[#2563EB]/5 text-[#2563EB]' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
                >
                  <Icon size={16} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-gray-100 space-y-2">
          <Link href="/">
            <button className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-[12px] text-[13px] font-medium text-gray-600 hover:text-gray-950 transition-colors text-left cursor-pointer">
              <ArrowLeft size={15} /> Storefront
            </button>
          </Link>
          <button
            onClick={async () => {
              await signOut();
              router.push('/');
            }}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-[12px] text-[13px] font-medium text-red-600 hover:bg-red-50/50 transition-colors text-left cursor-pointer"
          >
            <LogOut size={15} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Workspace Frame */}
      <main className="flex-1 min-h-screen overflow-y-auto">
        {/* Header Bar */}
        <header className="h-16 border-b border-gray-200 bg-white px-8 flex items-center justify-between sticky top-0 z-10 md:hidden">
          <Link href="/" className="text-[18px] tracking-wider font-semibold text-gray-900 uppercase" style={{ fontFamily: 'var(--font-serif)' }}>
            KROMA ADMIN
          </Link>
          <div className="flex gap-4">
            <Link href="/" className="text-[13px] text-gray-600 font-medium hover:text-gray-950">Store</Link>
            <button onClick={async () => { await signOut(); router.push('/'); }} className="text-[13px] text-red-600 font-medium">Exit</button>
          </div>
        </header>

        {/* Inner Content Area */}
        <div className="p-8 max-w-[1400px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
