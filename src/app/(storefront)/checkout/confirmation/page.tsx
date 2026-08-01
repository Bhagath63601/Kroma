'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, ShoppingBag, Download, MessageSquare } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import Button from '@/components/ui/Button';

interface OrderDetails {
  orderId: string;
  name: string;
  email: string;
  phone: string;
  shippingAddress?: {
    name: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  shippingMethod: string;
  shippingCost: number;
  subtotal: number;
  discountAmount: number;
  total: number;
  itemsCount: number;
  items: Array<{ title: string; quantity: number; price: number }>;
}

export default function ConfirmationPage() {
  const [order, setOrder] = useState<OrderDetails | null>(null);

  useEffect(() => {
    const savedOrder = sessionStorage.getItem('kroma_latest_order');
    if (savedOrder) {
      try {
        setOrder(JSON.parse(savedOrder));
      } catch (e) {
        console.error('Failed to parse saved order details:', e);
      }
    }
  }, []);

  // Simulated invoice download
  const handleDownloadInvoice = () => {
    if (!order) return;
    
    const invoiceContent = `
===================================================
                KROMA CREATIONS
           Handcrafted Ceramic Vases
===================================================
Invoice Date: ${new Date().toLocaleDateString()}
Order ID: ${order.orderId}
Billing Name: ${order.name}
Phone Number: ${order.phone}
Email Address: ${order.email || 'N/A'}
Items Purchased: ${order.itemsCount}
Total Amount: INR ${order.total.toFixed(2)}
Payment Status: PENDING OFFLINE PAYMENT / WHATSAPP CONFIRMATION
===================================================
Thank you for supporting artisanal craftsmanship!
Please confirm your order via WhatsApp to arrange payment.
    `.trim();

    const blob = new Blob([invoiceContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `order-request-${order.orderId}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!order) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] pt-[120px] pb-24 flex items-center justify-center">
        <div className="text-center p-8 bg-white border border-[#000]/[0.05] rounded-[24px] max-w-[400px] shadow-sm">
          <div className="text-[32px] mb-4">🏺</div>
          <h1 className="text-[20px] font-normal mb-2" style={{ fontFamily: 'var(--font-serif)' }}>No Order Found</h1>
          <p className="text-[14px] text-[#6B6B6B] mb-6">
            We couldn't locate any recent transaction details. Browse our collections to start shopping.
          </p>
          <Link href="/products">
            <Button variant="primary">Browse Creations</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Construct WhatsApp Link
  const sellerNumber = process.env.NEXT_PUBLIC_SELLER_WHATSAPP_NUMBER || '919876543210';
  const cleanSellerNumber = sellerNumber.replace(/\D/g, ''); // Keep only numbers
  
  const itemsText = order.items
    ? order.items.map(it => `- ${it.quantity}x ${it.title} (₹${(it.price).toLocaleString('en-IN')})`).join('\n')
    : `- ${order.itemsCount} items`;

  const addressText = order.shippingAddress
    ? `${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.zip}`
    : 'N/A';

  const messageBody = `🔔 *New Order Request - Kroma*\n` +
    `----------------------------------\n` +
    `*Order ID:* ${order.orderId}\n` +
    `*Customer:* ${order.name}\n` +
    `*WhatsApp:* ${order.phone}\n` +
    `*Email:* ${order.email || 'N/A'}\n\n` +
    `*Delivery Address:*\n` +
    `${addressText}\n\n` +
    `*Delivery Method:* ${order.shippingMethod === 'express' ? 'Express Priority Shipping' : 'Standard Delivery'}\n\n` +
    `*Items Ordered:*\n` +
    `${itemsText}\n\n` +
    `*Order Summary:*\n` +
    `Subtotal: ₹${order.subtotal.toLocaleString('en-IN')}\n` +
    (order.discountAmount > 0 ? `Discount: -₹${order.discountAmount.toLocaleString('en-IN')}\n` : '') +
    `Shipping: ₹${order.shippingCost.toLocaleString('en-IN')}\n` +
    `*Total Payable:* ₹${order.total.toLocaleString('en-IN')}\n` +
    `----------------------------------\n` +
    `Please confirm my order and share payment details (UPI/Bank Transfer). Thank you!`;

  const whatsappUrl = `https://api.whatsapp.com/send?phone=${cleanSellerNumber}&text=${encodeURIComponent(messageBody)}`;

  return (
    <div className="min-h-screen bg-[#FAFAFA] pt-[120px] pb-24 flex items-center justify-center">
      <div className="max-w-[600px] w-full px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 20, stiffness: 100 }}
          className="bg-white border border-[#000]/[0.05] rounded-[32px] p-8 md:p-10 shadow-lg text-center flex flex-col items-center"
        >
          {/* Animated WhatsApp / Check icon */}
          <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mb-6 border border-amber-100 shadow-inner">
            <svg className="w-8 h-8 text-amber-600 fill-current" viewBox="0 0 24 24">
              <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.96 9.96 0 001.333 4.993L2 22l5.233-1.371a9.944 9.944 0 004.777 1.224h.005c5.505 0 9.99-4.478 9.99-9.986 0-2.67-1.037-5.178-2.92-7.062C17.16 3.039 14.655 2 12.012 2zM12 20.198c-1.55 0-3.072-.415-4.405-1.2l-.316-.188-3.27.858.873-3.187-.207-.33A7.954 7.954 0 014.022 12c.001-4.405 3.584-7.987 7.99-7.987 2.135 0 4.141.83 5.65 2.342 1.51 1.512 2.34 3.52 2.34 5.647-.002 4.406-3.585 7.986-7.992 7.986zm4.386-5.99c-.24-.12-1.42-.7-1.643-.78-.223-.08-.387-.12-.55.12-.162.24-.63.78-.77.94-.143.16-.285.18-.525.06-.24-.12-.997-.37-1.9-1.17-.702-.625-1.176-1.4-1.313-1.64-.137-.24-.015-.37.106-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.55-1.32-.75-1.81-.197-.474-.397-.41-.55-.418h-.47c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.69 2.581 4.1 3.62.573.247 1.02.394 1.368.504.575.183 1.097.157 1.51.096.46-.067 1.42-.58 1.62-1.11.2-.53.2-1 .14-1.11-.06-.112-.24-.183-.48-.303z"/>
            </svg>
          </div>

          <span className="text-[11px] uppercase tracking-widest text-amber-700 bg-amber-50 px-3 py-1 rounded-full font-medium mb-3 border border-amber-100">
            Order Pending WhatsApp Confirmation
          </span>

          <h1 className="text-[28px] md:text-[32px] font-normal text-[#1A1A1A] leading-tight mb-3" style={{ fontFamily: 'var(--font-serif)' }}>
            Order Request Placed!
          </h1>
          
          <p className="text-[14px] text-[#6B6B6B] leading-relaxed mb-6 max-w-[420px]">
            Thank you! Your order request has been logged. To complete your payment and confirm your purchase, please click the button below to message us on WhatsApp.
          </p>

          {/* WhatsApp Primary Action Button */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full mb-8 block"
          >
            <Button
              variant="primary"
              className="w-full py-4 h-14 text-[15px] flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#20BA5A] border-none text-white font-bold shadow-md shadow-green-100 transition-all hover:scale-[1.01]"
              shimmer
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.96 9.96 0 001.333 4.993L2 22l5.233-1.371a9.944 9.944 0 004.777 1.224h.005c5.505 0 9.99-4.478 9.99-9.986 0-2.67-1.037-5.178-2.92-7.062C17.16 3.039 14.655 2 12.012 2zM12 20.198c-1.55 0-3.072-.415-4.405-1.2l-.316-.188-3.27.858.873-3.187-.207-.33A7.954 7.954 0 014.022 12c.001-4.405 3.584-7.987 7.99-7.987 2.135 0 4.141.83 5.65 2.342 1.51 1.512 2.34 3.52 2.34 5.647-.002 4.406-3.585 7.986-7.992 7.986zm4.386-5.99c-.24-.12-1.42-.7-1.643-.78-.223-.08-.387-.12-.55.12-.162.24-.63.78-.77.94-.143.16-.285.18-.525.06-.24-.12-.997-.37-1.9-1.17-.702-.625-1.176-1.4-1.313-1.64-.137-.24-.015-.37.106-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.55-1.32-.75-1.81-.197-.474-.397-.41-.55-.418h-.47c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.69 2.581 4.1 3.62.573.247 1.02.394 1.368.504.575.183 1.097.157 1.51.096.46-.067 1.42-.58 1.62-1.11.2-.53.2-1 .14-1.11-.06-.112-.24-.183-.48-.303z"/>
              </svg>
              Confirm & Pay on WhatsApp
            </Button>
          </a>

          {/* Order Details Breakdown Card */}
          <div className="w-full bg-[#FAFAFA] border border-[#000]/[0.04] rounded-[20px] p-5 mb-8 text-left text-[13.5px] space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-gray-200/50">
              <span className="text-[#6B6B6B]">Order Number</span>
              <span className="font-semibold text-[#1A1A1A]">{order.orderId}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-[#6B6B6B]">Customer Name</span>
              <span className="font-medium text-[#1A1A1A]">{order.name}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-[#6B6B6B]">Contact Phone</span>
              <span className="font-medium text-[#1A1A1A]">{order.phone}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-[#6B6B6B]">Total Payable Amount</span>
              <span className="font-bold text-[#1A1A1A]">{formatCurrency(order.total)}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <Button
              onClick={handleDownloadInvoice}
              variant="outline"
              className="flex-1 py-3 h-12 text-[13px] flex items-center justify-center gap-1.5"
            >
              <Download size={14} /> Download Order Slip
            </Button>
            
            <Link href="/products" className="flex-1">
              <Button
                variant="outline"
                className="w-full py-3 h-12 text-[13px] flex items-center justify-center gap-1.5"
              >
                Continue Shopping <ArrowRight size={14} />
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
