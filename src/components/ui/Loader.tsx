interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullScreen?: boolean;
}

export function Loader({ size = 'md', text, fullScreen = false }: LoaderProps) {
  const sizes = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const loader = (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="relative">
        <div className={`${sizes[size]} rounded-full border-3 border-gray-200 dark:border-gray-700`} />
        <div 
          className={`${sizes[size]} rounded-full border-3 border-blue-600 dark:border-blue-400 border-t-transparent animate-spin absolute inset-0`} 
        />
      </div>
      {text && (
        <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">{text}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-gray-950 flex items-center justify-center z-50">
        {loader}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-16">
      {loader}
    </div>
  );
}

interface SkeletonCardProps {
  className?: string;
}

export function SkeletonCard({ className = '' }: SkeletonCardProps) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 ${className}`}>
      <div className="flex items-start gap-4 mb-5">
        <div className="w-16 h-16 rounded-xl skeleton" />
        <div className="flex-1">
          <div className="h-5 w-32 skeleton mb-2" />
          <div className="h-4 w-24 skeleton" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="h-16 skeleton rounded-xl" />
        <div className="h-16 skeleton rounded-xl" />
        <div className="h-16 skeleton rounded-xl" />
      </div>
      <div className="h-10 skeleton rounded-xl" />
    </div>
  );
}

interface SkeletonListProps {
  count?: number;
  className?: string;
}

export function SkeletonList({ count = 3, className = '' }: SkeletonListProps) {
  return (
    <div className={`grid md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
