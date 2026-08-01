'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { Edit2, Truck, X, Loader2, Save, Search, Check, MessageSquare } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import Button from '@/components/ui/Button';
import type { Order } from '@/types';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Edit form overlay states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

  // Form states for updates
  const [paymentStatus, setPaymentStatus] = useState<Order['payment_status']>('pending');
  const [fulfillmentStatus, setFulfillmentStatus] = useState<Order['fulfillment_status']>('pending');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingCarrier, setTrackingCarrier] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Fetch orders
  const fetchData = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      let query = supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (searchTerm) {
         query = query.or(`order_number.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      console.error('Failed to query orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Basic debounce for search
    const delayDebounceFn = setTimeout(() => {
      fetchData();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  useEffect(() => {
    // Supabase Postgres Changes Realtime Subscription
    const supabase = createClient();
    const channel = supabase
      .channel('admin-orders-hub-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [searchTerm]);

  // Quick Action: Confirm Paid
  const handleMarkAsPaid = async (orderId: string) => {
    setActionLoading(orderId + '-paid');
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('orders')
        .update({ payment_status: 'paid' })
        .eq('id', orderId);

      if (error) throw error;
      fetchData();
    } catch (err: any) {
      alert(`Failed to confirm payment: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const openEditForm = (o: Order) => {
    setEditingOrder(o);
    setPaymentStatus(o.payment_status);
    setFulfillmentStatus(o.fulfillment_status);
    setTrackingNumber(o.tracking_number || '');
    setTrackingCarrier(o.tracking_carrier || '');
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;

    setIsSubmitting(true);
    try {
      const supabase = createClient();
      const payload = {
        payment_status: paymentStatus,
        fulfillment_status: fulfillmentStatus,
        tracking_number: trackingNumber || null,
        tracking_carrier: trackingCarrier || null,
      };

      const { error } = await supabase
        .from('orders')
        .update(payload)
        .eq('id', editingOrder.id);

      if (error) throw error;

      setIsFormOpen(false);
      fetchData(); // Refresh the list
    } catch (err: any) {
      console.error('Failed to update order:', err);
      alert(err.message || 'An error occurred while updating the order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h2 className="text-[26px] font-normal text-gray-900 leading-tight" style={{ fontFamily: 'var(--font-serif)' }}>
            Orders Hub
          </h2>
          <p className="text-[13px] text-gray-500 mt-1">Review transactions, update fulfillment status, and add tracking details.</p>
        </div>
        
        {/* Search Bar */}
        <div className="relative w-full md:w-[300px]">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Order ID or Email..."
            className="w-full h-10 pl-10 pr-4 border border-gray-200 rounded-[10px] text-[13px] outline-none focus:border-[#2563EB] transition-colors"
          />
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-gray-200 rounded-[24px] overflow-hidden shadow-sm">
        {loading && orders.length === 0 ? (
           <div className="flex items-center justify-center p-12">
             <Loader2 className="w-8 h-8 text-[#2563EB] animate-spin" />
           </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[13px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50 text-gray-400 font-semibold">
                  <th className="p-4 pl-6">Order ID</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Total</th>
                  <th className="p-4">Payment</th>
                  <th className="p-4">Fulfillment</th>
                  <th className="p-4 pr-6 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-400">No orders found matching your criteria.</td>
                  </tr>
                ) : (
                  orders.map((o) => {
                    const addr = o.shipping_address as any;
                    const customerPhone = addr?.phone || o.notes?.match(/WhatsApp Phone:\s*(\+?[0-9\s-]+)/)?.[1] || '';
                    const customerName = addr?.name || o.notes?.match(/Name:\s*(.+)/)?.[1] || o.email || 'Customer';

                    // Construct WhatsApp Link
                    const cleanPhone = customerPhone.replace(/\D/g, '');
                    const messageText = `Hello ${customerName}, this is Kroma. We received your order request ${o.order_number} for ₹${o.total.toLocaleString('en-IN')}. We would like to coordinate payment (UPI/Bank Transfer) to confirm your delivery. Let us know when you're ready!`;
                    const whatsappUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(messageText)}`;

                    return (
                      <tr key={o.id} className="hover:bg-gray-50/20">
                        <td className="p-4 pl-6 font-medium text-gray-900">{o.order_number}</td>
                        <td className="p-4 text-gray-500">{formatDate(o.created_at)}</td>
                        <td className="p-4">
                          <div className="font-semibold text-gray-900">{customerName}</div>
                          <div className="text-[11px] text-gray-400 truncate max-w-[150px]">{o.email}</div>
                        </td>
                        <td className="p-4 font-semibold text-gray-900">{formatCurrency(o.total)}</td>
                        <td className="p-4">
                          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${o.payment_status === 'paid' ? 'bg-green-50 text-green-700' : o.payment_status === 'failed' ? 'bg-red-50 text-red-700' : 'bg-yellow-50 text-yellow-700'}`}>
                            {o.payment_status}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${o.fulfillment_status === 'delivered' ? 'bg-green-50 text-green-700' : o.fulfillment_status === 'shipped' ? 'bg-blue-50 text-blue-700' : o.fulfillment_status === 'cancelled' ? 'bg-red-50 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                            {o.fulfillment_status}
                          </span>
                        </td>
                        <td className="p-4 pr-6 text-right">
                          <div className="flex items-center justify-end gap-2.5">
                            {/* WhatsApp Customer Link */}
                            {customerPhone && (
                              <a
                                href={whatsappUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 inline-flex items-center text-gray-400 hover:text-[#25D366] hover:bg-green-50 rounded-lg transition-colors cursor-pointer"
                                title="Chat on WhatsApp"
                              >
                                <MessageSquare size={14} className="fill-current" />
                              </a>
                            )}

                            {/* Quick Paid Checkmark */}
                            {o.payment_status === 'pending' && (
                              <button
                                onClick={() => handleMarkAsPaid(o.id)}
                                disabled={actionLoading === o.id + '-paid'}
                                className="p-1.5 inline-flex items-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                                title="Confirm Paid"
                              >
                                {actionLoading === o.id + '-paid' ? (
                                  <Loader2 size={13} className="animate-spin" />
                                ) : (
                                  <Check size={14} />
                                )}
                              </button>
                            )}

                            <button
                              onClick={() => openEditForm(o)}
                              className="p-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-[#2563EB] hover:text-[#1d4ed8] hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Edit2 size={11} /> Update
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Form Modal Overlay */}
      {isFormOpen && editingOrder && (
        <div className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white border border-gray-200 rounded-[32px] max-w-[500px] w-full max-h-[85vh] overflow-y-auto shadow-2xl flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <h3 className="font-semibold text-[17px] text-gray-900" style={{ fontFamily: 'var(--font-serif)' }}>
                  Update Order Status
                </h3>
                <p className="text-[12px] text-gray-500 mt-0.5">Order {editingOrder.order_number}</p>
              </div>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-full transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form Fields */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 flex-1">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-gray-400 mb-1.5 font-bold">Payment Status</label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value as Order['payment_status'])}
                  className="w-full h-11 px-3 border border-gray-200 rounded-[10px] text-[13.5px] bg-white outline-none focus:border-[#2563EB] transition-colors"
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-gray-400 mb-1.5 font-bold">Fulfillment Status</label>
                <select
                  value={fulfillmentStatus}
                  onChange={(e) => setFulfillmentStatus(e.target.value as Order['fulfillment_status'])}
                  className="w-full h-11 px-3 border border-gray-200 rounded-[10px] text-[13.5px] bg-white outline-none focus:border-[#2563EB] transition-colors"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <h4 className="text-[12px] font-semibold text-gray-900 flex items-center gap-1.5 mb-3">
                  <Truck size={14} /> Shipping Information
                </h4>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-gray-400 mb-1.5 font-bold">Carrier (e.g. FedEx, BlueDart)</label>
                    <input
                      type="text"
                      value={trackingCarrier}
                      onChange={(e) => setTrackingCarrier(e.target.value)}
                      placeholder="Optional"
                      className="w-full h-11 px-4 border border-gray-200 rounded-[10px] text-[13.5px] outline-none focus:border-[#2563EB] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-gray-400 mb-1.5 font-bold">Tracking Number</label>
                    <input
                      type="text"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      placeholder="Optional"
                      className="w-full h-11 px-4 border border-gray-200 rounded-[10px] text-[13.5px] outline-none focus:border-[#2563EB] transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Submit panel */}
              <div className="pt-4 mt-2 flex justify-end gap-3.5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsFormOpen(false)}
                  className="h-11 px-5 text-[13px]"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="h-11 px-5 text-[13px] flex items-center gap-1.5"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={16} />}
                  Save Updates
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
