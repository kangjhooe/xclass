import { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';
import { getPageTheme, PageTheme } from '@/lib/ui/pageThemes';

interface PageContainerProps {
  children: ReactNode;
  /** Tema warna utama halaman */
  theme?: PageTheme;
  /** Nonaktifkan padding default */
  disablePadding?: boolean;
  className?: string;
}

export function PageContainer({
  children,
  theme = 'indigo',
  disablePadding = false,
  className,
}: PageContainerProps) {
  const { background } = getPageTheme(theme);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/40 via-indigo-50/30 to-purple-50/40">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
      </div>

      <div className={cn('relative', !disablePadding && 'p-6 lg:p-8', className)}>
        <div className="mx-auto max-w-7xl space-y-6">{children}</div>
      </div>
    </div>
  );
}
