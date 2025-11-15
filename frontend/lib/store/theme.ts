'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark' | 'system';

interface ThemeStore {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  actualTheme: 'light' | 'dark';
  setActualTheme: (theme: 'light' | 'dark') => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      theme: 'system',
      actualTheme: 'light',
      setTheme: (theme: Theme) => {
        set({ theme });
        if (typeof window !== 'undefined') {
          const actualTheme = theme === 'system' 
            ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
            : theme;
          get().setActualTheme(actualTheme);
        }
      },
      setActualTheme: (theme: 'light' | 'dark') => {
        set({ actualTheme: theme });
        if (typeof window !== 'undefined') {
          const root = document.documentElement;
          root.classList.remove('light', 'dark');
          root.classList.add(theme);
          root.setAttribute('data-theme', theme);
        }
      },
    }),
    {
      name: 'theme-storage',
    }
  )
);

