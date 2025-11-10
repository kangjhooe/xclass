import { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  children?: ReactNode;
}

export function Avatar({ src, alt, name, size = 'md', className, children }: AvatarProps) {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold overflow-hidden',
        sizes[size],
        className
      )}
    >
      {src ? (
        <img src={src} alt={alt || name} className="w-full h-full object-cover" />
      ) : children ? (
        children
      ) : name ? (
        <span>{getInitials(name)}</span>
      ) : (
        <span>?</span>
      )}
    </div>
  );
}

interface AvatarGroupProps {
  children: ReactNode;
  max?: number;
  className?: string;
}

export function AvatarGroup({ children, max = 3, className }: AvatarGroupProps) {
  return (
    <div className={cn('flex -space-x-2', className)}>
      {children}
    </div>
  );
}

