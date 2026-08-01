'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { Plus, Trash2, X, Loader2, Save, Tag } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import Button from '@/components/ui/Button';
import type { Coupon } from '@/types';

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  // Form overlay states
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Form states
  const [code, setCode] = useState('');
  const [type, setType] = useState<'percentage' | 'fixed'>('percentage');
  const [value, setValue] = useState('');
  const [minOrderAmount, setMinOrderAmount] = useState('');
  const [usageLimit, setUsageLimit] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch coupons
  const fetchData = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCoupons(data || []);
    } catch (err) {
      console.error('Failed to query coupons:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddForm = () => {
    setCode('');
    setType('percentage');
    setValue('');
    setMinOrderAmount('');
    setUsageLimit('');
    setIsActive(true);
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !value) {
      alert('Please provide a coupon code and value.');
      return;
    }

    setIsSubmitting(true);
    try {
      const supabase = createClient();
      
      const payload = {
        code: code.toUpperCase(),
        type,
        value: parseFloat(value),
        min_order_amount: minOrderAmount ? parseFloat(minOrderAmount) : null,
        usage_limit: usageLimit ? parseInt(usageLimit) : null,
        is_active: isActive
      };

      const { error } = await supabase
        .from('coupons')
        .insert(payload);

      if (error) throw error;

      setIsFormOpen(false);
      fetchData();
    } catch (err: any) {
      console.error('Failed to create coupon:', err);
      alert(err.message || 'An error occurred while creating the coupon.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this coupon? This action cannot be undone.')) {
      return;
    }

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('coupons')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchData();
    } catch (err: any) {
      console.error('Failed to delete coupon:', err);
      alert(err.message || 'An error occurred while deleting this coupon.');
    }
  };

  const toggleStatus = async (coupon: Coupon) => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('coupons')
        .update({ is_active: !coupon.is_active })
        .eq('id', coupon.id);

      if (error) throw error;
      fetchData();
    } catch (err: any) {
      console.error('Failed to toggle coupon status:', err);
      alert('Could not update the coupon status.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-[26px] font-normal text-gray-900 leading-tight" style={{ fontFamily: 'var(--font-serif)' }}>
            Discount Codes
          </h2>
          <p className="text-[13px] text-gray-500 mt-1">Create promotional coupons, manage limits, and track usage.</p>
        </div>
        <Button onClick={openAddForm} variant="primary" className="h-10 text-[12.5px] px-4 py-2 flex items-center gap-1.5">
          <Plus size={16} /> Create Coupon
        </Button>
      </div>

      {/* Coupons Table */}
      <div className="bg-white border border-gray-200 rounded-[24px] overflow-hidden shadow-sm">
        {loading && coupons.length === 0 ? (
           <div className="flex items-center justify-center p-12">
             <Loader2 className="w-8 h-8 text-[#2563EB] animate-spin" />
           </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[13px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50 text-gray-400 font-semibold">
                  <th className="p-4 pl-6">Promo Code</th>
                  <th className="p-4">Discount</th>
                  <th className="p-4">Min. Spend</th>
                  <th className="p-4">Usage</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 pr-6 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {coupons.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-400">No discount codes created yet.</td>
                  </tr>
                ) : (
                  coupons.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50/20">
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-2">
                          <Tag size={14} className="text-[#2563EB]" />
                          <span className="font-bold text-gray-900 tracking-wide font-mono">{c.code}</span>
                        </div>
                      </td>
                      <td className="p-4 font-medium text-gray-900">
                        {c.type === 'percentage' ? `${c.value}% Off` : `${formatCurrency(c.value)} Off`}
                      </td>
                      <td className="p-4 text-gray-500">
                        {c.min_order_amount ? formatCurrency(c.min_order_amount) : 'None'}
                      </td>
                      <td className="p-4 text-gray-500">
                        {c.times_used} / {c.usage_limit || '∞'}
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => toggleStatus(c)}
                          className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full cursor-pointer transition-colors ${c.is_active ? 'bg-green-50 text-green-700 hover:bg-green-100' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                          title="Click to toggle status"
                        >
                          {c.is_active ? 'Active' : 'Disabled'}
                        </button>
                      </td>
                      <td className="p-4 pr-6 text-right">
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50/50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Coupon"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Modal Overlay */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white border border-gray-200 rounded-[32px] max-w-[500px] w-full max-h-[85vh] overflow-y-auto shadow-2xl flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="font-semibold text-[17px] text-gray-900" style={{ fontFamily: 'var(--font-serif)' }}>
                Create Discount Code
              </h3>
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
                <label className="block text-[11px] uppercase tracking-wider text-gray-400 mb-1.5 font-bold">Promo Code *</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. SUMMER20"
                  className="w-full h-11 px-4 border border-gray-200 rounded-[10px] text-[13.5px] outline-none focus:border-[#2563EB] transition-colors font-mono uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-gray-400 mb-1.5 font-bold">Discount Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as 'percentage' | 'fixed')}
                    className="w-full h-11 px-3 border border-gray-200 rounded-[10px] text-[13.5px] bg-white outline-none focus:border-[#2563EB] transition-colors"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-gray-400 mb-1.5 font-bold">Value *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder={type === 'percentage' ? "e.g. 15" : "e.g. 500"}
                    className="w-full h-11 px-4 border border-gray-200 rounded-[10px] text-[13.5px] outline-none focus:border-[#2563EB] transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-gray-400 mb-1.5 font-bold">Min. Spend (Optional)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={minOrderAmount}
                    onChange={(e) => setMinOrderAmount(e.target.value)}
                    placeholder="e.g. 2000"
                    className="w-full h-11 px-4 border border-gray-200 rounded-[10px] text-[13.5px] outline-none focus:border-[#2563EB] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-gray-400 mb-1.5 font-bold">Usage Limit (Optional)</label>
                  <input
                    type="number"
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(e.target.value)}
                    placeholder="e.g. 100"
                    className="w-full h-11 px-4 border border-gray-200 rounded-[10px] text-[13.5px] outline-none focus:border-[#2563EB] transition-colors"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 text-[#2563EB] rounded border-gray-300 focus:ring-[#2563EB]"
                  />
                  <span className="text-[13.5px] font-medium text-gray-700">Activate this coupon immediately</span>
                </label>
              </div>

              {/* Submit panel */}
              <div className="pt-4 mt-2 flex justify-end gap-3.5 border-t border-gray-100">
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
                  Create Coupon
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
