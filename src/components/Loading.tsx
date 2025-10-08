interface LoadingSpinnerProps {
  readonly size?: 'sm' | 'md' | 'lg';
  readonly className?: string;
}

export function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div
      className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizeClasses[size]} ${className}`}
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

export function LoadingCard() {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden w-80 flex flex-col animate-pulse">
      <div className="w-full aspect-video bg-gray-300 dark:bg-gray-600" />
      <div className="p-4 flex flex-col flex-grow">
        <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded mb-2" />
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-2 w-3/4" />
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-3 w-1/2" />
        <div className="h-16 bg-gray-300 dark:bg-gray-600 rounded mb-4 flex-grow" />
        <div className="flex justify-between items-center">
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-20" />
          <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-16" />
        </div>
      </div>
    </div>
  );
}

interface LoadingSectionProps {
  readonly count?: number;
}

export function LoadingSection({ count = 6 }: LoadingSectionProps) {
  return (
    <div className="flex flex-wrap gap-6 justify-center">
      {Array.from({ length: count }, (_, i) => (
        <LoadingCard key={i} />
      ))}
    </div>
  );
}