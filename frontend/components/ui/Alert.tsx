import { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

interface AlertProps {
  children: ReactNode;
  variant?: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  className?: string;
  onClose?: () => void;
}

export function Alert({ 
  children, 
  variant = 'info', 
  title,
  className,
  onClose 
}: AlertProps) {
  const variants = {
    success: {
      container: 'bg-green-50 border-green-200 text-green-800',
      icon: 'text-green-400',
      title: 'text-green-800',
    },
    error: {
      container: 'bg-red-50 border-red-200 text-red-800',
      icon: 'text-red-400',
      title: 'text-red-800',
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      icon: 'text-yellow-400',
      title: 'text-yellow-800',
    },
    info: {
      container: 'bg-blue-50 border-blue-200 text-blue-800',
      icon: 'text-blue-400',
      title: 'text-blue-800',
    },
  };

  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  };

  const currentVariant = variants[variant];

  return (
    <div
      className={cn(
        'rounded-lg border p-4',
        currentVariant.container,
        className
      )}
      role="alert"
    >
      <div className="flex items-start">
        <div className={cn('flex-shrink-0 text-xl', currentVariant.icon)}>
          {icons[variant]}
        </div>
        <div className="ml-3 flex-1">
          {title && (
            <h3 className={cn('text-sm font-semibold mb-1', currentVariant.title)}>
              {title}
            </h3>
          )}
          <div className="text-sm">{children}</div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className={cn(
              'ml-4 flex-shrink-0 rounded-md p-1.5 inline-flex hover:bg-opacity-20 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2',
              currentVariant.container
            )}
          >
            <span className="sr-only">Tutup</span>
            <span className="text-lg">×</span>
          </button>
        )}
      </div>
    </div>
  );
}

