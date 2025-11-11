import { cn } from '@/lib/utils/cn';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

export function Skeleton({ 
  className, 
  variant = 'text',
  width,
  height,
  animation = 'pulse'
}: SkeletonProps) {
  const variants = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  const animations = {
    pulse: 'animate-pulse',
    wave: 'animate-[wave_1.6s_ease-in-out_0.5s_infinite]',
    none: '',
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      className={cn(
        'bg-gray-200 dark:bg-gray-700',
        variants[variant],
        animations[animation],
        className
      )}
      style={style}
    />
  );
}

// Predefined skeleton components
export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          height={16}
          width={i === lines - 1 ? '80%' : '100%'}
        />
      ))}
    </div>
  );
}

export function SkeletonAvatar({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  return <Skeleton variant="circular" className={sizes[size]} />;
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('p-6 space-y-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700', className)}>
      <Skeleton variant="rectangular" height={24} width="60%" />
      <SkeletonText lines={3} />
      <div className="flex gap-2">
        <Skeleton variant="rectangular" height={36} width={100} />
        <Skeleton variant="rectangular" height={36} width={100} />
      </div>
    </div>
  );
}

// Table Skeleton
export function SkeletonTable({ 
  rows = 5, 
  columns = 5,
  showHeader = true 
}: { 
  rows?: number; 
  columns?: number;
  showHeader?: boolean;
}) {
  return (
    <div className="w-full">
      {showHeader && (
        <div className="flex gap-4 p-4 border-b border-gray-200 dark:border-gray-700">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} variant="rectangular" height={20} width="100%" />
          ))}
        </div>
      )}
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex gap-4 p-4">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton 
                key={colIndex} 
                variant="rectangular" 
                height={16} 
                width={colIndex === 0 ? '30%' : '100%'} 
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// List Skeleton
export function SkeletonList({ 
  items = 5,
  showAvatar = false,
  showActions = false 
}: { 
  items?: number;
  showAvatar?: boolean;
  showActions?: boolean;
}) {
  return (
    <div className="space-y-3">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          {showAvatar && <SkeletonAvatar size="md" />}
          <div className="flex-1 space-y-2">
            <Skeleton variant="rectangular" height={16} width="40%" />
            <Skeleton variant="rectangular" height={14} width="60%" />
          </div>
          {showActions && (
            <div className="flex gap-2">
              <Skeleton variant="rectangular" height={32} width={32} />
              <Skeleton variant="rectangular" height={32} width={32} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// Dashboard Stats Skeleton
export function SkeletonStats({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <Skeleton variant="rectangular" height={16} width="60%" />
            <SkeletonAvatar size="sm" />
          </div>
          <Skeleton variant="rectangular" height={32} width="40%" className="mb-2" />
          <Skeleton variant="rectangular" height={14} width="80%" />
        </div>
      ))}
    </div>
  );
}

// Form Skeleton
export function SkeletonForm({ fields = 5 }: { fields?: number }) {
  return (
    <div className="space-y-6">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton variant="rectangular" height={14} width="30%" />
          <Skeleton variant="rectangular" height={40} width="100%" />
        </div>
      ))}
      <div className="flex gap-3 pt-4">
        <Skeleton variant="rectangular" height={40} width={120} />
        <Skeleton variant="rectangular" height={40} width={120} />
      </div>
    </div>
  );
}

// Chart Skeleton
export function SkeletonChart({ height = 300 }: { height?: number }) {
  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="mb-4">
        <Skeleton variant="rectangular" height={20} width="40%" />
        <Skeleton variant="rectangular" height={14} width="60%" className="mt-2" />
      </div>
      <Skeleton variant="rectangular" height={height} width="100%" />
    </div>
  );
}

// Page Skeleton (Full page loading)
export function SkeletonPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton variant="rectangular" height={32} width="200px" />
        <Skeleton variant="rectangular" height={40} width={120} />
      </div>
      
      {/* Stats */}
      <SkeletonStats count={4} />
      
      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SkeletonCard />
        </div>
        <div>
          <SkeletonCard />
        </div>
      </div>
      
      {/* Table */}
      <SkeletonTable rows={5} columns={5} />
    </div>
  );
}

// Button Skeleton
export function SkeletonButton({ width = 100 }: { width?: number }) {
  return <Skeleton variant="rectangular" height={40} width={width} className="rounded-md" />;
}

// Badge Skeleton
export function SkeletonBadge() {
  return <Skeleton variant="rectangular" height={24} width={80} className="rounded-full" />;
}

