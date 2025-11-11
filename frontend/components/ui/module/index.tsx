'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

type ModuleVariant =
  | 'indigo'
  | 'violet'
  | 'blue'
  | 'cyan'
  | 'teal'
  | 'emerald'
  | 'green'
  | 'amber'
  | 'orange'
  | 'rose'
  | 'pink'
  | 'slate';

const pageBackground: Record<ModuleVariant, string> = {
  indigo: 'bg-gradient-to-br from-slate-50 via-indigo-50/40 to-purple-50/40',
  violet: 'bg-gradient-to-br from-slate-50 via-violet-50/40 to-purple-50/40',
  blue: 'bg-gradient-to-br from-slate-50 via-blue-50/40 to-sky-50/40',
  cyan: 'bg-gradient-to-br from-slate-50 via-cyan-50/40 to-blue-50/40',
  teal: 'bg-gradient-to-br from-slate-50 via-teal-50/40 to-emerald-50/40',
  emerald: 'bg-gradient-to-br from-slate-50 via-emerald-50/40 to-green-50/40',
  green: 'bg-gradient-to-br from-slate-50 via-green-50/40 to-lime-50/40',
  amber: 'bg-gradient-to-br from-slate-50 via-amber-50/40 to-orange-50/40',
  orange: 'bg-gradient-to-br from-slate-50 via-orange-50/40 to-amber-50/40',
  rose: 'bg-gradient-to-br from-slate-50 via-rose-50/40 to-pink-50/40',
  pink: 'bg-gradient-to-br from-slate-50 via-pink-50/40 to-rose-50/40',
  slate: 'bg-gradient-to-br from-white via-slate-50/40 to-slate-50/60',
};

const titleGradient: Record<ModuleVariant, string> = {
  indigo: 'bg-gradient-to-r from-indigo-600 to-purple-600',
  violet: 'bg-gradient-to-r from-violet-600 to-purple-600',
  blue: 'bg-gradient-to-r from-blue-600 to-indigo-600',
  cyan: 'bg-gradient-to-r from-cyan-600 to-blue-600',
  teal: 'bg-gradient-to-r from-teal-600 to-emerald-600',
  emerald: 'bg-gradient-to-r from-emerald-600 to-teal-600',
  green: 'bg-gradient-to-r from-green-600 to-emerald-600',
  amber: 'bg-gradient-to-r from-amber-600 to-orange-600',
  orange: 'bg-gradient-to-r from-orange-600 to-amber-600',
  rose: 'bg-gradient-to-r from-rose-600 to-pink-600',
  pink: 'bg-gradient-to-r from-pink-600 to-rose-600',
  slate: 'bg-gradient-to-r from-slate-700 to-slate-500',
};

const accentBackground: Record<
  'primary' | 'info' | 'success' | 'warning' | 'danger' | 'neutral',
  { container: string; text: string }
> = {
  primary: { container: 'bg-indigo-100 text-indigo-600', text: 'text-indigo-600' },
  info: { container: 'bg-sky-100 text-sky-600', text: 'text-sky-600' },
  success: { container: 'bg-emerald-100 text-emerald-600', text: 'text-emerald-600' },
  warning: { container: 'bg-amber-100 text-amber-600', text: 'text-amber-600' },
  danger: { container: 'bg-rose-100 text-rose-600', text: 'text-rose-600' },
  neutral: { container: 'bg-slate-100 text-slate-600', text: 'text-slate-600' },
};

export interface ModulePageProps {
  children: ReactNode;
  variant?: ModuleVariant;
  className?: string;
}

export function ModulePage({ children, variant = 'indigo', className }: ModulePageProps) {
  return (
    <div className={cn('min-h-screen p-6 transition-colors duration-300', pageBackground[variant], className)}>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">{children}</div>
    </div>
  );
}

export interface ModuleHeaderProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  variant?: ModuleVariant;
  badge?: ReactNode;
}

