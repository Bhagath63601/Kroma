'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { motion } from 'framer-motion';
import ImageUploader from '@/components/ui/ImageUploader';
import Button from '@/components/ui/Button';
import { Loader2, Save, CheckCircle2 } from 'lucide-react';
import type { SiteSettings } from '@/types';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Partial<SiteSettings>>({
    site_name: 'Kroma',
    tagline: '',
    logo_url: '',
    logo_inverted_url: '',
    favicon_url: '',
    contact_email: '',
    contact_phone: '',
    business_address: '',
    currency_code: 'INR',
    currency_symbol: '₹',
    tax_rate: 0,
    tax_inclusive: true,
    announcement_bar_active: false,
    announcement_bar_text: '',
    announcement_bar_link: '',
    announcement_bar_color: '#1A1A1A',
    social_instagram: '',
    social_facebook: '',
    social_twitter: '',
    social_tiktok: '',
    social_youtube: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'brand' | 'contact' | 'announcement' | 'financials'>('brand');

  const supabase = createClient();

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('*')
          .limit(1);

        if (error) throw error;

        if (data && data.length > 0) {
          setSettings(data[0]);
        } else {
          // If no settings exist yet, create default settings row
          const { data: inserted, error: insertError } = await supabase
            .from('site_settings')
            .insert([settings])
            .select();

          if (insertError) throw insertError;
          if (inserted && inserted.length > 0) {
            setSettings(inserted[0]);
          }
        }
      } catch (err) {
        console.error('Error loading settings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [supabase]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      const { error } = await supabase
        .from('site_settings')
        .update(settings)
        .eq('id', settings.id);

      if (error) throw error;
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving settings:', err);
      alert('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (key: keyof SiteSettings, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="p-16 flex flex-col items-center justify-center text-[#2563EB] gap-2">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="text-[13px] text-gray-400">Loading store settings...</span>
      </div>
    );
  }

  const tabs = [
    { id: 'brand', label: 'Brand & Identity' },
    { id: 'contact', label: 'Contact & Socials' },
    { id: 'announcement', label: 'Announcement Bar' },
    { id: 'financials', label: 'Currency & Taxes' },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-150 pb-5">
        <div>
          <h1 className="text-[26px] font-normal text-gray-900" style={{ fontFamily: 'var(--font-serif)' }}>
            Store Configuration
          </h1>
          <p className="text-[13px] text-[#6B6B6B]">
            Configure site-wide branding, announcement headers, taxes, currency codes, and social handles.
          </p>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex border-b border-gray-200 gap-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3 text-[13.5px] font-medium tracking-wide border-b-2 transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'border-[#2563EB] text-[#2563EB] font-semibold'
                : 'border-transparent text-gray-500 hover:text-gray-950'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Form Content */}
      <form onSubmit={handleSave} className="space-y-8 bg-white border border-gray-200 rounded-[24px] p-8 shadow-sm">
        
        {activeTab === 'brand' && (
          <div className="space-y-6 max-w-2xl">
            <h3 className="text-[16px] font-semibold text-gray-900" style={{ fontFamily: 'var(--font-serif)' }}>
              Brand Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[11px] uppercase tracking-wider text-gray-400 font-bold">Site Name</label>
                <input
                  type="text"
                  value={settings.site_name}
                  onChange={(e) => updateField('site_name', e.target.value)}
                  className="w-full border border-gray-200 rounded-[12px] px-4 py-2.5 text-[14px] outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] uppercase tracking-wider text-gray-400 font-bold">Site Tagline</label>
                <input
                  type="text"
                  value={settings.tagline || ''}
                  onChange={(e) => updateField('tagline', e.target.value)}
                  className="w-full border border-gray-200 rounded-[12px] px-4 py-2.5 text-[14px] outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              <ImageUploader
                value={settings.logo_url || ''}
                onChange={(url) => updateField('logo_url', url)}
                label="Primary Brand Logo"
              />
              <ImageUploader
                value={settings.logo_inverted_url || ''}
                onChange={(url) => updateField('logo_inverted_url', url)}
                label="Inverted Logo (Footer)"
              />
              <ImageUploader
                value={settings.favicon_url || ''}
                onChange={(url) => updateField('favicon_url', url)}
                label="Site Favicon"
              />
            </div>
          </div>
        )}

        {activeTab === 'contact' && (
          <div className="space-y-6 max-w-2xl">
            <h3 className="text-[16px] font-semibold text-gray-900" style={{ fontFamily: 'var(--font-serif)' }}>
              Contact Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[11px] uppercase tracking-wider text-gray-400 font-bold">Business Email</label>
                <input
                  type="email"
                  value={settings.contact_email || ''}
                  onChange={(e) => updateField('contact_email', e.target.value)}
                  className="w-full border border-gray-200 rounded-[12px] px-4 py-2.5 text-[14px] outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] uppercase tracking-wider text-gray-400 font-bold">Business Phone</label>
                <input
                  type="text"
                  value={settings.contact_phone || ''}
                  onChange={(e) => updateField('contact_phone', e.target.value)}
                  className="w-full border border-gray-200 rounded-[12px] px-4 py-2.5 text-[14px] outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] uppercase tracking-wider text-gray-400 font-bold">Studio / Physical Address</label>
              <textarea
                value={settings.business_address || ''}
                onChange={(e) => updateField('business_address', e.target.value)}
                rows={3}
                className="w-full border border-gray-200 rounded-[12px] px-4 py-2.5 text-[14px] outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] resize-none"
              />
            </div>

            <h3 className="text-[16px] font-semibold text-gray-900 pt-4" style={{ fontFamily: 'var(--font-serif)' }}>
              Social Handles
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[11px] uppercase tracking-wider text-gray-400 font-bold">Instagram URL</label>
                <input
                  type="text"
                  value={settings.social_instagram || ''}
                  onChange={(e) => updateField('social_instagram', e.target.value)}
                  className="w-full border border-gray-200 rounded-[12px] px-4 py-2.5 text-[14px] outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] uppercase tracking-wider text-gray-400 font-bold">Facebook URL</label>
                <input
                  type="text"
                  value={settings.social_facebook || ''}
                  onChange={(e) => updateField('social_facebook', e.target.value)}
                  className="w-full border border-gray-200 rounded-[12px] px-4 py-2.5 text-[14px] outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] uppercase tracking-wider text-gray-400 font-bold">Twitter/X URL</label>
                <input
                  type="text"
                  value={settings.social_twitter || ''}
                  onChange={(e) => updateField('social_twitter', e.target.value)}
                  className="w-full border border-gray-200 rounded-[12px] px-4 py-2.5 text-[14px] outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] uppercase tracking-wider text-gray-400 font-bold">YouTube URL</label>
                <input
                  type="text"
                  value={settings.social_youtube || ''}
                  onChange={(e) => updateField('social_youtube', e.target.value)}
                  className="w-full border border-gray-200 rounded-[12px] px-4 py-2.5 text-[14px] outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'announcement' && (
          <div className="space-y-6 max-w-2xl">
            <h3 className="text-[16px] font-semibold text-gray-900" style={{ fontFamily: 'var(--font-serif)' }}>
              Announcement Bar Options
            </h3>

            <div className="flex items-center gap-3 py-2">
              <input
                type="checkbox"
                id="bar_active"
                checked={settings.announcement_bar_active || false}
                onChange={(e) => updateField('announcement_bar_active', e.target.checked)}
                className="w-4.5 h-4.5 text-[#2563EB] border-gray-300 rounded focus:ring-[#2563EB] cursor-pointer"
              />
              <label htmlFor="bar_active" className="text-[14px] text-gray-700 font-medium cursor-pointer">
                Display Announcement Bar above header on storefront
              </label>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] uppercase tracking-wider text-gray-400 font-bold">Announcement Text</label>
              <input
                type="text"
                value={settings.announcement_bar_text || ''}
                onChange={(e) => updateField('announcement_bar_text', e.target.value)}
                placeholder="e.g. Free shipping on orders above ₹3,000"
                className="w-full border border-gray-200 rounded-[12px] px-4 py-2.5 text-[14px] outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[11px] uppercase tracking-wider text-gray-400 font-bold">Redirect Link (URL)</label>
                <input
                  type="text"
                  value={settings.announcement_bar_link || ''}
                  onChange={(e) => updateField('announcement_bar_link', e.target.value)}
                  placeholder="e.g. /products"
                  className="w-full border border-gray-200 rounded-[12px] px-4 py-2.5 text-[14px] outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] uppercase tracking-wider text-gray-400 font-bold">Bar Background Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={settings.announcement_bar_color || '#1A1A1A'}
                    onChange={(e) => updateField('announcement_bar_color', e.target.value)}
                    className="w-10 h-10 border border-gray-200 rounded-lg cursor-pointer flex-shrink-0"
                  />
                  <input
                    type="text"
                    value={settings.announcement_bar_color || '#1A1A1A'}
                    onChange={(e) => updateField('announcement_bar_color', e.target.value)}
                    className="w-full border border-gray-200 rounded-[12px] px-4 py-2 text-[14px] outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'financials' && (
          <div className="space-y-6 max-w-2xl">
            <h3 className="text-[16px] font-semibold text-gray-900" style={{ fontFamily: 'var(--font-serif)' }}>
              Currency & Tax Settings
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[11px] uppercase tracking-wider text-gray-400 font-bold">Currency Code (ISO)</label>
                <input
                  type="text"
                  value={settings.currency_code}
                  onChange={(e) => updateField('currency_code', e.target.value)}
                  className="w-full border border-gray-200 rounded-[12px] px-4 py-2.5 text-[14px] outline-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] uppercase tracking-wider text-gray-400 font-bold">Currency Symbol</label>
                <input
                  type="text"
                  value={settings.currency_symbol}
                  onChange={(e) => updateField('currency_symbol', e.target.value)}
                  className="w-full border border-gray-200 rounded-[12px] px-4 py-2.5 text-[14px] outline-none"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="space-y-1.5">
                <label className="text-[11px] uppercase tracking-wider text-gray-400 font-bold">Tax Rate (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={settings.tax_rate}
                  onChange={(e) => updateField('tax_rate', parseFloat(e.target.value) || 0)}
                  className="w-full border border-gray-200 rounded-[12px] px-4 py-2.5 text-[14px] outline-none"
                  required
                />
              </div>

              <div className="flex items-center gap-3 pt-6">
                <input
                  type="checkbox"
                  id="tax_inclusive"
                  checked={settings.tax_inclusive || false}
                  onChange={(e) => updateField('tax_inclusive', e.target.checked)}
                  className="w-4.5 h-4.5 text-[#2563EB] border-gray-300 rounded focus:ring-[#2563EB] cursor-pointer"
                />
                <label htmlFor="tax_inclusive" className="text-[14px] text-gray-700 font-medium cursor-pointer">
                  All catalog prices are tax-inclusive
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="border-t border-gray-100 pt-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {saveSuccess && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-1.5 text-green-600 text-[13.5px]"
              >
                <CheckCircle2 size={16} />
                <span>Configuration saved successfully</span>
              </motion.div>
            )}
          </div>

          <Button
            type="submit"
            disabled={saving}
            variant="primary"
            className="h-11 px-6 rounded-full flex items-center justify-center gap-2 text-[13px] uppercase tracking-wider font-bold"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Settings
              </>
            )}
          </Button>
        </div>

      </form>
    </div>
  );
}
