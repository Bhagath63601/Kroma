'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import ImageUploader from '@/components/ui/ImageUploader';
import Button from '@/components/ui/Button';
import { Loader2, Save, CheckCircle2, FileText, Globe, Search } from 'lucide-react';
import type { SEOSettings, PageSEO } from '@/types';

export default function AdminSEOPage() {
  const [globalSEO, setGlobalSEO] = useState<Partial<SEOSettings>>({
    meta_title_template: '{Page Title} | {Site Name}',
    default_meta_description: '',
    og_default_image_url: '',
    ga_tracking_id: '',
    fb_pixel_id: '',
    search_console_meta: '',
    robots_txt: 'User-agent: *\nAllow: /\n\nSitemap: https://kromahome.com/sitemap.xml',
  });

  const [pageSEOList, setPageSEOList] = useState<PageSEO[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'global' | 'robots' | 'pages'>('global');
  
  // Selected page SEO editing state
  const [editingPage, setEditingPage] = useState<PageSEO | null>(null);
  const [savingPage, setSavingPage] = useState(false);

  const supabase = createClient();

  // Pages we allow custom SEO configuration for
  const standardPages = [
    { slug: 'home', label: 'Homepage' },
    { slug: 'about', label: 'About Us' },
    { slug: 'contact', label: 'Contact Us' },
    { slug: 'faq', label: 'FAQ Page' },
    { slug: 'products', label: 'Shop Catalog' },
  ];

  useEffect(() => {
    const fetchSEOSettings = async () => {
      setLoading(true);
      try {
        // 1. Fetch Global SEO settings
        const { data: globalData, error: globalError } = await supabase
          .from('seo_settings')
          .select('*')
          .limit(1);

        if (globalError) throw globalError;

        if (globalData && globalData.length > 0) {
          setGlobalSEO(globalData[0]);
        } else {
          // If no row exists, create defaults
          const { data: insertedGlobal, error: insertGlobalError } = await supabase
            .from('seo_settings')
            .insert([globalSEO])
            .select();

          if (insertGlobalError) throw insertGlobalError;
          if (insertedGlobal && insertedGlobal.length > 0) {
            setGlobalSEO(insertedGlobal[0]);
          }
        }

        // 2. Fetch page-specific SEO settings
        const { data: pageData, error: pageError } = await supabase
          .from('page_seo')
          .select('*');

        if (pageError) throw pageError;

        // Initialize standard pages in database if they don't exist
        const existingSlugs = (pageData || []).map((p) => p.page_slug);
        const missingPages = standardPages.filter((sp) => !existingSlugs.includes(sp.slug));

        if (missingPages.length > 0) {
          const insertPayload = missingPages.map((mp) => ({
            page_slug: mp.slug,
            meta_title: `${mp.label} | Kroma`,
            meta_description: `Handcrafted flower vases and artisanal ceramics at Kroma.`,
            og_image_url: '',
          }));

          const { data: insertedPages, error: insertPagesError } = await supabase
            .from('page_seo')
            .insert(insertPayload)
            .select();

          if (!insertPagesError && insertedPages) {
            setPageSEOList([...(pageData || []), ...insertedPages]);
          } else {
            setPageSEOList(pageData || []);
          }
        } else {
          setPageSEOList(pageData || []);
        }
      } catch (err) {
        console.error('Error fetching SEO settings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSEOSettings();
  }, [supabase]);

  const handleSaveGlobal = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      const { error } = await supabase
        .from('seo_settings')
        .update(globalSEO)
        .eq('id', globalSEO.id);

      if (error) throw error;
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving global SEO:', err);
      alert('Failed to save SEO settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePageSEO = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPage) return;

    setSavingPage(true);
    try {
      const { error } = await supabase
        .from('page_seo')
        .update({
          meta_title: editingPage.meta_title,
          meta_description: editingPage.meta_description,
          og_image_url: editingPage.og_image_url,
        })
        .eq('id', editingPage.id);

      if (error) throw error;

      // Update local state list
      setPageSEOList((prev) =>
        prev.map((item) => (item.id === editingPage.id ? editingPage : item))
      );
      setEditingPage(null);
    } catch (err) {
      console.error('Error saving page SEO:', err);
      alert('Failed to save page SEO.');
    } finally {
      setSavingPage(false);
    }
  };

  const updateGlobalField = (key: keyof SEOSettings, value: any) => {
    setGlobalSEO((prev) => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="p-16 flex flex-col items-center justify-center text-[#2563EB] gap-2">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="text-[13px] text-gray-400">Loading SEO control panel...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-150 pb-5">
        <div>
          <h1 className="text-[26px] font-normal text-gray-900" style={{ fontFamily: 'var(--font-serif)' }}>
            SEO & Analytics Control
          </h1>
          <p className="text-[13px] text-[#6B6B6B]">
            Configure indexing guidelines, default meta layouts, tracking tags, and page-specific SEO.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 gap-6">
        {[
          { id: 'global', label: 'Global SEO Templates', icon: Globe },
          { id: 'pages', label: 'Per-Page Metadata', icon: Search },
          { id: 'robots', label: 'Robots.txt Editor', icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 text-[13.5px] font-medium flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'border-[#2563EB] text-[#2563EB] font-semibold'
                  : 'border-transparent text-gray-500 hover:text-gray-950'
              }`}
            >
              <Icon size={15} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'global' && (
        <form onSubmit={handleSaveGlobal} className="bg-white border border-gray-200 rounded-[24px] p-8 shadow-sm space-y-8">
          <div className="max-w-2xl space-y-6">
            <h3 className="text-[16px] font-semibold text-gray-900" style={{ fontFamily: 'var(--font-serif)' }}>
              Search Engine & Meta Templates
            </h3>

            <div className="space-y-1.5">
              <label className="text-[11px] uppercase tracking-wider text-gray-400 font-bold">Meta Title Template</label>
              <input
                type="text"
                value={globalSEO.meta_title_template || ''}
                onChange={(e) => updateGlobalField('meta_title_template', e.target.value)}
                className="w-full border border-gray-200 rounded-[12px] px-4 py-2.5 text-[14px]"
                required
              />
              <span className="text-[12px] text-gray-400">
                Variables: <code>{`{Page Title}`}</code> (page name) and <code>{`{Site Name}`}</code> (from settings) are supported.
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] uppercase tracking-wider text-gray-400 font-bold">Default Meta Description</label>
              <textarea
                value={globalSEO.default_meta_description || ''}
                onChange={(e) => updateGlobalField('default_meta_description', e.target.value)}
                rows={3}
                className="w-full border border-gray-200 rounded-[12px] px-4 py-2.5 text-[14px] resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="space-y-1.5">
                <label className="text-[11px] uppercase tracking-wider text-gray-400 font-bold">Google Analytics (GA4) ID</label>
                <input
                  type="text"
                  value={globalSEO.ga_tracking_id || ''}
                  onChange={(e) => updateGlobalField('ga_tracking_id', e.target.value)}
                  placeholder="G-XXXXXXXXXX"
                  className="w-full border border-gray-200 rounded-[12px] px-4 py-2.5 text-[14px]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] uppercase tracking-wider text-gray-400 font-bold">Facebook Pixel ID</label>
                <input
                  type="text"
                  value={globalSEO.fb_pixel_id || ''}
                  onChange={(e) => updateGlobalField('fb_pixel_id', e.target.value)}
                  placeholder="15-digit code"
                  className="w-full border border-gray-200 rounded-[12px] px-4 py-2.5 text-[14px]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] uppercase tracking-wider text-gray-400 font-bold">Google Search Console Verification Tag</label>
              <input
                type="text"
                value={globalSEO.search_console_meta || ''}
                onChange={(e) => updateGlobalField('search_console_meta', e.target.value)}
                placeholder='<meta name="google-site-verification" content="..." />'
                className="w-full border border-gray-200 rounded-[12px] px-4 py-2.5 text-[14px] font-mono text-[12.5px]"
              />
            </div>

            <div className="pt-4">
              <ImageUploader
                value={globalSEO.og_default_image_url || ''}
                onChange={(url) => updateGlobalField('og_default_image_url', url)}
                label="Default Open Graph (OG) Image"
              />
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6 flex items-center justify-between">
            {saveSuccess && (
              <div className="flex items-center gap-1.5 text-green-600 text-[13.5px]">
                <CheckCircle2 size={16} />
                <span>Global templates updated</span>
              </div>
            )}
            <Button
              type="submit"
              disabled={saving}
              variant="primary"
              className="h-11 px-6 rounded-full flex items-center gap-2 text-[13px] uppercase tracking-wider font-bold"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Configuration
            </Button>
          </div>
        </form>
      )}

      {activeTab === 'robots' && (
        <form onSubmit={handleSaveGlobal} className="bg-white border border-gray-200 rounded-[24px] p-8 shadow-sm space-y-8">
          <div className="max-w-2xl space-y-4">
            <h3 className="text-[16px] font-semibold text-gray-900" style={{ fontFamily: 'var(--font-serif)' }}>
              robots.txt Rules
            </h3>
            <p className="text-[13px] text-gray-500">
              Instruct search engine crawlers which pages or folders can be scanned on your storefront.
            </p>
            <textarea
              value={globalSEO.robots_txt || ''}
              onChange={(e) => updateGlobalField('robots_txt', e.target.value)}
              rows={8}
              className="w-full border border-gray-200 rounded-[12px] p-4 text-[13.5px] font-mono leading-relaxed resize-none"
            />
          </div>

          <div className="border-t border-gray-100 pt-6 flex items-center justify-between">
            {saveSuccess && (
              <div className="flex items-center gap-1.5 text-green-600 text-[13.5px]">
                <CheckCircle2 size={16} />
                <span>robots.txt file saved</span>
              </div>
            )}
            <Button
              type="submit"
              disabled={saving}
              variant="primary"
              className="h-11 px-6 rounded-full flex items-center gap-2 text-[13px] uppercase tracking-wider font-bold"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save robots.txt
            </Button>
          </div>
        </form>
      )}

      {activeTab === 'pages' && (
        <div className="bg-white border border-gray-200 rounded-[24px] overflow-hidden shadow-sm">
          {editingPage ? (
            <form onSubmit={handleSavePageSEO} className="p-8 space-y-6">
              <h3 className="text-[16px] font-semibold text-gray-900 border-b border-gray-100 pb-2" style={{ fontFamily: 'var(--font-serif)' }}>
                Edit SEO for page: &ldquo;{standardPages.find(sp => sp.slug === editingPage.page_slug)?.label || editingPage.page_slug}&rdquo;
              </h3>

              <div className="space-y-1.5">
                <label className="text-[11px] uppercase tracking-wider text-gray-400 font-bold">Meta Title Tag</label>
                <input
                  type="text"
                  value={editingPage.meta_title || ''}
                  onChange={(e) => setEditingPage({ ...editingPage, meta_title: e.target.value })}
                  className="w-full border border-gray-200 rounded-[12px] px-4 py-2.5 text-[14px]"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] uppercase tracking-wider text-gray-400 font-bold">Meta Description</label>
                <textarea
                  value={editingPage.meta_description || ''}
                  onChange={(e) => setEditingPage({ ...editingPage, meta_description: e.target.value })}
                  rows={3}
                  className="w-full border border-gray-200 rounded-[12px] px-4 py-2.5 text-[14px] resize-none"
                />
              </div>

              <div className="pt-2">
                <ImageUploader
                  value={editingPage.og_image_url || ''}
                  onChange={(url) => setEditingPage({ ...editingPage, og_image_url: url })}
                  label="Open Graph Page Image override"
                />
              </div>

              <div className="flex gap-3 pt-4 justify-end border-t border-gray-100">
                <Button
                  onClick={() => setEditingPage(null)}
                  variant="outline"
                  type="button"
                  className="h-10 px-5 rounded-full"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={savingPage}
                  variant="primary"
                  className="h-10 px-6 rounded-full flex items-center gap-1.5"
                >
                  {savingPage && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save Page SEO
                </Button>
              </div>
            </form>
          ) : (
            <div className="divide-y divide-gray-100">
              {pageSEOList.map((pageSEO) => {
                const label = standardPages.find((sp) => sp.slug === pageSEO.page_slug)?.label || pageSEO.page_slug;
                return (
                  <div key={pageSEO.id} className="p-6 flex items-center justify-between gap-6 hover:bg-gray-50/50 transition-colors">
                    <div>
                      <span className="text-[11px] uppercase tracking-wider text-[#2563EB] font-bold">
                        {label} (/{pageSEO.page_slug === 'home' ? '' : pageSEO.page_slug})
                      </span>
                      <h4 className="text-[15px] font-semibold text-gray-900 mt-1">
                        {pageSEO.meta_title || 'No Title set'}
                      </h4>
                      <p className="text-[13px] text-gray-400 mt-1 max-w-xl line-clamp-1">
                        {pageSEO.meta_description || 'No meta description configured.'}
                      </p>
                    </div>
                    <Button
                      onClick={() => setEditingPage(pageSEO)}
                      variant="outline"
                      className="h-9 px-4 text-[12.5px] rounded-full flex-shrink-0"
                    >
                      Customize Metas
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