export function ModuleHeader({
  title,
  description,
  icon,
  actions,
  variant = 'indigo',
  badge,
}: ModuleHeaderProps) {
  return (
    <header className="flex flex-col gap-6 rounded-3xl bg-white/80 p-6 shadow-sm ring-1 ring-black/5 backdrop-blur lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-start gap-4">
        {icon && (
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 shadow-inner ring-1 ring-indigo-100">
            {icon}
          </div>
        )}
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1
              className={cn(
                'text-3xl font-bold leading-tight tracking-tight md:text-4xl',
                'bg-clip-text text-transparent',
                titleGradient[variant],
              )}
            >
              {title}
            </h1>
            {badge}
          </div>
          {description && <p className="mt-3 max-w-2xl text-sm text-slate-600 md:text-base">{description}</p>}
        </div>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}

export interface ModuleCardProps {
  children: ReactNode;
  className?: string;
  padded?: boolean;
  tone?: 'default' | 'subtle' | 'solid';
}

export function ModuleCard({ children, className, padded = true, tone = 'default' }: ModuleCardProps) {
  const toneMap: Record<NonNullable<ModuleCardProps['tone']>, string> = {
    default: 'bg-white/85 shadow-lg ring-1 ring-black/5 backdrop-blur-sm',
    subtle: 'bg-white/70 shadow-sm ring-1 ring-black/5 backdrop-blur',
    solid: 'bg-white shadow-lg ring-1 ring-black/10',
  };

  return (
    <div className={cn('rounded-2xl transition-shadow duration-300 hover:shadow-xl', toneMap[tone], padded && 'p-6', className)}>
      {children}
    </div>
  );
}

export interface ModuleStatsGridProps {
  children: ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}

export function ModuleStatsGrid({ children, columns = 3, className }: ModuleStatsGridProps) {
  const columnClass =
    columns === 4 ? 'md:grid-cols-2 xl:grid-cols-4' : columns === 2 ? 'md:grid-cols-2' : 'md:grid-cols-2 xl:grid-cols-3';

  return (
    <div className={cn('grid grid-cols-1 gap-6', columnClass, className)}>
      {children}
    </div>
  );
}

export interface ModuleStatCardProps {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  hint?: ReactNode;
  trend?: { value: string; positive?: boolean };
  accent?: 'primary' | 'info' | 'success' | 'warning' | 'danger' | 'neutral';
}

export function ModuleStatCard({
  label,
  value,
  icon,
  hint,
  trend,
  accent = 'primary',
}: ModuleStatCardProps) {
  const accentStyle = accentBackground[accent] ?? accentBackground.primary;

  return (
    <ModuleCard tone="subtle" padded className="flex h-full flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-medium text-slate-600">{label}</p>
        {icon && (
          <div className={cn('flex h-12 w-12 items-center justify-center rounded-xl shadow-inner ring-1 ring-black/5', accentStyle.container)}>
            {icon}
          </div>
        )}
      </div>
      <div className="flex items-baseline justify-between gap-4">
        <p className={cn('text-3xl font-bold tracking-tight', accentStyle.text)}>{value}</p>
        {trend && (
          <span
            className={cn(
              'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold shadow-inner ring-1 ring-black/5',
              trend.positive ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600',
            )}
          >
            {trend.positive ? '▲' : '▼'} {trend.value}
          </span>
        )}
      </div>
      {hint && <p className="text-xs text-slate-500">{hint}</p>}
    </ModuleCard>
  );
}

export interface ModuleSectionProps {
  title?: string;
  description?: string;
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function ModuleSection({ title, description, actions, children, className }: ModuleSectionProps) {
  return (
    <ModuleCard className={cn('space-y-6', className)}>
      {(title || description || actions) && (
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            {title && <h2 className="text-lg font-semibold text-slate-900">{title}</h2>}
            {description && <p className="mt-1 text-sm text-slate-600">{description}</p>}
          </div>
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </ModuleCard>
  );
}

export interface ModuleEmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function ModuleEmptyState({ icon, title, description, action }: ModuleEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl bg-white/70 p-12 text-center shadow-inner ring-1 ring-black/5 backdrop-blur">
      {icon && (
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-500">
          {icon}
        </div>
      )}
      <div>
        <p className="text-base font-semibold text-slate-800">{title}</p>
        {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export interface ModuleLoadingStateProps {
  title?: string;
  description?: string;
}

export function ModuleLoadingState({ title = 'Memuat data...', description }: ModuleLoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl bg-white/70 p-12 text-center shadow-inner ring-1 ring-black/5 backdrop-blur">
      <div className="inline-flex h-12 w-12 animate-spin items-center justify-center rounded-full border-2 border-slate-200 border-b-indigo-500"></div>
      <div>
        <p className="text-base font-semibold text-slate-800">{title}</p>
        {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      </div>
    </div>
  );
}


