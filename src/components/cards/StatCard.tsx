import { ReactNode } from 'react';

interface StatCardProps {
  value: string | number;
  label: string;
  icon?: ReactNode;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
}

const colorClasses = {
  blue: {
    bg: 'bg-blue-50',
    icon: 'bg-blue-100 text-blue-600',
    value: 'text-blue-600',
  },
  green: {
    bg: 'bg-emerald-50',
    icon: 'bg-emerald-100 text-emerald-600',
    value: 'text-emerald-600',
  },
  yellow: {
    bg: 'bg-amber-50',
    icon: 'bg-amber-100 text-amber-600',
    value: 'text-amber-600',
  },
  red: {
    bg: 'bg-red-50',
    icon: 'bg-red-100 text-red-600',
    value: 'text-red-600',
  },
  purple: {
    bg: 'bg-purple-50',
    icon: 'bg-purple-100 text-purple-600',
    value: 'text-purple-600',
  },
};

export function StatCard({ value, label, icon, color = 'blue' }: StatCardProps) {
  const classes = colorClasses[color];

  return (
    <div className={`rounded-2xl p-5 ${classes.bg} transition-transform hover:scale-105`}>
      <div className="flex items-center gap-4">
        {icon && (
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${classes.icon}`}>
            {icon}
          </div>
        )}
        <div>
          <p className={`text-2xl font-bold ${classes.value}`}>{value}</p>
          <p className="text-sm text-gray-600 font-medium">{label}</p>
        </div>
      </div>
    </div>
  );
}

// Inline stat for doctor cards
export function InlineStat({ 
  icon, 
  value, 
  label 
}: { 
  icon: ReactNode; 
  value: string | number; 
  label?: string 
}) {
  return (
    <div className="flex items-center gap-1.5 text-gray-600">
      <span className="text-gray-400">{icon}</span>
      <span className="font-semibold text-gray-800">{value}</span>
      {label && <span className="text-gray-500 text-sm">{label}</span>}
    </div>
  );
}
