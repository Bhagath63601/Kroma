'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import ImageUploader from '@/components/ui/ImageUploader';
import { Copy, Trash2, Loader2, Check } from 'lucide-react';
import Image from 'next/image';

interface MediaItem {
  id: string;
  url: string;
  filename: string;
  size: number;
  mime_type: string;
  created_at: string;
}

export default function AdminMediaPage() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  const supabase = createClient();
  const { user } = useAuth();

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('media')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMedia(data || []);
    } catch (err) {
      console.error('Error fetching media:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, [supabase]);

  // Handle media table insertion after Cloudinary upload
  const handleUploadComplete = async (url: string) => {
    if (!url) return;

    try {
      const filename = url.split('/').pop() || 'image.jpg';
      const newMedia = {
        url,
        filename,
        size: 102400, // Dummy size 100KB for display
        mime_type: 'image/jpeg',
        uploaded_by: user?.id || null,
      };

      const { data, error } = await supabase
        .from('media')
        .insert([newMedia])
        .select();

      if (error) throw error;

      if (data && data.length > 0) {
        setMedia((prev) => [data[0] as MediaItem, ...prev]);
      }
    } catch (err) {
      console.error('Error saving uploaded media metadata:', err);
      alert('Error registering media file in database');
    }
  };

  const handleCopy = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (item: MediaItem) => {
    if (!confirm(`Are you sure you want to delete this media file?\nFilename: ${item.filename}`)) {
      return;
    }

    setIsDeletingId(item.id);
    try {
      const { error } = await supabase
        .from('media')
        .delete()
        .eq('id', item.id);

      if (error) throw error;

      setMedia((prev) => prev.filter((m) => m.id !== item.id));
    } catch (err: any) {
      console.error('Error deleting media:', err);
      alert(err.message || 'Error deleting media');
    } finally {
      setIsDeletingId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-[26px] font-normal text-gray-900" style={{ fontFamily: 'var(--font-serif)' }}>
          Media Library
        </h1>
        <p className="text-[13px] text-[#6B6B6B]">
          Upload product images, brand banners, and logos to obtain public URLs for catalog configuration.
        </p>
      </div>

      {/* Grid: Upload Zone + Media List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Upload Panel */}
        <div className="lg:col-span-1 bg-white p-6 rounded-[24px] border border-gray-200 shadow-sm h-fit space-y-4">
          <h3 className="text-[16px] font-semibold text-gray-900" style={{ fontFamily: 'var(--font-serif)' }}>
            Upload Media
          </h3>
          <p className="text-[12.5px] text-[#6B6B6B] leading-relaxed">
            Drag and drop or select files to upload directly to Cloudinary storage. Once uploaded, they will be registered below.
          </p>
          <ImageUploader value="" onChange={handleUploadComplete} label="Choose Image" />
        </div>

        {/* Media Gallery */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-[16px] font-semibold text-gray-900 border-b border-gray-100 pb-2" style={{ fontFamily: 'var(--font-serif)' }}>
            Gallery items ({media.length})
          </h3>

          {loading ? (
            <div className="p-16 flex flex-col items-center justify-center text-[#2563EB] gap-2">
              <Loader2 className="w-8 h-8 animate-spin" />
              <span className="text-[13px] text-gray-400">Loading gallery items...</span>
            </div>
          ) : media.length === 0 ? (
            <div className="p-16 text-center text-gray-400 text-[14px]">
              No media items uploaded yet. Use the upload panel to get started.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {media.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-gray-200 rounded-[20px] overflow-hidden group shadow-sm flex flex-col justify-between"
                >
                  <div className="relative aspect-square bg-gray-50 flex items-center justify-center border-b border-gray-100">
                    <Image
                      src={item.url}
                      alt={item.filename}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 50vw, 33vw"
                    />
                  </div>
                  
                  {/* Actions footer */}
                  <div className="p-3 bg-white flex items-center justify-between gap-2 border-t border-gray-50">
                    <span className="text-[11px] text-gray-400 font-medium truncate max-w-[80px]" title={item.filename}>
                      {item.filename}
                    </span>
                    <div className="flex gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => handleCopy(item.id, item.url)}
                        className="p-1.5 hover:bg-gray-100 text-gray-600 hover:text-gray-900 rounded-md transition-colors cursor-pointer"
                        title="Copy Public URL"
                      >
                        {copiedId === item.id ? (
                          <Check size={14} className="text-green-600" />
                        ) : (
                          <Copy size={14} />
                        )}
                      </button>
                      <button
                        disabled={isDeletingId === item.id}
                        onClick={() => handleDelete(item)}
                        className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-md transition-colors disabled:opacity-50 cursor-pointer"
                        title="Delete Image"
                      >
                        {isDeletingId === item.id ? (
                          <Loader2 size={14} className="animate-spin text-red-600" />
                        ) : (
                          <Trash2 size={14} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
