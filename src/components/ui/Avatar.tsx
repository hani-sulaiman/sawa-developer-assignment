import { forwardRef } from 'react';

interface AvatarProps {
  src?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  variant?: 'default' | 'bordered' | 'glow';
  className?: string;
}

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ src, alt = 'Avatar', size = 'md', variant = 'default', className }, ref) => {
    const sizeClasses = {
      sm: 'w-10 h-10',
      md: 'w-12 h-12',
      lg: 'w-16 h-16',
      xl: 'w-20 h-20',
      '2xl': 'w-28 h-28',
    };

    const variantClasses = {
      default: 'ring-2 ring-white shadow-md',
      bordered: 'ring-4 ring-primary-100 shadow-lg',
      glow: 'ring-4 ring-primary-100 shadow-lg shadow-primary-200/50',
    };

    return (
      <div
        ref={ref}
        className={`
          ${sizeClasses[size]}
          ${variantClasses[variant]}
          rounded-full overflow-hidden bg-gray-100 flex-shrink-0
          ${className || ''}
        `}
      >
        {src ? (
          <img
            src={src}
            alt={alt}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(alt)}&background=3b82f6&color=fff&size=128`;
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-primary-100 text-primary-600 font-semibold text-lg">
            {alt.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';
