'use client';

import { useEffect } from 'react';
import { useThemeStore } from '@/lib/store/theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, setActualTheme } = useThemeStore();

  useEffect(() => {
    const root = document.documentElement;
    
    // Get system preference
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    
    // Determine actual theme
    const actualTheme = theme === 'system' ? systemTheme : theme;
    
    // Apply theme
    root.classList.remove('light', 'dark');
    root.classList.add(actualTheme);
    root.setAttribute('data-theme', actualTheme);
    setActualTheme(actualTheme);

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (theme === 'system') {
        const newTheme = e.matches ? 'dark' : 'light';
        root.classList.remove('light', 'dark');
        root.classList.add(newTheme);
        root.setAttribute('data-theme', newTheme);
        setActualTheme(newTheme);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, setActualTheme]);

  return <>{children}</>;
}

