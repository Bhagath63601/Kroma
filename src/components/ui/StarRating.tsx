'use client';

import { Star } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
  showValue?: boolean;
  className?: string;
}

export default function StarRating({
  rating,
  maxRating = 5,
  size = 16,
  interactive = false,
  onChange,
  showValue = false,
  className,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);
  const displayRating = hoverRating || rating;

  return (
    <div className={`inline-flex items-center gap-1 ${className || ''}`}>
      {Array.from({ length: maxRating }).map((_, i) => {
        const starValue = i + 1;
        const isFilled = starValue <= displayRating;
        const isHalf = !isFilled && starValue - 0.5 <= displayRating;

        return (
          <motion.button
            key={i}
            type="button"
            whileTap={interactive ? { scale: 1.3 } : undefined}
            onClick={() => interactive && onChange?.(starValue)}
            onMouseEnter={() => interactive && setHoverRating(starValue)}
            onMouseLeave={() => interactive && setHoverRating(0)}
            className={`${interactive ? 'cursor-pointer' : 'cursor-default'} p-0 bg-transparent border-none`}
            disabled={!interactive}
            style={{ lineHeight: 0 }}
          >
            <Star
              size={size}
              fill={isFilled ? '#F59E0B' : isHalf ? 'url(#halfGrad)' : 'none'}
              color={isFilled || isHalf ? '#F59E0B' : '#D1D5DB'}
              strokeWidth={1.5}
            />
          </motion.button>
        );
      })}
      {showValue && (
        <span className="text-[13px] text-[#6B6B6B] ml-1 font-medium">
          {rating.toFixed(1)}
        </span>
      )}
      {/* SVG gradient for half stars */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="halfGrad">
            <stop offset="50%" stopColor="#F59E0B" />
            <stop offset="50%" stopColor="transparent" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
