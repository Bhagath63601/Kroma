'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/lib/supabase';
import { ShoppingBag, MapPin, User, ArrowRight, Clock, ShieldAlert } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import Button from '@/components/ui/Button';

export default function AccountOverviewPage() {
  const { user, profile } = useAuth();
  const [latestOrder, setLatestOrder] = useState<any | null>(null);
  const [defaultAddress, setDefaultAddress] = useState<any | null>(null);
  const [stats, setStats] = useState({ totalOrders: 0, totalPaid: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    const supabase = createClient();

    const fetchOverviewData = async () => {
      try {
        // 1. Fetch latest order
        const { data: orders } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (orders && orders.length > 0) {
          setLatestOrder(orders[0]);
          
          // Calculate stats
          const paidOrders = orders.filter((o: any) => o.payment_status === 'paid');
          const sumPaid = paidOrders.reduce((sum: number, o: any) => sum + Number(o.total), 0);
          setStats({
            totalOrders: orders.length,
            totalPaid: sumPaid,
          });
        }

        // 2. Fetch default address
        const { data: addresses } = await supabase
          .from('addresses')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_default', true)
          .limit(1);

        if (addresses && addresses.length > 0) {
          setDefaultAddress(addresses[0]);
        }
      } catch (err) {
        console.error('Failed to load dashboard overview:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOverviewData();
  }, [user]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-40 bg-gray-200 rounded-[20px]" />
          <div className="h-40 bg-gray-200 rounded-[20px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Message */}
      <div>
        <h2 className="text-[24px] font-normal text-[#1A1A1A] mb-1" style={{ fontFamily: 'var(--font-serif)' }}>
          Welcome back, {profile?.full_name || 'Customer'}!
        </h2>
        <p className="text-[13px] text-[#6B6B6B]">Manage your profile details, edit addresses, and track your artisan order history.</p>
      </div>

      {/* KPI Stats Widgets */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border border-[#000]/[0.05] rounded-[20px] p-5 shadow-sm">
          <span className="text-[11px] uppercase tracking-wider text-[#9CA3AF] font-semibold block mb-1">Total Orders Placed</span>
          <span className="text-[24px] font-bold text-[#1A1A1A]">{stats.totalOrders}</span>
        </div>
        <div className="bg-white border border-[#000]/[0.05] rounded-[20px] p-5 shadow-sm">
          <span className="text-[11px] uppercase tracking-wider text-[#9CA3AF] font-semibold block mb-1">Lifetime Value (Paid)</span>
          <span className="text-[24px] font-bold text-green-700">{formatCurrency(stats.totalPaid)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Order Summary Card */}
        <div className="bg-white border border-[#000]/[0.05] rounded-[24px] p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-gray-100">
              <h3 className="font-semibold text-[15px] text-[#1A1A1A] flex items-center gap-2">
                <ShoppingBag size={16} className="text-[#6B6B6B]" /> Recent Order
              </h3>
              {latestOrder && (
                <span className={`text-[10.5px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full ${latestOrder.payment_status === 'paid' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
                  {latestOrder.payment_status}
                </span>
              )}
            </div>

            {latestOrder ? (
              <div className="space-y-2.5 text-[13px] text-[#6B6B6B]">
                <div className="flex justify-between">
                  <span>Order Number:</span>
                  <span className="font-semibold text-[#1A1A1A]">{latestOrder.order_number}</span>
                </div>
                <div className="flex justify-between">
                  <span>Date Placed:</span>
                  <span className="text-[#1A1A1A]">{formatDate(latestOrder.created_at)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Grand Total:</span>
                  <span className="text-[#1A1A1A] font-semibold">{formatCurrency(latestOrder.total)}</span>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-[#9CA3AF]">
                <Clock size={28} className="mx-auto mb-2 text-gray-300" />
                <p className="text-[13px]">No orders found yet.</p>
              </div>
            )}
          </div>

          <div className="pt-5 mt-4 border-t border-gray-50 flex justify-end">
            {latestOrder ? (
              <Link href="/account/orders" className="text-[12px] font-semibold text-[#2563EB] hover:text-[#1d4ed8] inline-flex items-center gap-1">
                View All Orders <ArrowRight size={14} />
              </Link>
            ) : (
              <Link href="/products">
                <Button variant="outline" size="sm">
                  Start Shopping
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Default Shipping Address Card */}
        <div className="bg-white border border-[#000]/[0.05] rounded-[24px] p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-gray-100">
              <h3 className="font-semibold text-[15px] text-[#1A1A1A] flex items-center gap-2">
                <MapPin size={16} className="text-[#6B6B6B]" /> Shipping Location
              </h3>
              {defaultAddress && (
                <span className="text-[10px] uppercase bg-[#2563EB]/5 text-[#2563EB] font-bold px-2 py-0.5 rounded">
                  Default
                </span>
              )}
            </div>

            {defaultAddress ? (
              <div className="text-[13px] leading-relaxed text-[#6B6B6B]">
                <p className="font-semibold text-[#1A1A1A] mb-1">{defaultAddress.full_name}</p>
                <p>{defaultAddress.address_line1}</p>
                {defaultAddress.address_line2 && <p>{defaultAddress.address_line2}</p>}
                <p>{defaultAddress.city}, {defaultAddress.state} - {defaultAddress.zip}</p>
                <p className="mt-1 flex items-center gap-1.5 text-[12px] text-[#9CA3AF]">Phone: {defaultAddress.phone}</p>
              </div>
            ) : (
              <div className="py-6 text-center text-[#9CA3AF]">
                <ShieldAlert size={28} className="mx-auto mb-2 text-gray-300" />
                <p className="text-[13px]">No shipping address set yet.</p>
              </div>
            )}
          </div>

          <div className="pt-5 mt-4 border-t border-gray-50 flex justify-end">
            <Link href="/account/addresses" className="text-[12px] font-semibold text-[#2563EB] hover:text-[#1d4ed8] inline-flex items-center gap-1">
              Manage Address Book <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
