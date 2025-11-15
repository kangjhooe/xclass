'use client';

import { useEffect } from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { useThemeStore } from '@/lib/store/theme';
import { cn } from '@/lib/utils/cn';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
  variant?: 'button' | 'dropdown';
}

export function ThemeToggle({
  className,
  showLabel = false,
  variant = 'button',
}: ThemeToggleProps) {
  const { theme, setTheme, actualTheme } = useThemeStore();

  useEffect(() => {
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const newActualTheme = theme === 'system' ? systemTheme : theme;
    setTheme(theme); // This will update actualTheme
  }, [theme, setTheme]);

  const themes: Array<{ value: 'light' | 'dark' | 'system'; icon: React.ReactNode; label: string }> = [
    { value: 'light', icon: <Sun className="h-4 w-4" />, label: 'Terang' },
    { value: 'dark', icon: <Moon className="h-4 w-4" />, label: 'Gelap' },
    { value: 'system', icon: <Monitor className="h-4 w-4" />, label: 'Sistem' },
  ];

  if (variant === 'dropdown') {
    return (
      <div className={cn('relative', className)}>
        <select
          value={theme}
          onChange={(e) => setTheme(e.target.value as 'light' | 'dark' | 'system')}
          className={cn(
            'appearance-none rounded-lg border border-slate-300 bg-white dark:bg-slate-800',
            'px-3 py-2 pr-8 text-sm font-medium text-slate-700 dark:text-slate-200',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
            'transition-colors'
          )}
          aria-label="Pilih tema"
        >
          {themes.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
          {themes.find((t) => t.value === theme)?.icon}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-800', className)}>
      {themes.map((t) => (
        <button
          key={t.value}
          onClick={() => setTheme(t.value)}
          className={cn(
            'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
            'hover:bg-slate-100 dark:hover:bg-slate-700',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
            theme === t.value
              ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
              : 'text-slate-600 dark:text-slate-300'
          )}
          aria-label={`Ubah tema ke ${t.label}`}
          aria-pressed={theme === t.value}
        >
          {t.icon}
          {showLabel && <span>{t.label}</span>}
        </button>
      ))}
    </div>
  );
}

