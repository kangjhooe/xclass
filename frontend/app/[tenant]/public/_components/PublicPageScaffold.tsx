'use client';

import { PropsWithChildren, useMemo, useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GraduationCap, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import {
  getTenantTheme,
  TenantThemePresetKey,
  resolveThemePresetFromSettings,
} from '@/lib/theme/tenant-theme';
import { tenantApi } from '@/lib/api/tenant';

const NAV_ITEMS = [
  { label: 'Beranda', slug: 'public' },
  { label: 'Profil', slug: 'public/profile' },
  { label: 'Berita', slug: 'public/news' },
  { label: 'Galeri', slug: 'public/gallery' },
  { label: 'Download', slug: 'public/download' },
  { label: 'PPDB', slug: 'public/ppdb' },
  { label: 'Buku Tamu', slug: 'public/guest-book' },
  { label: 'Kontak', slug: 'public/contact' },
];

type PublicPageScaffoldProps = PropsWithChildren<{
  tenantId: string;
}>;

export function PublicPageScaffold({ tenantId, children }: PublicPageScaffoldProps) {
  const pathname = usePathname();
  const [presetKey, setPresetKey] = useState<TenantThemePresetKey | null>(null);
  useEffect(() => {
    let isMounted = true;
    const fetchTenantTheme = async () => {
      try {
        const tenant = await tenantApi.getByIdentifier(tenantId);
        const preset = resolveThemePresetFromSettings(tenant.settings);
        if (!isMounted) return;
        setPresetKey(preset);
      } catch (error) {
        if (isMounted) {
          setPresetKey(null);
        }
      }
    };
    fetchTenantTheme();
    return () => {
      isMounted = false;
    };
  }, [tenantId]);

  const theme = useMemo(() => getTenantTheme(tenantId, presetKey), [presetKey, tenantId]);
  const accentButtonStyle: CSSProperties = {
    backgroundImage: theme.accentGradient,
    boxShadow: theme.glowShadow,
  };
  const navStyle: CSSProperties = {
    background: theme.navBackground,
    borderColor: theme.navBorder,
  };

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-50">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div
          className="absolute inset-0 opacity-90 transition-colors dark:from-blue-900 dark:via-slate-900 dark:to-purple-900"
          style={{ background: theme.backgroundGradient }}
        ></div>
        <div
          className="absolute inset-0 blur-3xl animate-gradient-pan transition-opacity dark:from-blue-500/10 dark:via-purple-500/10 dark:to-pink-500/10"
          style={{ background: theme.accentSoft }}
        ></div>
        <div
          className="absolute -top-32 -left-12 h-96 w-96 rounded-full blur-[120px] animate-blob"
          style={{ background: `${theme.accentFrom}33` }}
        ></div>
        <div
          className="absolute top-1/2 -right-24 h-[28rem] w-[28rem] rounded-full blur-[140px] animate-blob-fast"
          style={{ background: `${theme.accentTo}33` }}
        ></div>
        <div className="absolute inset-x-0 bottom-0 h-[28rem] bg-gradient-to-t from-slate-200 via-slate-100/60 to-transparent transition-colors dark:from-slate-950 dark:via-slate-950/20"></div>
        <div className="absolute inset-0 bg-grid-dots opacity-30 mask-fade-bottom dark:opacity-40"></div>
      </div>

      <a href="#main-content" className="skip-link">
        Lewati ke konten utama
      </a>

      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl transition-colors dark:border-white/5 dark:bg-slate-950/70">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:flex-nowrap sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/80 to-purple-500/80 text-white shadow-lg shadow-blue-500/30">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <p
                className="text-xs font-semibold uppercase tracking-[0.3em]"
                style={{ color: theme.secondaryText }}
              >
                Tenant
              </p>
              <p className="text-lg font-semibold text-slate-900 dark:text-white">{tenantId}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle className="hidden sm:flex" />
            <Link href={`/${tenantId}/public/ppdb`}>
              <Button
                size="sm"
                className="gap-2 rounded-full text-white"
                style={accentButtonStyle}
              >
                <Sparkles className="h-4 w-4" />
                Informasi PPDB
              </Button>
            </Link>
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-4 pb-4 sm:px-6 lg:px-8">
          <nav
            className="no-scrollbar flex gap-2 overflow-x-auto rounded-2xl border p-1 text-sm font-medium backdrop-blur transition-colors dark:border-white/5 dark:bg-white/5"
            style={navStyle}
          >
            {NAV_ITEMS.map((item) => {
              const href = `/${tenantId}/${item.slug}`;
              const isActive = pathname === href || pathname?.startsWith(`${href}/`);
              return (
                <Link
                  key={item.slug}
                  href={href}
                  className={cn(
                    'flex items-center gap-2 rounded-2xl px-4 py-2 transition-all',
                    isActive
                      ? 'bg-slate-900 text-white shadow-lg shadow-blue-500/25 dark:bg-white dark:text-slate-900'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/70 dark:text-slate-200 dark:hover:text-white dark:hover:bg-white/10'
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <main id="main-content" className="relative z-10 mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {children}
      </main>

      <footer className="relative z-10 mt-12 border-t border-slate-200/70 bg-white/80 py-10 transition-colors dark:border-white/5 dark:bg-slate-950/80">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 text-center text-sm text-slate-500 sm:flex-row sm:justify-between sm:text-left sm:px-6 lg:px-8 dark:text-slate-300">
          <div>
            <p className="text-base font-semibold text-slate-900 dark:text-white">Website Sekolah</p>
            <p className="text-slate-500 dark:text-slate-400">Membangun generasi berprestasi dan berkarakter</p>
          </div>
          <div className="text-slate-500 dark:text-slate-400">
            © {new Date().getFullYear()} Website Sekolah · All rights reserved
          </div>
        </div>
      </footer>
    </div>
  );
}

