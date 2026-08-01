'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, MapPin, Truck, CreditCard, ShoppingBag, ShieldCheck, Tag, Loader2 } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/lib/supabase';
import { formatCurrency, isSaleActive } from '@/lib/utils';
import Button from '@/components/ui/Button';

// Step definition
type CheckoutStep = 'shipping' | 'method' | 'payment';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 
  'Uttarakhand', 'West Bengal', 'Andaman and Nicobar Islands', 'Chandigarh', 
  'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Jammu and Kashmir', 'Ladakh', 
  'Lakshadweep', 'Puducherry'
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, itemCount, clearCart } = useCart();
  const { user, profile } = useAuth();
  const [step, setStep] = useState<CheckoutStep>('shipping');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Address verification states
  const [isVerifyingAddress, setIsVerifyingAddress] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    status: 'exact' | 'partial' | 'unverified';
    lat?: string;
    lon?: string;
    displayName?: string;
  } | null>(null);

  // Applied coupon state
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discountPercent: number } | null>(null);

  // Load coupon from session storage
  useEffect(() => {
    const savedPromo = sessionStorage.getItem('kroma_promo');
    if (savedPromo) {
      try {
        setAppliedPromo(JSON.parse(savedPromo));
      } catch {}
    }
  }, []);

  // Shipping Form States
  const [shippingForm, setShippingForm] = useState({
    name: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    lat: '',
    lon: '',
    verifiedAddress: '',
    verificationStatus: '',
  });

  // Prefill details from profile and default address
  useEffect(() => {
    if (user) {
      setShippingForm((prev) => ({
        ...prev,
        name: prev.name || profile?.full_name || '',
        email: prev.email || user.email || '',
        phone: prev.phone || profile?.phone || '',
      }));

      const fetchDefaultAddress = async () => {
        try {
          const supabase = createClient();
          const { data: addresses } = await supabase
            .from('addresses')
            .select('*')
            .eq('user_id', user.id)
            .eq('is_default', true)
            .limit(1);

          if (addresses && addresses.length > 0) {
            const addr = addresses[0];
            setShippingForm({
              name: addr.full_name,
              email: user.email || '',
              phone: addr.phone || '',
              street: addr.address_line1 + (addr.address_line2 ? `, ${addr.address_line2}` : ''),
              city: addr.city,
              state: addr.state,
              zip: addr.zip,
              lat: '',
              lon: '',
              verifiedAddress: '',
              verificationStatus: '',
            });
          }
        } catch (err) {
          console.error('Failed to prefetch default checkout address:', err);
        }
      };

      fetchDefaultAddress();
    }
  }, [user, profile]);

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Shipping Method States
  // Options: standard (150, free over 3000), express (350)
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express'>('standard');
  const isFreeShipping = subtotal >= 3000;
  const standardShippingCost = isFreeShipping ? 0 : 150;
  const expressShippingCost = 350;
  const shippingCost = shippingMethod === 'standard' ? standardShippingCost : expressShippingCost;

  // Pricing calculations
  const discountAmount = appliedPromo ? (subtotal * appliedPromo.discountPercent) / 100 : 0;
  const grandTotal = Math.max(0, subtotal - discountAmount + shippingCost);

  // Redirect to cart if empty
  useEffect(() => {
    if (items.length === 0 && !isSubmitting) {
      router.push('/cart');
    }
  }, [items, router, isSubmitting]);

  // Form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShippingForm((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Validate Step 1 Shipping
  const validateShipping = () => {
    const errors: Record<string, string> = {};
    if (!shippingForm.name.trim()) errors.name = 'Full name is required';
    if (shippingForm.email.trim() && !/\S+@\S+\.\S+/.test(shippingForm.email)) {
      errors.email = 'Please enter a valid email';
    }
    
    const cleanedPhone = shippingForm.phone.replace(/\s+/g, '');
    const phoneRegex = /^(?:\+91|91)?[6-9]\d{9}$/;
    
    if (!shippingForm.phone.trim()) {
      errors.phone = 'WhatsApp number is required';
    } else if (!phoneRegex.test(cleanedPhone)) {
      errors.phone = 'Please enter a valid Indian WhatsApp number (10 digits)';
    }
    
    if (!shippingForm.street.trim()) {
      errors.street = 'Street address is required';
    } else if (shippingForm.street.trim().length < 8) {
      errors.street = 'Please enter a detailed street address (minimum 8 characters)';
    }
    
    if (!shippingForm.city.trim()) errors.city = 'City is required';
    if (!shippingForm.state.trim()) errors.state = 'State is required';
    
    const zipRegex = /^[1-9][0-9]{5}$/;
    if (!shippingForm.zip.trim()) {
      errors.zip = 'Pincode is required';
    } else if (!zipRegex.test(shippingForm.zip.trim())) {
      errors.zip = 'Please enter a valid 6-digit Indian PIN code';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const runAddressVerification = async () => {
    setIsVerifyingAddress(true);
    setVerificationResult(null);
    try {
      const response = await fetch('/api/checkout/verify-address', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          street: shippingForm.street,
          city: shippingForm.city,
          state: shippingForm.state,
          zip: shippingForm.zip,
        }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setVerificationResult({
          status: data.status,
          lat: data.lat,
          lon: data.lon,
          displayName: data.displayName,
        });
      } else {
        setVerificationResult({ status: 'unverified' });
      }
    } catch (error) {
      console.error('Address verification error:', error);
      setVerificationResult({ status: 'unverified' });
    } finally {
      setIsVerifyingAddress(false);
    }
  };

  const nextStep = async () => {
    if (step === 'shipping') {
      if (validateShipping()) {
        if (verificationResult) {
          setStep('method');
        } else {
          await runAddressVerification();
        }
      }
    } else if (step === 'method') {
      setStep('payment');
    }
  };

  const prevStep = () => {
    if (step === 'method') setStep('shipping');
    if (step === 'payment') setStep('method');
  };



  // Handle payment processing
  const handlePlaceOrder = async () => {
    setIsSubmitting(true);

    try {
      const mockOrderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;

      const res = await fetch('/api/checkout/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderNumber: mockOrderId,
          shippingForm,
          shippingMethod,
          shippingCost,
          subtotal,
          discountAmount,
          grandTotal,
          items,
          userId: user?.id || null,
        }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to process order');
      }

      sessionStorage.setItem('kroma_latest_order', JSON.stringify({
        orderId: data.orderId,
        name: shippingForm.name,
        email: shippingForm.email,
        phone: shippingForm.phone,
        shippingAddress: {
          name: shippingForm.name,
          phone: shippingForm.phone,
          street: shippingForm.street,
          city: shippingForm.city,
          state: shippingForm.state,
          zip: shippingForm.zip,
        },
        shippingMethod,
        shippingCost,
        subtotal,
        discountAmount,
        total: grandTotal,
        itemsCount: itemCount,
        items: items.map(it => ({
          title: it.product.title,
          quantity: it.quantity,
          price: it.variant?.price ?? it.product.price,
        })),
      }));
      
      clearCart();
      sessionStorage.removeItem('kroma_promo');
      router.push('/checkout/confirmation');
    } catch (error: any) {
      console.error('Checkout error:', error);
      alert(`Checkout failed: ${error.message || error}`);
      setIsSubmitting(false);
    }
  };

  if (items.length === 0 && !isSubmitting) {
    return null; // Let useEffect redirect
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] pt-[120px] pb-24">
      {/* Simulation loader screen overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-md z-[999] flex flex-col items-center justify-center">
          <Loader2 className="w-10 h-10 text-[#2563EB] animate-spin mb-4" />
          <h2 className="text-[18px] font-medium text-[#1A1A1A]">Processing Your Order...</h2>
          <p className="text-[13px] text-[#6B6B6B] mt-1">Please do not close this window or click back.</p>
        </div>
      )}

      <div className="max-w-[1440px] mx-auto px-6 md:px-16">
        {/* Step Indicator Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-[#000]/[0.05] pb-8 mb-10 gap-6">
          <div>
            <h1 className="text-[32px] font-normal text-[#1A1A1A] leading-tight" style={{ fontFamily: 'var(--font-serif)' }}>
              Checkout
            </h1>
            <div className="mt-4 bg-[#F0FDF4] border border-[#BBF7D0] text-[#166534] px-4 py-3 rounded-xl text-[15px] font-medium shadow-sm inline-block">
              <span className="font-bold">Note:</span> The phone number provided will be used to contact you via WhatsApp for order confirmation.
            </div>
          </div>

          {/* Indicators */}
          <div className="flex items-center gap-4 text-[13px] font-medium text-[#6B6B6B]">
            <div className={`flex items-center gap-2 ${step === 'shipping' ? 'text-[#2563EB]' : 'text-green-700'}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center border text-[11px] ${step === 'shipping' ? 'border-[#2563EB] bg-[#2563EB]/5' : 'border-green-700 bg-green-50'}`}>
                {step !== 'shipping' ? <Check size={12} /> : '1'}
              </span>
              <span>Shipping</span>
            </div>
            <span className="w-8 h-[1px] bg-gray-200" />

            <div className={`flex items-center gap-2 ${step === 'method' ? 'text-[#2563EB]' : 'text-gray-400'}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center border text-[11px] ${step === 'method' ? 'border-[#2563EB] bg-[#2563EB]/5' : 'border-gray-200'}`}>
                2
              </span>
              <span>Delivery</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Wizard Form Body */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {/* STEP 1: SHIPPING DETAILS */}
              {step === 'shipping' && (
                <motion.div
                  key="shipping-step"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="bg-white border border-[#000]/[0.05] rounded-[24px] p-6 md:p-8 shadow-sm"
                >
                  <h2 className="text-[20px] font-normal mb-6 text-[#1A1A1A]" style={{ fontFamily: 'var(--font-serif)' }}>
                    Shipping Address
                  </h2>

                  <div className="space-y-5">
                    <div>
                      <label className="block text-[12px] uppercase tracking-wider text-[#6B6B6B] mb-1.5 font-medium">Full Name</label>
                      <input
                        type="text"
                        name="name"
                        value={shippingForm.name}
                        onChange={handleInputChange}
                        disabled={verificationResult !== null || isVerifyingAddress}
                        placeholder="e.g. Priyanjali Sen"
                        className={`w-full h-11 px-4 border rounded-[8px] text-[14px] outline-none transition-colors ${formErrors.name ? 'border-red-500 bg-red-50/10' : 'border-[#000]/[0.08] focus:border-[#2563EB]'} ${verificationResult !== null ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''}`}
                      />
                      {formErrors.name && <p className="text-[11px] text-red-500 mt-1">{formErrors.name}</p>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-[12px] uppercase tracking-wider text-[#6B6B6B] mb-1.5 font-medium">Email Address (Optional)</label>
                        <input
                          type="email"
                          name="email"
                          value={shippingForm.email}
                          onChange={handleInputChange}
                          disabled={verificationResult !== null || isVerifyingAddress}
                          placeholder="e.g. priyanjali@gmail.com"
                          className={`w-full h-11 px-4 border rounded-[8px] text-[14px] outline-none transition-colors ${formErrors.email ? 'border-red-500 bg-red-50/10' : 'border-[#000]/[0.08] focus:border-[#2563EB]'} ${verificationResult !== null ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''}`}
                        />
                        {formErrors.email && <p className="text-[11px] text-red-500 mt-1">{formErrors.email}</p>}
                      </div>

                      <div>
                        <label className="block text-[12px] uppercase tracking-wider text-[#6B6B6B] mb-1.5 font-medium">WhatsApp Number *</label>
                        <input
                          type="text"
                          name="phone"
                          value={shippingForm.phone}
                          onChange={handleInputChange}
                          disabled={verificationResult !== null || isVerifyingAddress}
                          placeholder="e.g. 9876543210"
                          className={`w-full h-11 px-4 border rounded-[8px] text-[14px] outline-none transition-colors ${formErrors.phone ? 'border-red-500 bg-red-50/10' : 'border-[#000]/[0.08] focus:border-[#2563EB]'} ${verificationResult !== null ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''}`}
                        />
                        {formErrors.phone && <p className="text-[11px] text-red-500 mt-1">{formErrors.phone}</p>}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[12px] uppercase tracking-wider text-[#6B6B6B] mb-1.5 font-medium">Street Address</label>
                      <input
                        type="text"
                        name="street"
                        value={shippingForm.street}
                        onChange={handleInputChange}
                        disabled={verificationResult !== null || isVerifyingAddress}
                        placeholder="e.g. Block C, Flat 402, Green Meadows"
                        className={`w-full h-11 px-4 border rounded-[8px] text-[14px] outline-none transition-colors ${formErrors.street ? 'border-red-500 bg-red-50/10' : 'border-[#000]/[0.08] focus:border-[#2563EB]'} ${verificationResult !== null ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''}`}
                      />
                      {formErrors.street && <p className="text-[11px] text-red-500 mt-1">{formErrors.street}</p>}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="col-span-2">
                        <label className="block text-[12px] uppercase tracking-wider text-[#6B6B6B] mb-1.5 font-medium">City</label>
                        <input
                          type="text"
                          name="city"
                          value={shippingForm.city}
                          onChange={handleInputChange}
                          disabled={verificationResult !== null || isVerifyingAddress}
                          placeholder="e.g. Kolkata"
                          className={`w-full h-11 px-4 border rounded-[8px] text-[14px] outline-none transition-colors ${formErrors.city ? 'border-red-500 bg-red-50/10' : 'border-[#000]/[0.08] focus:border-[#2563EB]'} ${verificationResult !== null ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''}`}
                        />
                        {formErrors.city && <p className="text-[11px] text-red-500 mt-1">{formErrors.city}</p>}
                      </div>

                      <div>
                        <label className="block text-[12px] uppercase tracking-wider text-[#6B6B6B] mb-1.5 font-medium">State</label>
                        <select
                          name="state"
                          value={shippingForm.state}
                          onChange={(e) => {
                            setShippingForm((prev) => ({ ...prev, state: e.target.value }));
                            if (formErrors.state) {
                              setFormErrors((prev) => ({ ...prev, state: '' }));
                            }
                          }}
                          disabled={verificationResult !== null || isVerifyingAddress}
                          className={`w-full h-11 px-4 border rounded-[8px] text-[14px] outline-none bg-white transition-colors ${formErrors.state ? 'border-red-500 bg-red-50/10' : 'border-[#000]/[0.08] focus:border-[#2563EB]'} ${verificationResult !== null ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''}`}
                        >
                          <option value="">Select State</option>
                          {INDIAN_STATES.map((st) => (
                            <option key={st} value={st}>{st}</option>
                          ))}
                        </select>
                        {formErrors.state && <p className="text-[11px] text-red-500 mt-1">{formErrors.state}</p>}
                      </div>

                      <div>
                        <label className="block text-[12px] uppercase tracking-wider text-[#6B6B6B] mb-1.5 font-medium">Pincode</label>
                        <input
                          type="text"
                          name="zip"
                          value={shippingForm.zip}
                          onChange={handleInputChange}
                          disabled={verificationResult !== null || isVerifyingAddress}
                          placeholder="e.g. 700156"
                          className={`w-full h-11 px-4 border rounded-[8px] text-[14px] outline-none transition-colors ${formErrors.zip ? 'border-red-500 bg-red-50/10' : 'border-[#000]/[0.08] focus:border-[#2563EB]'} ${verificationResult !== null ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''}`}
                        />
                        {formErrors.zip && <p className="text-[11px] text-red-500 mt-1">{formErrors.zip}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Address Verification Map & Prompt */}
                  {verificationResult && (
                    <div className="mt-6 p-6 bg-[#FAFAFA] border border-[#000]/[0.05] rounded-[20px] space-y-4">
                      <div className="flex items-start gap-3">
                        {verificationResult.status === 'exact' && (
                          <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-700 flex-shrink-0 mt-0.5">
                            <Check size={16} />
                          </div>
                        )}
                        {verificationResult.status === 'partial' && (
                          <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-700 flex-shrink-0 mt-0.5">
                            <MapPin size={16} />
                          </div>
                        )}
                        {verificationResult.status === 'unverified' && (
                          <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-700 flex-shrink-0 mt-0.5">
                            <MapPin size={16} />
                          </div>
                        )}
                        <div>
                          <h4 className="font-semibold text-[15px] text-[#1A1A1A]">
                            {verificationResult.status === 'exact' && 'Address Verified Successfully'}
                            {verificationResult.status === 'partial' && 'Pincode & City Verified'}
                            {verificationResult.status === 'unverified' && 'Address Verification Failed'}
                          </h4>
                          <p className="text-[13px] text-[#6B6B6B] mt-1">
                            {verificationResult.status === 'exact' && 'We mapped your exact street address. Please confirm the marker location below.'}
                            {verificationResult.status === 'partial' && "We found your general area on the map, but couldn't pinpoint the exact street. Please verify your street details are correct."}
                            {verificationResult.status === 'unverified' && "We couldn't verify this address or postal code. Please double-check for typos."}
                          </p>
                          {verificationResult.displayName && (
                            <p className="text-[12px] text-[#9CA3AF] mt-2 italic bg-gray-50 p-2.5 rounded-[10px] border border-[#000]/[0.03]">
                              Detected: {verificationResult.displayName}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Map Display */}
                      {(verificationResult.status === 'exact' || verificationResult.status === 'partial') && verificationResult.lat && verificationResult.lon && (
                        <div className="relative w-full h-[220px] rounded-[16px] overflow-hidden border border-[#000]/[0.08] bg-[#F5F5F0]">
                          <iframe
                            width="100%"
                            height="100%"
                            frameBorder="0"
                            scrolling="no"
                            marginHeight={0}
                            marginWidth={0}
                            src={`https://www.openstreetmap.org/export/embed.html?bbox=${parseFloat(verificationResult.lon) - 0.005}%2C${parseFloat(verificationResult.lat) - 0.005}%2C${parseFloat(verificationResult.lon) + 0.005}%2C${parseFloat(verificationResult.lat) + 0.005}&layer=mapnik&marker=${verificationResult.lat}%2C${verificationResult.lon}`}
                            className="absolute inset-0"
                          />
                        </div>
                      )}

                      {/* Action buttons inside verification container */}
                      <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-[#000]/[0.05]">
                        <button
                          type="button"
                          onClick={() => {
                            setShippingForm(prev => ({
                              ...prev,
                              lat: verificationResult.lat || '',
                              lon: verificationResult.lon || '',
                              verifiedAddress: verificationResult.displayName || '',
                              verificationStatus: verificationResult.status,
                            }));
                            setStep('method');
                          }}
                          className="flex-1 h-11 px-6 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-[12px] text-[13px] font-medium transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          {verificationResult.status === 'unverified' ? 'Proceed Anyway' : 'Confirm Location & Proceed'} <ArrowRight size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setVerificationResult(null)}
                          className="h-11 px-6 border border-[#000]/[0.08] hover:bg-gray-50 text-[#1A1A1A] rounded-[12px] text-[13px] font-medium transition-colors"
                        >
                          Edit Details
                        </button>
                      </div>
                    </div>
                  )}

                  {verificationResult === null && (
                    <div className="flex justify-end mt-8 pt-4 border-t border-[#000]/[0.05]">
                      <Button 
                        onClick={nextStep} 
                        variant="primary" 
                        className="py-2.5 px-6 text-[13px] flex items-center gap-1.5"
                        disabled={isVerifyingAddress}
                      >
                        {isVerifyingAddress ? (
                          <>
                            Verifying Address... <Loader2 size={14} className="animate-spin" />
                          </>
                        ) : (
                          <>
                            Continue to Delivery <ArrowRight size={14} />
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </motion.div>
              )}

              {/* STEP 2: SHIPPING METHODS */}
              {step === 'method' && (
                <motion.div
                  key="method-step"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="bg-white border border-[#000]/[0.05] rounded-[24px] p-6 md:p-8 shadow-sm"
                >
                  <h2 className="text-[20px] font-normal mb-6 text-[#1A1A1A]" style={{ fontFamily: 'var(--font-serif)' }}>
                    Select Delivery Speed
                  </h2>

                  <div className="space-y-4">
                    {/* Standard method */}
                    <label className={`flex items-center justify-between p-5 border rounded-[16px] cursor-pointer transition-all ${shippingMethod === 'standard' ? 'border-[#2563EB] bg-[#2563EB]/[0.02]' : 'border-[#000]/[0.08] hover:bg-[#FAFAFA]'}`}>
                      <div className="flex gap-4 items-center">
                        <input
                          type="radio"
                          name="shipping_speed"
                          checked={shippingMethod === 'standard'}
                          onChange={() => setShippingMethod('standard')}
                          className="accent-[#2563EB] w-4 h-4"
                        />
                        <div>
                          <p className="font-semibold text-[15px] text-[#1A1A1A]">Standard Delivery</p>
                          <p className="text-[12px] text-[#6B6B6B] mt-0.5">Delivered within 4-7 business days</p>
                        </div>
                      </div>
                      <span className="font-semibold text-[15px] text-[#1A1A1A]">
                        {standardShippingCost === 0 ? 'FREE' : formatCurrency(standardShippingCost)}
                      </span>
                    </label>

                    {/* Express method */}
                    <label className={`flex items-center justify-between p-5 border rounded-[16px] cursor-pointer transition-all ${shippingMethod === 'express' ? 'border-[#2563EB] bg-[#2563EB]/[0.02]' : 'border-[#000]/[0.08] hover:bg-[#FAFAFA]'}`}>
                      <div className="flex gap-4 items-center">
                        <input
                          type="radio"
                          name="shipping_speed"
                          checked={shippingMethod === 'express'}
                          onChange={() => setShippingMethod('express')}
                          className="accent-[#2563EB] w-4 h-4"
                        />
                        <div>
                          <p className="font-semibold text-[15px] text-[#1A1A1A]">Express Priority Shipping</p>
                          <p className="text-[12px] text-[#6B6B6B] mt-0.5">Delivered within 1-3 business days (with tracked priority care)</p>
                        </div>
                      </div>
                      <span className="font-semibold text-[15px] text-[#1A1A1A]">
                        {formatCurrency(expressShippingCost)}
                      </span>
                    </label>
                  </div>

                  <div className="flex justify-between mt-8 pt-4 border-t border-[#000]/[0.05]">
                    <Button onClick={prevStep} variant="outline" className="py-2.5 px-5 text-[13px]">
                      <ArrowLeft size={14} /> Back
                    </Button>
                    <Button onClick={handlePlaceOrder} variant="primary" className="py-2.5 px-6 text-[13px]" disabled={isSubmitting}>
                      Place Order <ArrowRight size={14} />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* STEP 3 (Payment) removed for WhatsApp direct flow */}
            </AnimatePresence>
          </div>

          {/* Right Summary Side Drawer */}
          <div>
            <div className="bg-white border border-[#000]/[0.05] rounded-[24px] p-6 shadow-sm sticky top-[100px] space-y-6">
              <h3 className="text-[17px] font-semibold text-[#1A1A1A]">Creations Selected</h3>

              {/* Mini Cart Listing */}
              <div className="max-h-[200px] overflow-y-auto pr-1 space-y-4 border-b border-[#000]/[0.05] pb-5">
                {items.map((it) => (
                  <div key={it.id} className="flex gap-3 items-center justify-between text-[13px]">
                    <div className="flex gap-2.5 items-center">
                      <div className="w-10 h-10 rounded-[6px] overflow-hidden bg-[#F5F5F0] border border-[#000]/[0.05]">
                        <img
                          src={it.product.images?.[0]?.image_url || '/samples/1/pomelli_photoshoot-1.png'}
                          alt={it.product.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="max-w-[140px]">
                        <p className="font-medium text-[#1A1A1A] truncate">{it.product.title}</p>
                        <p className="text-[11px] text-[#9CA3AF]">Qty: {it.quantity}</p>
                      </div>
                    </div>
                    <span className="font-medium text-[#1A1A1A]">
                      {formatCurrency((it.variant?.price ?? it.product.price) * it.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Pricing breakdown */}
              <div className="space-y-3.5 text-[13px] border-b border-[#000]/[0.05] pb-5 text-[#6B6B6B]">
                <div className="flex justify-between">
                  <span>Subtotal ({itemCount} items)</span>
                  <span className="text-[#1A1A1A] font-medium">{formatCurrency(subtotal)}</span>
                </div>

                {appliedPromo && (
                  <div className="flex justify-between text-green-700 items-center">
                    <span className="flex items-center gap-1">
                      <Tag size={12} /> Discount ({appliedPromo.code})
                    </span>
                    <span>-{formatCurrency(discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Shipping Cost</span>
                  {shippingCost === 0 ? (
                    <span className="text-green-700 font-medium">FREE</span>
                  ) : (
                    <span className="text-[#1A1A1A] font-medium">{formatCurrency(shippingCost)}</span>
                  )}
                </div>
              </div>

              {/* Total Price */}
              <div className="flex justify-between items-end pt-1">
                <span className="text-[14px] font-medium text-[#1A1A1A]">Total Payable</span>
                <span className="text-[20px] font-bold text-[#1A1A1A] tracking-tight">
                  {formatCurrency(grandTotal)}
                </span>
              </div>

              {/* Secure checkout badges */}
              <div className="bg-[#FAFAFA] border border-[#000]/[0.04] rounded-[12px] p-3 text-[11px] text-[#9CA3AF] flex items-center gap-2">
                <ShieldCheck size={14} className="text-green-700 flex-shrink-0" />
                <span>256-bit SSL encrypted secure checkout and transaction monitoring.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
