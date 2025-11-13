import { ReactNode } from 'react';
import { pageHeaderText, getPageTheme, PageTheme } from '@/lib/ui/pageThemes';
import { cn } from '@/lib/utils/cn';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  theme?: PageTheme;
  className?: string;
}

export function PageHeader({
  title,
  description,
  actions,
  theme = 'indigo',
  className,
}: PageHeaderProps) {
  const { accentText } = getPageTheme(theme);

  return (
    <div className={cn('mb-10', className)}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3 tracking-tight">
            {title}
          </h1>
          {description && (
            <p className="text-lg text-muted-foreground font-medium max-w-3xl">{description}</p>
          )}
        </div>
        <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-background/60 backdrop-blur-md rounded-xl shadow-lg border border-border">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-semibold text-foreground">Sistem Aktif</span>
        </div>
      </div>
      {actions && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-6">
          {actions}
        </div>
      )}
    </div>
  );
}
