'use client';

import { cn } from '@/lib/utils';

interface BadgeProps {
  variant?: 'new' | 'sale' | 'outOfStock' | 'default' | 'success' | 'warning' | 'info';
  children: React.ReactNode;
  className?: string;
  pulse?: boolean;
}

const variantStyles: Record<string, string> = {
  new: 'bg-[#1A1A1A] text-white',
  sale: 'bg-[#DC2626] text-white',
  outOfStock: 'bg-[#6B6B6B] text-white',
  default: 'bg-[#F5F5F0] text-[#1A1A1A]',
  success: 'bg-[#DCFCE7] text-[#16A34A]',
  warning: 'bg-[#FEF3C7] text-[#D97706]',
  info: 'bg-[#DBEAFE] text-[#2563EB]',
};

export default function Badge({ variant = 'default', children, className, pulse = false }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-[0.05em] leading-none',
        variantStyles[variant],
        pulse && 'animate-pulse',
        className
      )}
    >
      {children}
    </span>
  );
}
