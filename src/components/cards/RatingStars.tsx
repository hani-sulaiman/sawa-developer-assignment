import { IconStar, IconStarHalf, IconStarFilled } from '@tabler/icons-react';

interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  reviewCount?: number;
}

export function RatingStars({ 
  rating, 
  maxRating = 5, 
  size = 'md', 
  showValue = true,
  reviewCount 
}: RatingStarsProps) {
  const sizeClasses = {
    sm: { icon: 14, text: 'text-xs' },
    md: { icon: 16, text: 'text-sm' },
    lg: { icon: 20, text: 'text-base' },
  };

  const { icon: iconSize, text: textSize } = sizeClasses[size];

  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = maxRating - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {/* Full stars */}
        {Array.from({ length: fullStars }).map((_, i) => (
          <IconStarFilled 
            key={`full-${i}`} 
            size={iconSize} 
            className="text-amber-400" 
          />
        ))}
        {/* Half star */}
        {hasHalfStar && (
          <IconStarHalf 
            size={iconSize} 
            className="text-amber-400" 
          />
        )}
        {/* Empty stars */}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <IconStar 
            key={`empty-${i}`} 
            size={iconSize} 
            className="text-gray-300 dark:text-gray-600" 
          />
        ))}
      </div>
      {showValue && (
        <span className={`font-bold text-gray-800 dark:text-gray-200 ${textSize}`}>
          {rating.toFixed(1)}
        </span>
      )}
      {reviewCount !== undefined && (
        <span className={`text-gray-400 dark:text-gray-500 ${textSize}`}>
          ({reviewCount})
        </span>
      )}
    </div>
  );
}
