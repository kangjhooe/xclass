'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Language = 'id' | 'en';

interface LanguageStore {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

// Simple translation function - bisa diganti dengan i18n library nanti
const translations: Record<Language, Record<string, string>> = {
  id: {
    'common.home': 'Beranda',
    'common.login': 'Masuk',
    'common.register': 'Daftar',
    'common.logout': 'Keluar',
    'common.save': 'Simpan',
    'common.cancel': 'Batal',
    'common.delete': 'Hapus',
    'common.edit': 'Edit',
    'common.search': 'Cari',
    'common.filter': 'Filter',
    'common.loading': 'Memuat...',
    'common.error': 'Terjadi kesalahan',
    'common.success': 'Berhasil',
    'common.confirm': 'Konfirmasi',
    'common.back': 'Kembali',
    'common.next': 'Selanjutnya',
    'common.previous': 'Sebelumnya',
    'common.submit': 'Kirim',
    'common.close': 'Tutup',
  },
  en: {
    'common.home': 'Home',
    'common.login': 'Login',
    'common.register': 'Register',
    'common.logout': 'Logout',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.loading': 'Loading...',
    'common.error': 'An error occurred',
    'common.success': 'Success',
    'common.confirm': 'Confirm',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.previous': 'Previous',
    'common.submit': 'Submit',
    'common.close': 'Close',
  },
};

export const useLanguageStore = create<LanguageStore>()(
  persist(
    (set, get) => ({
      language: 'id',
      setLanguage: (language: Language) => {
        set({ language });
        if (typeof document !== 'undefined') {
          document.documentElement.lang = language;
        }
      },
      t: (key: string, params?: Record<string, string | number>) => {
        const { language } = get();
        let translation = translations[language][key] || key;
        
        if (params) {
          Object.entries(params).forEach(([paramKey, paramValue]) => {
            translation = translation.replace(`{{${paramKey}}}`, String(paramValue));
          });
        }
        
        return translation;
      },
    }),
    {
      name: 'language-storage',
    }
  )
);

// Initialize language on mount
if (typeof window !== 'undefined') {
  const store = useLanguageStore.getState();
  document.documentElement.lang = store.language;
}

