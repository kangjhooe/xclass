'use client';

import { useEffect } from 'react';
import { Languages } from 'lucide-react';
import { useLanguageStore, type Language } from '@/lib/store/language';
import { cn } from '@/lib/utils/cn';

interface LanguageSwitcherProps {
  className?: string;
  variant?: 'button' | 'dropdown';
  showLabel?: boolean;
}

const languages: Array<{ code: Language; label: string; flag: string }> = [
  { code: 'id', label: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
];

export function LanguageSwitcher({
  className,
  variant = 'button',
  showLabel = false,
}: LanguageSwitcherProps) {
  const { language, setLanguage } = useLanguageStore();

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
    }
  }, [language]);

  if (variant === 'dropdown') {
    return (
      <div className={cn('relative', className)}>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as Language)}
          className={cn(
            'appearance-none rounded-lg border border-slate-300 bg-white dark:bg-slate-800',
            'px-3 py-2 pr-8 text-sm font-medium text-slate-700 dark:text-slate-200',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
            'transition-colors'
          )}
          aria-label="Pilih bahasa"
        >
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.flag} {lang.label}
            </option>
          ))}
        </select>
        <Languages className="pointer-events-none absolute inset-y-0 right-0 mr-2 h-5 w-5 text-slate-400" />
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-800', className)}>
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => setLanguage(lang.code)}
          className={cn(
            'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
            'hover:bg-slate-100 dark:hover:bg-slate-700',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
            'min-h-[44px] min-w-[44px]', // Touch-friendly
            language === lang.code
              ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
              : 'text-slate-600 dark:text-slate-300'
          )}
          aria-label={`Ubah bahasa ke ${lang.label}`}
          aria-pressed={language === lang.code}
        >
          <span className="text-base">{lang.flag}</span>
          {showLabel && <span>{lang.label}</span>}
        </button>
      ))}
    </div>
  );
}

