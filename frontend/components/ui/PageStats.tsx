import { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';
import { getPageTheme, PageTheme } from '@/lib/ui/pageThemes';

interface PageStatsGridProps {
  children: ReactNode;
  className?: string;
}

export function PageStatsGrid({ children, className }: PageStatsGridProps) {
  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-3 gap-6', className)}>{children}</div>
  );
}

interface PageStatCardProps {
  title: string;
  value: ReactNode;
  icon?: ReactNode;
  subtitle?: string;
  theme?: PageTheme;
  className?: string;
}

export function PageStatCard({
  title,
  value,
  icon,
  subtitle,
  theme = 'indigo',
  className,
}: PageStatCardProps) {
  const { cardBorder, accentText, iconBackground } = getPageTheme(theme);

  return (
    <div
      className={cn(
        'bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border transition-all duration-300 hover:shadow-xl',
        cardBorder,
        className,
      )}
    >
      <div className="flex items-center justify-between p-6">
        <div className="space-y-2">
          <p className="text-sm text-gray-600">{title}</p>
          <div className={cn('text-3xl font-bold', accentText)}>{value}</div>
          {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
        </div>
        {icon && (
          <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', iconBackground)}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
