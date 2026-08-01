'use client';

import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular';
  width?: string | number;
  height?: string | number;
  lines?: number;
}

export default function Skeleton({
  className,
  variant = 'rectangular',
  width,
  height,
  lines = 1,
}: SkeletonProps) {
  if (variant === 'text' && lines > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn('skeleton-shimmer rounded-[4px]', className)}
            style={{
              width: i === lines - 1 ? '70%' : width || '100%',
              height: height || '16px',
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'skeleton-shimmer',
        variant === 'circular' ? 'rounded-full' : 'rounded-[8px]',
        className
      )}
      style={{
        width: width || '100%',
        height: height || (variant === 'text' ? '16px' : '200px'),
      }}
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton height="320px" className="rounded-[12px]" />
      <Skeleton variant="text" width="60%" height="14px" />
      <Skeleton variant="text" width="80%" height="18px" />
      <Skeleton variant="text" width="40%" height="16px" />
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
