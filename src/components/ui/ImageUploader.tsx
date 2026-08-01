'use client';

import { useState, useCallback } from 'react';
import { UploadCloud, Loader2, Trash2 } from 'lucide-react';

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

export default function ImageUploader({ value, onChange, label = "Image Upload" }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (file: File) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file');
      return;
    }

    setIsUploading(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '');

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      const data = await response.json();

      if (data.secure_url) {
        onChange(data.secure_url);
      } else {
        throw new Error(data.error?.message || 'Upload failed');
      }
    } catch (error: any) {
      console.error('Upload Error:', error);
      alert(error.message || 'Error uploading image to Cloudinary');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUpload(e.dataTransfer.files[0]);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleUpload(e.target.files[0]);
    }
  };

  return (
    <div className="w-full">
      <label className="block text-[11px] uppercase tracking-wider text-gray-400 mb-1.5 font-bold">{label}</label>
      
      {value ? (
        <div className="relative w-full aspect-video rounded-[12px] border border-gray-200 overflow-hidden group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Uploaded preview" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
            <button
              type="button"
              onClick={() => onChange('')}
              className="w-10 h-10 bg-white text-red-600 rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-lg cursor-pointer"
              title="Remove Image"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`relative w-full h-40 rounded-[12px] border-2 border-dashed flex flex-col items-center justify-center transition-colors ${
            isDragging ? 'border-[#2563EB] bg-blue-50' : 'border-gray-300 hover:border-gray-400 bg-gray-50'
          }`}
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={isUploading}
          />
          
          {isUploading ? (
            <div className="flex flex-col items-center text-[#2563EB]">
              <Loader2 className="w-8 h-8 animate-spin mb-2" />
              <span className="text-[13px] font-medium">Uploading to Cloudinary...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center text-gray-400 pointer-events-none">
              <UploadCloud className="w-8 h-8 mb-2" />
              <span className="text-[13.5px] font-medium text-gray-700">Drop your image here</span>
              <span className="text-[12px]">or click to browse files</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
