import { HTMLAttributes, forwardRef, CSSProperties } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'bordered' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  style?: CSSProperties;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ 
    children, 
    variant = 'default', 
    padding = 'md',
    hover = false,
    className = '',
    style,
    ...props 
  }, ref) => {
    const baseStyles = 'rounded-xl sm:rounded-2xl transition-all duration-300';

    const variants = {
      default: 'bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800',
      bordered: 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700',
      elevated: 'bg-white dark:bg-gray-900 shadow-sm border border-gray-50 dark:border-gray-800',
    };

    const paddings = {
      none: '',
      sm: 'p-3 sm:p-4',
      md: 'p-4 sm:p-5 lg:p-6',
      lg: 'p-5 sm:p-6 lg:p-8',
    };

    const hoverStyles = hover 
      ? 'hover:shadow-lg hover:border-gray-200 dark:hover:border-gray-700 hover:-translate-y-1 cursor-pointer' 
      : '';

    return (
      <div
        ref={ref}
        className={`
          ${baseStyles}
          ${variants[variant]}
          ${paddings[padding]}
          ${hoverStyles}
          ${className}
        `}
        style={style}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
