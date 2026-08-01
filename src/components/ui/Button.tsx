'use client';

import { motion, type HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { forwardRef } from 'react';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'ref'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  shimmer?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

const variantStyles: Record<string, string> = {
  primary:
    'bg-[#2563EB] text-white hover:bg-[#1D4ED8] border border-transparent',
  secondary:
    'bg-[#F5F5F0] text-[#1A1A1A] hover:bg-[#EBEBDF] border border-transparent',
  outline:
    'bg-transparent text-[#1A1A1A] border border-[rgba(0,0,0,0.12)] hover:bg-[#F5F5F0]',
  ghost:
    'bg-transparent text-[#1A1A1A] border border-transparent hover:bg-[#F5F5F0]',
  destructive:
    'bg-[#DC2626] text-white hover:bg-[#B91C1C] border border-transparent',
};

const sizeStyles: Record<string, string> = {
  sm: 'px-4 py-2 text-[13px] rounded-[6px]',
  md: 'px-6 py-2.5 text-[14px] rounded-[8px]',
  lg: 'px-8 py-3 text-[15px] rounded-[8px]',
  xl: 'px-10 py-4 text-[16px] rounded-[12px] font-semibold',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      shimmer = false,
      fullWidth = false,
      className,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.97 }}
        transition={{ duration: 0.1 }}
        className={cn(
          'inline-flex items-center justify-center gap-2 font-medium cursor-pointer transition-colors duration-200 select-none',
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && 'w-full',
          shimmer && variant === 'primary' && 'btn-shimmer',
          (disabled || isLoading) && 'opacity-50 cursor-not-allowed',
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <Loader2 size={16} />
          </motion.span>
        )}
        {children}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
