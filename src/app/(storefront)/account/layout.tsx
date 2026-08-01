'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { User, ShoppingBag, MapPin, Settings, LogOut, Loader2 } from 'lucide-react';

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, profile, signOut, loading } = useAuth();

  // Route auth guard
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=account');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center pt-[100px]">
        <Loader2 className="w-8 h-8 text-[#2563EB] animate-spin" />
      </div>
    );
  }

  const menuItems = [
    { name: 'Dashboard', href: '/account', icon: User },
    { name: 'Orders History', href: '/account/orders', icon: ShoppingBag },
    { name: 'Address Book', href: '/account/addresses', icon: MapPin },
    { name: 'Profile Settings', href: '/account/profile', icon: Settings },
  ];

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const nameInitial = profile?.full_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'K';

  return (
    <div className="min-h-screen bg-[#FAFAFA] pt-[120px] pb-24">
      <div className="max-w-[1440px] mx-auto px-6 md:px-16">
        <h1 className="text-[36px] font-normal mb-8 text-[#1A1A1A] tracking-tight" style={{ fontFamily: 'var(--font-serif)' }}>
          My Account
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Side Menu Panel */}
          <div className="space-y-6">
            <div className="bg-white border border-[#000]/[0.05] rounded-[24px] p-6 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#F5F5F0] flex items-center justify-center font-semibold text-[16px] text-[#1A1A1A] border border-[#000]/[0.04]">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Profile" className="w-full h-full rounded-full object-cover" />
                ) : (
                  nameInitial
                )}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-[15px] text-[#1A1A1A] truncate">{profile?.full_name || 'Customer'}</p>
                <p className="text-[12px] text-[#6B6B6B] truncate">{user.email}</p>
              </div>
            </div>

            <div className="bg-white border border-[#000]/[0.05] rounded-[24px] p-4 shadow-sm">
              <nav className="space-y-1">
                {menuItems.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-3 rounded-[12px] text-[13.5px] font-medium transition-colors ${isActive ? 'bg-[#2563EB]/5 text-[#2563EB]' : 'text-[#6B6B6B] hover:text-[#1A1A1A] hover:bg-[#FAFAFA]'}`}
                    >
                      <Icon size={16} />
                      {item.name}
                    </Link>
                  );
                })}
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-[12px] text-[13.5px] font-medium text-red-600 hover:bg-red-50/50 transition-colors text-left cursor-pointer"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </nav>
            </div>
          </div>

          {/* Account Sub-Content Grid Area */}
          <div className="lg:col-span-3">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
