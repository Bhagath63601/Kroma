'use client';

import { motion } from 'framer-motion';

interface FlowerVaseLoaderProps {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function FlowerVaseLoader({
  label = 'Loading...',
  size = 'md',
}: FlowerVaseLoaderProps) {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-36 h-36',
  };

  const textClasses = {
    sm: 'text-[12px]',
    md: 'text-[14px]',
    lg: 'text-[16px]',
  };

  // SVG dimensions: 100 x 100
  return (
    <div className="flex flex-col items-center justify-center gap-4 text-center">
      <div className={`relative ${sizeClasses[size]}`}>
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full text-[#2563EB]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Stem 1 (Left) */}
          <motion.path
            d="M44 45 C38 35, 32 28, 30 20"
            stroke="#16A34A"
            strokeWidth="2"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{
              duration: 1.5,
              ease: 'easeOut',
              repeat: Infinity,
              repeatType: 'reverse',
              repeatDelay: 0.5,
            }}
          />
          {/* Leaf on Stem 1 */}
          <motion.path
            d="M37 32 C34 32, 33 28, 36 29 C39 30, 39 32, 37 32 Z"
            fill="#16A34A"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              delay: 0.8,
              duration: 0.5,
              repeat: Infinity,
              repeatType: 'reverse',
              repeatDelay: 1.5,
            }}
          />

          {/* Stem 2 (Center) */}
          <motion.path
            d="M50 45 L50 14"
            stroke="#16A34A"
            strokeWidth="2.5"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{
              duration: 1.2,
              ease: 'easeOut',
              repeat: Infinity,
              repeatType: 'reverse',
              repeatDelay: 0.8,
            }}
          />

          {/* Stem 3 (Right) */}
          <motion.path
            d="M56 45 C62 35, 68 28, 70 20"
            stroke="#16A34A"
            strokeWidth="2"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{
              duration: 1.6,
              ease: 'easeOut',
              repeat: Infinity,
              repeatType: 'reverse',
              repeatDelay: 0.4,
            }}
          />
          {/* Leaf on Stem 3 */}
          <motion.path
            d="M63 32 C66 32, 67 28, 64 29 C61 30, 61 32, 63 32 Z"
            fill="#16A34A"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              delay: 0.9,
              duration: 0.5,
              repeat: Infinity,
              repeatType: 'reverse',
              repeatDelay: 1.5,
            }}
          />

          {/* Flower 1 (Left Bloom) */}
          <motion.g
            transform="translate(30, 20)"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              delay: 1.1,
              type: 'spring',
              stiffness: 100,
              repeat: Infinity,
              repeatType: 'reverse',
              repeatDelay: 0.9,
            }}
          >
            {/* Flower Petals */}
            <circle cx="0" cy="0" r="4.5" fill="#EF4444" />
            <circle cx="-4" cy="-4" r="3" fill="#FCA5A5" />
            <circle cx="4" cy="-4" r="3" fill="#FCA5A5" />
            <circle cx="-4" cy="4" r="3" fill="#FCA5A5" />
            <circle cx="4" cy="4" r="3" fill="#FCA5A5" />
            <circle cx="0" cy="0" r="1.5" fill="#FBBF24" />
          </motion.g>

          {/* Flower 2 (Center Bloom) */}
          <motion.g
            transform="translate(50, 14)"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              delay: 0.9,
              type: 'spring',
              stiffness: 120,
              repeat: Infinity,
              repeatType: 'reverse',
              repeatDelay: 1.1,
            }}
          >
            <circle cx="0" cy="0" r="5.5" fill="#3B82F6" />
            <circle cx="-5" cy="-5" r="3.5" fill="#93C5FD" />
            <circle cx="5" cy="-5" r="3.5" fill="#93C5FD" />
            <circle cx="-5" cy="5" r="3.5" fill="#93C5FD" />
            <circle cx="5" cy="5" r="3.5" fill="#93C5FD" />
            <circle cx="0" cy="0" r="2" fill="#FBBF24" />
          </motion.g>

          {/* Flower 3 (Right Bloom) */}
          <motion.g
            transform="translate(70, 20)"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              delay: 1.2,
              type: 'spring',
              stiffness: 100,
              repeat: Infinity,
              repeatType: 'reverse',
              repeatDelay: 0.8,
            }}
          >
            <circle cx="0" cy="0" r="4.5" fill="#EC4899" />
            <circle cx="-4" cy="-4" r="3" fill="#F9A8D4" />
            <circle cx="4" cy="-4" r="3" fill="#F9A8D4" />
            <circle cx="-4" cy="4" r="3" fill="#F9A8D4" />
            <circle cx="4" cy="4" r="3" fill="#F9A8D4" />
            <circle cx="0" cy="0" r="1.5" fill="#FBBF24" />
          </motion.g>

          {/* Ceramic Vase Body Outline */}
          <motion.path
            d="M38 78 C38 78, 22 72, 26 48 C28 38, 36 33, 38 28 L62 28 C64 33, 72 38, 74 48 C78 72, 62 78, 62 78 Z"
            stroke="#2563EB"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: 'easeInOut' }}
          />

          {/* Decorative Pattern on Vase (Soft single horizontal wave line) */}
          <motion.path
            d="M29 55 Q50 63 71 55"
            stroke="#93C5FD"
            strokeWidth="1.5"
            strokeLinecap="round"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            transition={{ delay: 1, duration: 0.8 }}
          />

          {/* Vase Pedestal/Foot */}
          <motion.path
            d="M44 78 L56 78"
            stroke="#2563EB"
            strokeWidth="3.5"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1 }}
          />
        </svg>
      </div>
      {label && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.8 }}
          transition={{ duration: 0.5 }}
          className={`font-medium text-[#6B6B6B] tracking-wide ${textClasses[size]}`}
          style={{ fontFamily: 'var(--font-sans)' }}
        >
          {label}
        </motion.p>
      )}
    </div>
  );
}
