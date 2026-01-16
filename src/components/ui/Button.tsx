import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'yellow';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    children, 
    variant = 'primary', 
    size = 'md', 
    fullWidth = false,
    loading = false,
    className = '',
    disabled,
    ...props 
  }, ref) => {
    const baseStyles = `
      inline-flex items-center justify-center font-semibold
      transition-all duration-200 ease-out
      disabled:opacity-60 disabled:cursor-not-allowed
    `;

    const variants = {
      primary: `
        bg-gradient-to-r from-blue-500 to-blue-600 text-white
        hover:from-blue-600 hover:to-blue-700
        active:scale-[0.98]
      `,
      secondary: `
        bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200
        hover:bg-gray-200 dark:hover:bg-gray-700
        active:scale-[0.98]
      `,
      outline: `
        bg-transparent border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300
        hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800
        active:scale-[0.98]
      `,
      ghost: `
        bg-transparent text-gray-600 dark:text-gray-400
        hover:bg-gray-100 dark:hover:bg-gray-800
        active:scale-[0.98]
      `,
      danger: `
        bg-gradient-to-r from-red-500 to-red-600 text-white
        hover:from-red-600 hover:to-red-700
        active:scale-[0.98]
      `,
      success: `
        bg-gradient-to-r from-emerald-500 to-emerald-600 text-white
        hover:from-emerald-600 hover:to-emerald-700
        active:scale-[0.98]
      `,
      yellow: `
        bg-gradient-to-r from-amber-400 to-amber-500 text-gray-900
        hover:from-amber-500 hover:to-amber-600
        active:scale-[0.98]
        font-bold
      `,
    };

    const sizes = {
      sm: 'text-sm px-4 py-2 rounded-lg',
      md: 'text-sm px-5 py-2.5 rounded-xl',
      lg: 'text-base px-6 py-3.5 rounded-xl',
      xl: 'text-lg px-8 py-4 rounded-2xl',
    };

    return (
      <button
        ref={ref}
        className={`
          ${baseStyles}
          ${variants[variant]}
          ${sizes[size]}
          ${fullWidth ? 'w-full' : ''}
          ${className}
        `}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>Loading...</span>
          </div>
        ) : children}
      </button>
    );
  }
);

Button.displayName = 'Button';
