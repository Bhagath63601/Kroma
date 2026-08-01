'use client';

import { useState, forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label: string;
  error?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeStyles = {
  sm: 'h-10 text-[13px]',
  md: 'h-12 text-[15px]',
  lg: 'h-14 text-[16px]',
};

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, size = 'md', className, id, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const inputId = id || label.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="relative w-full">
        <input
          ref={ref}
          id={inputId}
          placeholder=" "
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={cn(
            'floating-label-input peer w-full bg-white rounded-[8px] px-4 pt-5 pb-1.5 border transition-colors duration-200 outline-none',
            error
              ? 'border-[#DC2626] focus:border-[#DC2626]'
              : 'border-[rgba(0,0,0,0.12)] focus:border-[#2563EB]',
            sizeStyles[size],
            className
          )}
          {...props}
        />
        <motion.label
          htmlFor={inputId}
          className="floating-label absolute left-4 text-[#9CA3AF] pointer-events-none origin-left"
          animate={{
            y: isFocused || (props.value !== undefined && props.value !== '') ? -12 : 0,
            scale: isFocused || (props.value !== undefined && props.value !== '') ? 0.85 : 1,
            color: isFocused ? '#2563EB' : error ? '#DC2626' : '#9CA3AF',
          }}
          transition={{ duration: 0.2 }}
          style={{ top: '50%', transform: 'translateY(-50%)' }}
        >
          {label}
        </motion.label>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[#DC2626] text-[12px] mt-1 ml-1"
          >
            {error}
          </motion.p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
