'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { DollarSign, ClipboardList, Package, TrendingUp, AlertTriangle, ArrowRight, Loader2, Check, X, MessageSquare } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import Link from 'next/link';
import type { Order, Product } from '@/types';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    revenue: 0,
    ordersCount: 0,
    productsCount: 0,
    aov: 0,
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Fetch admin stats and order segments
  const fetchAdminStats = async () => {
    try {
      const supabase = createClient();

      // 1. Fetch orders
      const { data: orders, error: ordersErr } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (ordersErr) throw ordersErr;

      // 2. Fetch products count
      const { data: products, error: productsErr } = await supabase
        .from('products')
        .select('*');

      if (productsErr) throw productsErr;

      const ordersList = orders || [];
      const productsList = products || [];

      // Calculations
      const paidOrders = ordersList.filter((o: any) => o.payment_status === 'paid');
      const totalRevenue = paidOrders.reduce((sum: number, o: any) => sum + Number(o.total), 0);
      const totalOrders = ordersList.length;
      const totalProducts = productsList.length;
      const avgOrderVal = paidOrders.length > 0 ? totalRevenue / paidOrders.length : 0;

      setStats({
        revenue: totalRevenue,
        ordersCount: totalOrders,
        productsCount: totalProducts,
        aov: avgOrderVal,
      });

      setRecentOrders(ordersList.slice(0, 5));

      // Segment Pending Orders (payment_status is pending and not cancelled)
      const pending = ordersList.filter(
        (o: any) => o.payment_status === 'pending' && o.fulfillment_status !== 'cancelled'
      );
      setPendingOrders(pending);

      // Filter low stock products (less than or equal to 3 items)
      const lowStock = productsList.filter((p: any) => p.stock_quantity <= 3);
      setLowStockProducts(lowStock);

    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminStats();

    // Supabase Postgres Changes Realtime Subscription
    const supabase = createClient();
    const channel = supabase
      .channel('admin-overview-orders-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          fetchAdminStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Quick Action: Mark Order as Paid
  const handleMarkAsPaid = async (orderId: string) => {
    setActionLoading(orderId + '-paid');
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('orders')
        .update({ payment_status: 'paid' })
        .eq('id', orderId);

      if (error) throw error;
      await fetchAdminStats();
    } catch (err: any) {
      alert(`Failed to update order to Paid: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  // Quick Action: Cancel Order
  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    
    setActionLoading(orderId + '-cancel');
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('orders')
        .update({ fulfillment_status: 'cancelled' })
        .eq('id', orderId);

      if (error) throw error;
      await fetchAdminStats();
    } catch (err: any) {
      alert(`Failed to cancel order: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-[#2563EB] animate-spin" />
      </div>
    );
  }

  const statCards = [
    { title: 'Gross Revenue', value: formatCurrency(stats.revenue), icon: DollarSign, color: 'text-green-600 bg-green-50' },
    { title: 'Total Orders', value: stats.ordersCount, icon: ClipboardList, color: 'text-[#2563EB] bg-blue-50' },
    { title: 'Average Order (AOV)', value: formatCurrency(stats.aov), icon: TrendingUp, color: 'text-purple-600 bg-purple-50' },
    { title: 'Active Products', value: stats.productsCount, icon: Package, color: 'text-amber-600 bg-amber-50' },
  ];

  return (
    <div className="space-y-8">
      {/* Greeting banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-[26px] font-normal text-gray-900 leading-tight" style={{ fontFamily: 'var(--font-serif)' }}>
            Console Overview
          </h2>
          <p className="text-[13px] text-gray-500 mt-1">Real-time analytical performance monitors, customer order counts, and stock updates.</p>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-semibold text-green-700 bg-green-50 px-3 py-1.5 rounded-full border border-green-200 animate-pulse">
          <span className="w-2.5 h-2.5 rounded-full bg-green-500 block"></span>
          Realtime Live Enabled
        </div>
      </div>

      {/* KPI Cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white border border-gray-200 rounded-[20px] p-5 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold block mb-1">{stat.title}</span>
                <span className="text-[22px] font-bold text-gray-900">{stat.value}</span>
              </div>
              <div className={`p-3 rounded-full ${stat.color} flex-shrink-0`}>
                <Icon size={20} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Pending Orders Data Sheet */}
      <div className="bg-white border border-gray-200 rounded-[24px] p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="font-semibold text-[15px] text-gray-900">Pending Orders Datasheet</h3>
            <p className="text-[11.5px] text-gray-400 mt-0.5">Orders awaiting customer confirmation and payment processing on WhatsApp.</p>
          </div>
          <span className="text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1 rounded-full">
            {pendingOrders.length} Pending Approval
          </span>
        </div>

        {pendingOrders.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-gray-200 rounded-2xl">
            <span className="text-[26px] block mb-2">🏺</span>
            <p className="text-[13px] font-medium text-gray-700">No pending orders found</p>
            <p className="text-[11.5px] text-gray-400 mt-0.5">All order requests are successfully paid and processed.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[13px]">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 font-semibold bg-gray-50/50">
                  <th className="p-3 pl-4">Order ID</th>
                  <th className="p-3">Customer Info</th>
                  <th className="p-3">Phone (WhatsApp)</th>
                  <th className="p-3">Order Total</th>
                  <th className="p-3 text-center">Date Logged</th>
                  <th className="p-3 pr-4 text-right">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-gray-700">
                {pendingOrders.map((o) => {
                  const addr = o.shipping_address as any;
                  const customerPhone = addr?.phone || o.notes?.match(/WhatsApp Phone:\s*(\+?[0-9\s-]+)/)?.[1] || '';
                  const customerName = addr?.name || o.notes?.match(/Name:\s*(.+)/)?.[1] || o.email || 'Customer';

                  // Construct WhatsApp Link
                  const cleanPhone = customerPhone.replace(/\D/g, '');
                  const messageText = `Hello ${customerName}, this is Kroma. We received your order request ${o.order_number} for ₹${o.total.toLocaleString('en-IN')}. We would like to coordinate payment (UPI/Bank Transfer) to confirm your delivery. Let us know when you're ready!`;
                  const whatsappUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(messageText)}`;

                  return (
                    <tr key={o.id} className="hover:bg-gray-50/40">
                      <td className="p-3 pl-4 font-semibold text-gray-900">{o.order_number}</td>
                      <td className="p-3">
                        <div className="font-medium text-gray-900">{customerName}</div>
                        <div className="text-[11px] text-gray-400 truncate max-w-[160px]">{o.email}</div>
                      </td>
                      <td className="p-3 font-medium text-gray-800">
                        {customerPhone ? (
                          <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[#16A34A] hover:underline"
                          >
                            <span>{customerPhone}</span>
                          </a>
                        ) : (
                          <span className="text-gray-400 italic">No number</span>
                        )}
                      </td>
                      <td className="p-3 font-semibold text-gray-900">{formatCurrency(o.total)}</td>
                      <td className="p-3 text-center text-gray-400">{formatDate(o.created_at)}</td>
                      <td className="p-3 pr-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Chat on WhatsApp */}
                          {customerPhone && (
                            <a
                              href={whatsappUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1.5 inline-flex items-center gap-1.5 text-[11px] font-semibold text-white bg-[#25D366] hover:bg-[#20BA5A] rounded-lg transition-colors shadow-sm"
                            >
                              <MessageSquare size={12} className="fill-current" /> Chat
                            </a>
                          )}

                          {/* Mark as Paid */}
                          <button
                            onClick={() => handleMarkAsPaid(o.id)}
                            disabled={actionLoading !== null}
                            className="px-2.5 py-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm disabled:opacity-50"
                          >
                            {actionLoading === o.id + '-paid' ? (
                              <Loader2 size={11} className="animate-spin" />
                            ) : (
                              <Check size={11} />
                            )}
                            Confirm Paid
                          </button>

                          {/* Cancel Order */}
                          <button
                            onClick={() => handleCancelOrder(o.id)}
                            disabled={actionLoading !== null}
                            className="p-1.5 inline-flex items-center text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                            title="Cancel Order"
                          >
                            {actionLoading === o.id + '-cancel' ? (
                              <Loader2 size={12} className="animate-spin" />
                            ) : (
                              <X size={13} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders Table */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-[24px] p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-semibold text-[15px] text-gray-900">Recent Transactions</h3>
            <Link href="/admin/orders" className="text-[12px] font-semibold text-[#2563EB] hover:text-[#1d4ed8] flex items-center gap-0.5">
              Open Orders Hub <ArrowRight size={13} />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <p className="text-[13px] text-gray-400 text-center py-8">No order transactions recorded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[13px]">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 font-semibold">
                    <th className="pb-3">Order ID</th>
                    <th className="pb-3">Customer</th>
                    <th className="pb-3">Total</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-gray-700">
                  {recentOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-gray-50/40">
                      <td className="py-3.5 font-medium text-gray-900">{o.order_number}</td>
                      <td className="py-3.5 max-w-[150px] truncate">{o.email}</td>
                      <td className="py-3.5 font-medium">{formatCurrency(o.total)}</td>
                      <td className="py-3.5">
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${o.payment_status === 'paid' ? 'bg-green-50 text-green-700' : o.payment_status === 'failed' ? 'bg-red-50 text-red-700' : 'bg-yellow-50 text-yellow-700'}`}>
                          {o.payment_status}
                        </span>
                      </td>
                      <td className="py-3.5 text-gray-400">{formatDate(o.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Stock Alert Warnings */}
        <div className="bg-white border border-gray-200 rounded-[24px] p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-[15px] text-gray-900 flex items-center gap-1.5 mb-5">
              <AlertTriangle size={16} className="text-red-500" /> Inventory Stock Alerts
            </h3>

            {lowStockProducts.length === 0 ? (
              <p className="text-[13px] text-gray-400 py-6 text-center">All product listings are fully stocked.</p>
            ) : (
              <div className="space-y-4">
                {lowStockProducts.map((p) => (
                  <div key={p.id} className="flex justify-between items-center text-[12.5px] border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                    <div className="min-w-0 pr-2">
                      <p className="font-medium text-gray-900 truncate">{p.title}</p>
                      <p className="text-[11px] text-gray-400">SKU: {p.sku}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${p.stock_quantity === 0 ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>
                      {p.stock_quantity} Left
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-5 mt-4 border-t border-gray-100 flex justify-end">
            <Link href="/admin/products" className="text-[12px] font-semibold text-[#2563EB] hover:text-[#1d4ed8]">
              Manage Product Stock Inventory
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
