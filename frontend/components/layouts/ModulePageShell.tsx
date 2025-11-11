import { ReactNode } from 'react';
import { PageContainer } from '@/components/ui/PageContainer';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { getModuleTheme } from '@/lib/ui/moduleThemes';
import { getPageTheme, PageTheme, PageThemeConfig } from '@/lib/ui/pageThemes';

interface ModuleStat {
  label: string;
  value: string | number;
  icon?: ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  footer?: ReactNode;
  className?: string;
}

interface ModulePageShellRenderProps {
  theme: PageTheme;
  themeConfig: PageThemeConfig;
}

interface ModulePageShellProps {
  moduleKey: string;
  title: string;
  description?: string;
  actions?: ReactNode | ((props: ModulePageShellRenderProps) => ReactNode);
  stats?: ModuleStat[];
  children: ReactNode | ((props: ModulePageShellRenderProps) => ReactNode);
  className?: string;
}

export function ModulePageShell({
  moduleKey,
  title,
  description,
  actions,
  stats,
  children,
  className,
}: ModulePageShellProps) {
  const theme = getModuleTheme(moduleKey);
  const themeConfig = getPageTheme(theme);

  const renderProps: ModulePageShellRenderProps = {
    theme,
    themeConfig,
  };

  const resolvedActions =
    typeof actions === 'function' ? (actions as (props: ModulePageShellRenderProps) => ReactNode)(renderProps) : actions;

  const resolvedChildren =
    typeof children === 'function' ? (children as (props: ModulePageShellRenderProps) => ReactNode)(renderProps) : children;

  return (
    <PageContainer theme={theme} className={className}>
      <PageHeader theme={theme} title={title} description={description} actions={resolvedActions} />

      {stats && stats.length > 0 && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {stats.map((stat, index) => (
            <StatCard key={index} theme={theme} {...stat} />
          ))}
        </div>
      )}

      {resolvedChildren}
    </PageContainer>
  );
}
