import { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';
import { getPageTheme, PageTheme } from '@/lib/ui/pageThemes';

interface StatsCardProps {
  icon?: ReactNode;
  label: string;
  value: ReactNode;
  theme?: PageTheme;
  className?: string;
  footer?: ReactNode;
}

export function StatsCard({ icon, label, value, footer, theme = 'indigo', className }: StatsCardProps) {
  const themeConfig = getPageTheme(theme);

  return (
    <div className={cn(themeConfig.statCard, className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
          <div className={cn('text-3xl font-semibold', themeConfig.statValue)}>{value}</div>
        </div>
        {icon && (
          <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center', themeConfig.iconBackground)}>
            {icon}
          </div>
        )}
      </div>
      {footer && <div className="mt-4 text-sm text-muted-foreground">{footer}</div>}
    </div>
  );
}
