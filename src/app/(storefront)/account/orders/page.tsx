'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/lib/supabase';
import { ShoppingBag, ChevronDown, ChevronUp, Download, Truck, Clock, ShieldCheck, CreditCard } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import Button from '@/components/ui/Button';

export default function AccountOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [orderItemsMap, setOrderItemsMap] = useState<Record<string, any[]>>({});
  const [itemsLoading, setItemsLoading] = useState<Record<string, boolean>>({});

  const fetchOrders = async () => {
    if (!user) return;
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  const toggleExpandOrder = async (orderId: string) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
      return;
    }

    setExpandedOrder(orderId);

    // If order items are already loaded, do not fetch again
    if (orderItemsMap[orderId]) return;

    setItemsLoading((prev) => ({ ...prev, [orderId]: true }));

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId);

      if (error) throw error;
      setOrderItemsMap((prev) => ({ ...prev, [orderId]: data || [] }));
    } catch (err) {
      console.error('Failed to fetch order items:', err);
    } finally {
      setItemsLoading((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  // Simulated receipt download
  const handleDownloadReceipt = (order: any) => {
    const itemsList = orderItemsMap[order.id] || [];
    const itemsText = itemsList
      .map((it) => `- ${it.title} (x${it.quantity}): ${formatCurrency(it.unit_price)}`)
      .join('\n');

    const receiptContent = `
===================================================
                KROMA CREATIONS
           Handcrafted Ceramic Vases
===================================================
Receipt Date: ${new Date(order.created_at).toLocaleDateString()}
Order ID: ${order.order_number}
Billing Email: ${order.email}
Payment Status: ${order.payment_status.toUpperCase()}
Fulfillment Status: ${order.fulfillment_status.toUpperCase()}
---------------------------------------------------
Items:
${itemsList.length > 0 ? itemsText : '- Handcrafted Flower Vase'}
---------------------------------------------------
Subtotal: ${formatCurrency(order.subtotal)}
Discount: -${formatCurrency(order.discount_amount)}
Shipping: ${formatCurrency(order.shipping_cost)}
Grand Total: ${formatCurrency(order.total)}
===================================================
Thank you for supporting artisan vase arrangements!
    `.trim();

    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `receipt-${order.order_number}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/4" />
        <div className="h-20 bg-gray-200 rounded-[16px]" />
        <div className="h-20 bg-gray-200 rounded-[16px]" />
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#000]/[0.05] rounded-[24px] p-6 md:p-8 shadow-sm">
      <div className="mb-6 pb-4 border-b border-gray-100">
        <h2 className="text-[20px] font-normal text-[#1A1A1A]" style={{ fontFamily: 'var(--font-serif)' }}>
          Order History
        </h2>
        <p className="text-[12.5px] text-[#6B6B6B] mt-0.5">Track your orders, view shipping status, and retrieve invoices.</p>
      </div>

      {orders.length === 0 ? (
        <div className="py-12 text-center border border-dashed border-[#000]/[0.08] rounded-[20px] text-[#9CA3AF]">
          <ShoppingBag size={32} className="mx-auto mb-3 text-gray-300" />
          <p className="text-[14px]">No orders found.</p>
          <p className="text-[12px] mt-1 text-[#6B6B6B]">Artisan creations you purchase will appear here in chronological order.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const isExpanded = expandedOrder === order.id;
            const itemsList = orderItemsMap[order.id] || [];
            const isLoadingItems = itemsLoading[order.id];

            return (
              <div key={order.id} className="border border-[#000]/[0.05] rounded-[16px] overflow-hidden bg-white">
                {/* Header Summary Row */}
                <div
                  onClick={() => toggleExpandOrder(order.id)}
                  className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 cursor-pointer hover:bg-[#FAFAFA] transition-colors select-none"
                >
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full sm:w-auto sm:flex-1">
                    <div>
                      <span className="block text-[10px] uppercase text-[#9CA3AF] font-bold">Order Number</span>
                      <span className="font-semibold text-[13.5px] text-[#1A1A1A]">{order.order_number}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase text-[#9CA3AF] font-bold">Date Placed</span>
                      <span className="text-[13px] text-[#1A1A1A]">{formatDate(order.created_at)}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase text-[#9CA3AF] font-bold">Total Cost</span>
                      <span className="text-[13px] font-semibold text-[#1A1A1A]">{formatCurrency(order.total)}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase text-[#9CA3AF] font-bold">Payment Status</span>
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full inline-block ${order.payment_status === 'paid' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
                        {order.payment_status}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start pt-3 sm:pt-0 border-t sm:border-0 border-gray-100">
                    <span className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded bg-gray-100 text-gray-700`}>
                      {order.fulfillment_status}
                    </span>
                    {isExpanded ? <ChevronUp size={16} className="text-[#9CA3AF]" /> : <ChevronDown size={16} className="text-[#9CA3AF]" />}
                  </div>
                </div>

                {/* Expanded Details Panel */}
                {isExpanded && (
                  <div className="p-5 border-t border-gray-100 bg-[#FAFAFA] text-[13px] space-y-5">
                    {/* Items Purchased */}
                    <div>
                      <h4 className="font-semibold text-[#1A1A1A] mb-3 flex items-center gap-1.5">
                        <ShoppingBag size={14} className="text-[#6B6B6B]" /> Items Purchased
                      </h4>
                      {isLoadingItems ? (
                        <div className="py-4 text-center text-[#9CA3AF]">
                          <span className="inline-block animate-spin mr-1">⌛</span> Loading items...
                        </div>
                      ) : (
                        <div className="space-y-3 bg-white border border-[#000]/[0.04] rounded-[12px] p-4">
                          {itemsList.map((it) => (
                            <div key={it.id} className="flex justify-between items-center text-[12.5px]">
                              <div>
                                <span className="font-medium text-[#1A1A1A]">{it.title}</span>
                                <span className="text-[#9CA3AF] ml-1.5">x{it.quantity}</span>
                              </div>
                              <span className="font-semibold text-[#1A1A1A]">
                                {formatCurrency(it.unit_price * it.quantity)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Delivery & Billing Address */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-1">
                      <div>
                        <h4 className="font-semibold text-[#1A1A1A] mb-2 flex items-center gap-1.5">
                          <Truck size={14} className="text-[#6B6B6B]" /> Delivery Destination
                        </h4>
                        <div className="text-[#6B6B6B] leading-relaxed">
                          <p className="font-medium text-[#1A1A1A]">{order.shipping_address?.fullName || order.shipping_address?.full_name}</p>
                          <p>{order.shipping_address?.addressLine1 || order.shipping_address?.address_line1}</p>
                          <p>
                            {order.shipping_address?.city}, {order.shipping_address?.state} - {order.shipping_address?.zip}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-[#1A1A1A] mb-2 flex items-center gap-1.5">
                            <CreditCard size={14} className="text-[#6B6B6B]" /> Order Summary
                          </h4>
                          <div className="space-y-1 text-[#6B6B6B]">
                            <div className="flex justify-between w-[200px]">
                              <span>Subtotal:</span>
                              <span className="text-[#1A1A1A]">{formatCurrency(order.subtotal)}</span>
                            </div>
                            {order.discount_amount > 0 && (
                              <div className="flex justify-between w-[200px] text-green-700">
                                <span>Discount:</span>
                                <span>-{formatCurrency(order.discount_amount)}</span>
                              </div>
                            )}
                            <div className="flex justify-between w-[200px]">
                              <span>Shipping Cost:</span>
                              <span className="text-[#1A1A1A]">{formatCurrency(order.shipping_cost)}</span>
                            </div>
                            <div className="flex justify-between w-[200px] font-bold text-[#1A1A1A] pt-1 border-t border-gray-200">
                              <span>Total Paid:</span>
                              <span>{formatCurrency(order.total)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Invoice download button */}
                        <div className="pt-4 w-full flex justify-end">
                          <Button
                            onClick={() => handleDownloadReceipt(order)}
                            disabled={isLoadingItems}
                            variant="outline"
                            size="sm"
                            className="h-9 text-[12px] flex items-center gap-1.5"
                          >
                            <Download size={13} /> Download Invoice
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
