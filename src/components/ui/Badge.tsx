import { forwardRef, ReactNode } from 'react';
import type { Specialty } from '../../../shared/schemas';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'specialty';
  specialty?: Specialty;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const specialtyConfig: Record<Specialty, { bg: string; text: string; label: string }> = {
  general: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'General' },
  cardiology: { bg: 'bg-red-100', text: 'text-red-700', label: 'Cardiology' },
  dermatology: { bg: 'bg-pink-100', text: 'text-pink-700', label: 'Dermatology' },
  pediatrics: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Pediatrics' },
  orthopedics: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Orthopedics' },
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ children, variant = 'default', specialty, size = 'md', className }, ref) => {
    const sizeClasses = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-3 py-1 text-xs',
      lg: 'px-4 py-1.5 text-sm',
    };

    const variantClasses = {
      default: 'bg-gray-100 text-gray-700',
      success: 'bg-emerald-100 text-emerald-700',
      warning: 'bg-amber-100 text-amber-700',
      danger: 'bg-red-100 text-red-700',
      info: 'bg-blue-100 text-blue-700',
      specialty: specialty ? `${specialtyConfig[specialty].bg} ${specialtyConfig[specialty].text}` : 'bg-gray-100 text-gray-700',
    };

    return (
      <span
        ref={ref}
        className={`
          inline-flex items-center font-semibold rounded-full
          uppercase tracking-wide
          ${sizeClasses[size]}
          ${variantClasses[variant]}
          ${className || ''}
        `}
      >
        {variant === 'specialty' && specialty ? specialtyConfig[specialty].label : children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

// Specialty Badge Component
export function SpecialtyBadge({ specialty, size = 'md' }: { specialty: Specialty; size?: 'sm' | 'md' | 'lg' }) {
  const config = specialtyConfig[specialty];
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-3 py-1 text-xs',
    lg: 'px-4 py-1.5 text-sm',
  };

  return (
    <span className={`inline-flex items-center font-semibold rounded-full uppercase tracking-wide ${sizeClasses[size]} ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
}
