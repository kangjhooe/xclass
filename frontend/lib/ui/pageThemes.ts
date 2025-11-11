import { cn } from '@/lib/utils/cn';

export type PageTheme =
  | 'indigo'
  | 'violet'
  | 'rose'
  | 'amber'
  | 'emerald'
  | 'cyan'
  | 'slate';

export interface PageThemeConfig {
  /** Background gradient untuk container utama */
  background: string;
  /** Gradient warna untuk judul */
  headerGradient: string;
  /** Kelas Tailwind untuk tombol utama */
  primaryButton: string;
  /** Kelas Tailwind untuk tombol outline */
  outlineButton: string;
  /** Kelas tambahan untuk border kartu */
  cardBorder: string;
  /** Warna aksen untuk angka/statistik */
  accentText: string;
  /** Warna border aksen */
  accentBorder: string;
  /** Warna latar/icon pada kartu statistik */
  iconBackground: string;
  /** Kelas chip/badge aktif */
  badgeActive: string;
  /** Kelas chip/badge non-aktif */
  badgeInactive: string;
  /** Kelas dasar kartu statistik */
  statCard: string;
  /** Kelas teks nilai/statistik */
  statValue: string;
  /** Kelas untuk tabel header */
  tableHeader: string;
}

const pageThemeMap: Record<PageTheme, PageThemeConfig> = {
  indigo: {
    background: 'bg-gradient-to-br from-[#f5f7ff] via-[#f5f9ff]/70 to-[#f0f5ff] min-h-screen',
    headerGradient: 'from-indigo-600 to-sky-600',
    primaryButton:
      'bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-600 hover:to-sky-600 text-white shadow-lg hover:shadow-xl transition-all duration-300',
    outlineButton:
      'border border-indigo-200 text-indigo-600 hover:border-indigo-400 hover:bg-indigo-50 transition-all duration-200',
    cardBorder: 'border-indigo-100/70',
    accentText: 'text-indigo-600',
    accentBorder: 'border-indigo-500',
    iconBackground: 'bg-indigo-100 text-indigo-600',
    badgeActive: 'bg-indigo-100 text-indigo-700',
    badgeInactive: 'bg-gray-200 text-gray-600',
    statCard:
      'bg-white/90 backdrop-blur rounded-2xl shadow-lg border border-indigo-100/80 hover:shadow-xl transition-all duration-300',
    statValue: 'text-3xl font-bold text-indigo-600',
    tableHeader: 'bg-gradient-to-r from-indigo-50 to-sky-50',
  },
  violet: {
    background: 'bg-gradient-to-br from-[#f6f4ff] via-[#f8f7ff]/70 to-[#f4f3ff] min-h-screen',
    headerGradient: 'from-violet-600 to-purple-600',
    primaryButton:
      'bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300',
    outlineButton:
      'border border-violet-200 text-violet-600 hover:border-violet-400 hover:bg-violet-50 transition-all duration-200',
    cardBorder: 'border-violet-100/70',
    accentText: 'text-violet-600',
    accentBorder: 'border-violet-500',
    iconBackground: 'bg-violet-100 text-violet-600',
    badgeActive: 'bg-violet-100 text-violet-700',
    badgeInactive: 'bg-gray-200 text-gray-600',
    statCard:
      'bg-white/90 backdrop-blur rounded-2xl shadow-lg border border-violet-100/80 hover:shadow-xl transition-all duration-300',
    statValue: 'text-3xl font-bold text-violet-600',
    tableHeader: 'bg-gradient-to-r from-violet-50 to-purple-50',
  },
  rose: {
    background: 'bg-gradient-to-br from-[#fff5f7] via-[#fff7f9]/70 to-[#fff0f3] min-h-screen',
    headerGradient: 'from-rose-600 to-pink-600',
    primaryButton:
      'bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-300',
    outlineButton:
      'border border-rose-200 text-rose-600 hover:border-rose-400 hover:bg-rose-50 transition-all duration-200',
    cardBorder: 'border-rose-100/70',
    accentText: 'text-rose-600',
    accentBorder: 'border-rose-500',
    iconBackground: 'bg-rose-100 text-rose-600',
    badgeActive: 'bg-rose-100 text-rose-700',
    badgeInactive: 'bg-gray-200 text-gray-600',
    statCard:
      'bg-white/90 backdrop-blur rounded-2xl shadow-lg border border-rose-100/80 hover:shadow-xl transition-all duration-300',
    statValue: 'text-3xl font-bold text-rose-600',
    tableHeader: 'bg-gradient-to-r from-rose-50 to-pink-50',
  },
  amber: {
    background: 'bg-gradient-to-br from-[#fff8eb] via-[#fff9ee]/70 to-[#fff3d6] min-h-screen',
    headerGradient: 'from-amber-600 to-orange-600',
    primaryButton:
      'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg hover:shadow-xl transition-all duration-300',
    outlineButton:
      'border border-amber-200 text-amber-600 hover:border-amber-400 hover:bg-amber-50 transition-all duration-200',
    cardBorder: 'border-amber-100/70',
    accentText: 'text-amber-600',
    accentBorder: 'border-amber-500',
    iconBackground: 'bg-amber-100 text-amber-600',
    badgeActive: 'bg-amber-100 text-amber-700',
    badgeInactive: 'bg-gray-200 text-gray-600',
    statCard:
      'bg-white/90 backdrop-blur rounded-2xl shadow-lg border border-amber-100/80 hover:shadow-xl transition-all duration-300',
    statValue: 'text-3xl font-bold text-amber-600',
    tableHeader: 'bg-gradient-to-r from-amber-50 to-orange-50',
  },
  emerald: {
    background: 'bg-gradient-to-br from-[#ecfdf5] via-[#f0fdf8]/70 to-[#e6fcf1] min-h-screen',
    headerGradient: 'from-emerald-600 to-teal-600',
    primaryButton:
      'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg hover:shadow-xl transition-all duration-300',
    outlineButton:
      'border border-emerald-200 text-emerald-600 hover:border-emerald-400 hover:bg-emerald-50 transition-all duration-200',
    cardBorder: 'border-emerald-100/70',
    accentText: 'text-emerald-600',
    accentBorder: 'border-emerald-500',
    iconBackground: 'bg-emerald-100 text-emerald-600',
    badgeActive: 'bg-emerald-100 text-emerald-700',
    badgeInactive: 'bg-gray-200 text-gray-600',
    statCard:
      'bg-white/90 backdrop-blur rounded-2xl shadow-lg border border-emerald-100/80 hover:shadow-xl transition-all duration-300',
    statValue: 'text-3xl font-bold text-emerald-600',
    tableHeader: 'bg-gradient-to-r from-emerald-50 to-teal-50',
  },
  cyan: {
    background: 'bg-gradient-to-br from-[#ecfeff] via-[#f0feff]/70 to-[#e3fbff] min-h-screen',
    headerGradient: 'from-cyan-600 to-sky-600',
    primaryButton:
      'bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-600 hover:to-sky-600 text-white shadow-lg hover:shadow-xl transition-all duration-300',
    outlineButton:
      'border border-cyan-200 text-cyan-600 hover:border-cyan-400 hover:bg-cyan-50 transition-all duration-200',
    cardBorder: 'border-cyan-100/70',
    accentText: 'text-cyan-600',
    accentBorder: 'border-cyan-500',
    iconBackground: 'bg-cyan-100 text-cyan-600',
    badgeActive: 'bg-cyan-100 text-cyan-700',
    badgeInactive: 'bg-gray-200 text-gray-600',
    statCard:
      'bg-white/90 backdrop-blur rounded-2xl shadow-lg border border-cyan-100/80 hover:shadow-xl transition-all duration-300',
    statValue: 'text-3xl font-bold text-cyan-600',
    tableHeader: 'bg-gradient-to-r from-cyan-50 to-sky-50',
  },
  slate: {
    background: 'bg-gradient-to-br from-[#f8fafc] via-[#f9fbfd]/70 to-[#f4f6f9] min-h-screen',
    headerGradient: 'from-slate-700 to-gray-700',
    primaryButton:
      'bg-gradient-to-r from-slate-600 to-gray-600 hover:from-slate-700 hover:to-gray-700 text-white shadow-lg hover:shadow-xl transition-all duration-300',
    outlineButton:
      'border border-slate-200 text-slate-600 hover:border-slate-400 hover:bg-slate-50 transition-all duration-200',
    cardBorder: 'border-slate-100/70',
    accentText: 'text-slate-700',
    accentBorder: 'border-slate-500',
    iconBackground: 'bg-slate-100 text-slate-600',
    badgeActive: 'bg-slate-100 text-slate-700',
    badgeInactive: 'bg-gray-200 text-gray-600',
    statCard:
      'bg-white/90 backdrop-blur rounded-2xl shadow-lg border border-slate-100/80 hover:shadow-xl transition-all duration-300',
    statValue: 'text-3xl font-bold text-slate-700',
    tableHeader: 'bg-gradient-to-r from-slate-50 to-gray-50',
  },
};

export function getPageTheme(theme: PageTheme = 'indigo'): PageThemeConfig {
  return pageThemeMap[theme] ?? pageThemeMap.indigo;
}

export function pageHeaderText(theme: PageTheme = 'indigo') {
  const { headerGradient } = getPageTheme(theme);
  return cn('text-4xl font-bold bg-gradient-to-r bg-clip-text text-transparent', headerGradient);
}

export function pagePrimaryButton(theme: PageTheme = 'indigo') {
  const { primaryButton } = getPageTheme(theme);
  return primaryButton;
}

export function pageOutlineButton(theme: PageTheme = 'indigo') {
  const { outlineButton } = getPageTheme(theme);
  return outlineButton;
}

export function pageBadge(theme: PageTheme = 'indigo', active = true) {
  const config = getPageTheme(theme);
  return active ? config.badgeActive : config.badgeInactive;
}

export function pageTableHeader(theme: PageTheme = 'indigo') {
  return getPageTheme(theme).tableHeader;
}
