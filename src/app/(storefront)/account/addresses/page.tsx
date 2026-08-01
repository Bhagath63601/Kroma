'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/lib/supabase';
import { MapPin, Plus, Trash2, Check, ShieldAlert, Loader2 } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function AccountAddressesPage() {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<any[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Add Address Form States
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zip: '',
    country: 'India',
    isDefault: false,
  });

  const fetchAddresses = async () => {
    if (!user) return;
    try {
      const supabase = createClient();
      const { data, error: fetchErr } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (fetchErr) throw fetchErr;
      setAddresses(data || []);
    } catch (err) {
      console.error('Failed to fetch addresses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setForm((prev) => ({ ...prev, [name]: val }));
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.fullName || !form.phone || !form.addressLine1 || !form.city || !form.state || !form.zip) {
      setError('Please fill in all required fields');
      return;
    }

    if (!/^[0-9]{6}$/.test(form.zip)) {
      setError('Pincode must be exactly 6 digits');
      return;
    }

    setSubmitting(true);

    try {
      const supabase = createClient();

      // If this address is set to default, update all existing default ones to false first
      if (form.isDefault) {
        await supabase
          .from('addresses')
          .update({ is_default: false })
          .eq('user_id', user?.id);
      }

      const { error: insertErr } = await supabase.from('addresses').insert({
        user_id: user?.id,
        full_name: form.fullName,
        phone: form.phone,
        address_line1: form.addressLine1,
        address_line2: form.addressLine2 || null,
        city: form.city,
        state: form.state,
        zip: form.zip,
        country: form.country,
        is_default: form.isDefault || addresses.length === 0, // auto default if it's the first one
      });

      if (insertErr) throw insertErr;

      // Reset form and sync
      setForm({
        fullName: '',
        phone: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        zip: '',
        country: 'India',
        isDefault: false,
      });
      setShowAddForm(false);
      await fetchAddresses();

    } catch (err: any) {
      console.error('Add address error:', err);
      setError(err.message || 'Failed to save address.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSetDefault = async (addressId: string) => {
    try {
      const supabase = createClient();

      // 1. Update other default addresses to false
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', user?.id);

      // 2. Set this address default status to true
      const { error: updateErr } = await supabase
        .from('addresses')
        .update({ is_default: true })
        .eq('id', addressId);

      if (updateErr) throw updateErr;
      await fetchAddresses();

    } catch (err) {
      console.error('Failed to set default address:', err);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    try {
      const supabase = createClient();
      const { error: deleteErr } = await supabase
        .from('addresses')
        .delete()
        .eq('id', addressId);

      if (deleteErr) throw deleteErr;
      await fetchAddresses();
    } catch (err) {
      console.error('Failed to delete address:', err);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-40 bg-gray-200 rounded-[16px]" />
          <div className="h-40 bg-gray-200 rounded-[16px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#000]/[0.05] rounded-[24px] p-6 md:p-8 shadow-sm">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100 gap-4">
        <div>
          <h2 className="text-[20px] font-normal text-[#1A1A1A]" style={{ fontFamily: 'var(--font-serif)' }}>
            Address Book
          </h2>
          <p className="text-[12.5px] text-[#6B6B6B] mt-0.5">Manage your shipping address cards for faster checkout.</p>
        </div>
        {!showAddForm && (
          <Button onClick={() => setShowAddForm(true)} variant="primary" size="sm" className="flex items-center gap-1 text-[12px] h-9">
            <Plus size={14} /> Add Address
          </Button>
        )}
      </div>

      {showAddForm && (
        <div className="mb-8 p-6 bg-[#FAFAFA] border border-[#000]/[0.05] rounded-[20px] relative">
          <h3 className="text-[15px] font-semibold mb-4 text-[#1A1A1A]">Add New Address Card</h3>
          
          {error && (
            <p className="text-[12px] text-red-600 mb-4 bg-red-50 border border-red-200/55 rounded-lg p-2.5">{error}</p>
          )}

          <form onSubmit={handleAddAddress} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#6B6B6B] mb-1 font-medium">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleInputChange}
                  placeholder="e.g. Priyanjali Sen"
                  className="w-full h-10 px-3 border border-[#000]/[0.08] rounded-[8px] text-[13px] outline-none focus:border-[#2563EB]"
                />
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#6B6B6B] mb-1 font-medium">Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  value={form.phone}
                  onChange={handleInputChange}
                  placeholder="e.g. 9876543210"
                  className="w-full h-10 px-3 border border-[#000]/[0.08] rounded-[8px] text-[13px] outline-none focus:border-[#2563EB]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#6B6B6B] mb-1 font-medium">Street Address</label>
              <input
                type="text"
                name="addressLine1"
                value={form.addressLine1}
                onChange={handleInputChange}
                placeholder="Flat / House No., Building, Street address"
                className="w-full h-10 px-3 border border-[#000]/[0.08] rounded-[8px] text-[13px] outline-none focus:border-[#2563EB] mb-2"
              />
              <input
                type="text"
                name="addressLine2"
                value={form.addressLine2}
                onChange={handleInputChange}
                placeholder="Landmark, Area, Colony (Optional)"
                className="w-full h-10 px-3 border border-[#000]/[0.08] rounded-[8px] text-[13px] outline-none focus:border-[#2563EB]"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              <div className="col-span-2">
                <label className="block text-[11px] uppercase tracking-wider text-[#6B6B6B] mb-1 font-medium">City</label>
                <input
                  type="text"
                  name="city"
                  value={form.city}
                  onChange={handleInputChange}
                  placeholder="Kolkata"
                  className="w-full h-10 px-3 border border-[#000]/[0.08] rounded-[8px] text-[13px] outline-none focus:border-[#2563EB]"
                />
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#6B6B6B] mb-1 font-medium">State</label>
                <input
                  type="text"
                  name="state"
                  value={form.state}
                  onChange={handleInputChange}
                  placeholder="WB"
                  className="w-full h-10 px-3 border border-[#000]/[0.08] rounded-[8px] text-[13px] outline-none focus:border-[#2563EB]"
                />
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#6B6B6B] mb-1 font-medium">Pincode</label>
                <input
                  type="text"
                  name="zip"
                  value={form.zip}
                  onChange={handleInputChange}
                  placeholder="700156"
                  className="w-full h-10 px-3 border border-[#000]/[0.08] rounded-[8px] text-[13px] outline-none focus:border-[#2563EB]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#6B6B6B] mb-1 font-medium">Country</label>
              <select
                name="country"
                value={form.country}
                onChange={handleInputChange}
                className="w-full h-10 px-3 border border-[#000]/[0.08] rounded-[8px] text-[13px] bg-white outline-none focus:border-[#2563EB]"
              >
                <option value="India">India</option>
                <option value="United States">United States</option>
                <option value="United Kingdom">United Kingdom</option>
              </select>
            </div>

            <label className="flex items-center gap-2 text-[13px] text-[#1A1A1A] py-1 cursor-pointer">
              <input
                type="checkbox"
                name="isDefault"
                checked={form.isDefault}
                onChange={handleInputChange}
                className="accent-[#2563EB] w-4 h-4"
              />
              Set as default shipping address
            </label>

            <div className="flex gap-3 justify-end pt-3">
              <Button type="button" onClick={() => setShowAddForm(false)} variant="outline" size="sm" className="h-9">
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" className="h-9" disabled={submitting}>
                {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Save Address'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* List of Address Cards */}
      {addresses.length === 0 ? (
        <div className="py-10 text-center border border-dashed border-[#000]/[0.08] rounded-[20px] text-[#9CA3AF]">
          <MapPin size={32} className="mx-auto mb-3 text-gray-300" />
          <p className="text-[14px]">Your address book is empty.</p>
          <p className="text-[12px] mt-1 text-[#6B6B6B]">Add an address card to enable speedier e-commerce checkout.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`p-5 border rounded-[20px] flex flex-col justify-between transition-all ${addr.is_default ? 'border-[#2563EB] bg-[#2563EB]/[0.01]' : 'border-[#000]/[0.05] bg-white hover:border-[#000]/[0.1]'}`}
            >
              <div>
                <div className="flex justify-between items-start gap-4 mb-3">
                  <p className="font-semibold text-[14.5px] text-[#1A1A1A]">{addr.full_name}</p>
                  {addr.is_default && (
                    <span className="text-[10px] bg-[#2563EB]/5 text-[#2563EB] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                      <Check size={10} /> Default
                    </span>
                  )}
                </div>
                <div className="text-[13px] text-[#6B6B6B] leading-relaxed space-y-0.5">
                  <p>{addr.address_line1}</p>
                  {addr.address_line2 && <p>{addr.address_line2}</p>}
                  <p>{addr.city}, {addr.state} - {addr.zip}</p>
                  <p className="font-medium text-[#1A1A1A] pt-1">Phone: {addr.phone}</p>
                </div>
              </div>

              <div className="flex justify-between items-center border-t border-gray-100 pt-4 mt-4">
                {!addr.is_default ? (
                  <button
                    onClick={() => handleSetDefault(addr.id)}
                    className="text-[11.5px] font-semibold text-[#2563EB] hover:text-[#1d4ed8] cursor-pointer"
                  >
                    Set as Default
                  </button>
                ) : (
                  <span className="text-[11.5px] text-[#9CA3AF] font-medium">Default Address</span>
                )}
                
                <button
                  onClick={() => handleDeleteAddress(addr.id)}
                  className="p-1.5 text-[#9CA3AF] hover:text-red-600 rounded-full hover:bg-red-50 transition-colors cursor-pointer"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
