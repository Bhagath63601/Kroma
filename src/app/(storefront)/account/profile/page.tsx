'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/lib/supabase';
import { User, Phone, Mail, ShieldCheck, Loader2 } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function AccountProfilePage() {
  const { user, profile } = useAuth();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Sync state with profile once loaded
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setPhone(profile.phone || '');
    }
  }, [profile]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(null);
    setError(null);

    if (!fullName.trim()) {
      setError('Full name cannot be empty');
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: fullName.trim(),
          phone: phone.trim(),
        })
        .eq('id', user?.id);

      if (updateError) throw updateError;

      setSuccess('Profile details updated successfully! Reloading session dashboard...');
      
      // Delay and reload to trigger useAuth session sync
      setTimeout(() => {
        window.location.reload();
      }, 1500);

    } catch (err: any) {
      console.error('Profile update failed:', err);
      setError(err.message || 'Failed to update profile settings.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-[#000]/[0.05] rounded-[24px] p-6 md:p-8 shadow-sm">
      <div className="mb-6 pb-4 border-b border-gray-100">
        <h2 className="text-[20px] font-normal text-[#1A1A1A]" style={{ fontFamily: 'var(--font-serif)' }}>
          Profile Settings
        </h2>
        <p className="text-[12.5px] text-[#6B6B6B] mt-0.5">Edit your customer account credentials and communication details.</p>
      </div>

      {success && (
        <div className="mb-5 p-3.5 bg-green-50 border border-green-200/50 rounded-[12px] text-[12.5px] text-green-800 font-medium">
          {success}
        </div>
      )}

      {error && (
        <div className="mb-5 p-3.5 bg-red-50 border border-red-200/50 rounded-[12px] text-[12.5px] text-red-600 leading-relaxed">
          {error}
        </div>
      )}

      <form onSubmit={handleUpdate} className="space-y-5 max-w-[500px]">
        {/* Email field (disabled/read-only) */}
        <div>
          <label className="block text-[11px] uppercase tracking-wider text-[#9CA3AF] mb-1.5 font-medium">
            Account Email (Locked)
          </label>
          <div className="relative bg-gray-50 border border-[#000]/[0.04] rounded-[8px]">
            <input
              type="email"
              disabled
              value={user?.email || ''}
              className="w-full h-11 pl-10 pr-4 text-[13.5px] text-[#9CA3AF] outline-none cursor-not-allowed"
            />
            <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
          </div>
        </div>

        {/* Full Name field */}
        <div>
          <label className="block text-[11px] uppercase tracking-wider text-[#6B6B6B] mb-1.5 font-medium">
            Full Name
          </label>
          <div className="relative">
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Priyanjali Sen"
              className="w-full h-11 pl-10 pr-4 border border-[#000]/[0.08] rounded-[8px] text-[13.5px] outline-none focus:border-[#2563EB] transition-colors"
            />
            <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
          </div>
        </div>

        {/* Phone field */}
        <div>
          <label className="block text-[11px] uppercase tracking-wider text-[#6B6B6B] mb-1.5 font-medium">
            Phone Number
          </label>
          <div className="relative">
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 9876543210"
              className="w-full h-11 pl-10 pr-4 border border-[#000]/[0.08] rounded-[8px] text-[13.5px] outline-none focus:border-[#2563EB] transition-colors"
            />
            <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
          </div>
        </div>

        <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-4">
          <div className="flex items-center gap-1 text-[11px] text-[#9CA3AF]">
            <ShieldCheck size={14} className="text-green-700" />
            <span>Updates saved instantly.</span>
          </div>
          <Button type="submit" variant="primary" className="py-2.5 px-6 text-[13px]" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Profile Settings'}
          </Button>
        </div>
      </form>
    </div>
  );
}
