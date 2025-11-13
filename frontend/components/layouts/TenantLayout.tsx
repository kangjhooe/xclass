'use client';

import { useAuthStore } from '@/lib/store/auth';
import { useRouter, useParams, usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils/cn';
import {
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  Users2,
  CalendarDays,
  ClipboardList,
  TrendingUp,
  LibraryBig,
  Wallet,
  BriefcaseBusiness,
  Bus,
  Utensils,
  Building,
  Boxes,
  Megaphone,
  MessageSquare,
  Bell,
  Mail,
  Cog,
  ShieldCheck,
  Archive,
  FileBarChart,
  BadgeCheck,
  Layers,
  Globe,
  Activity,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';

interface TenantLayoutProps {
  children: React.ReactNode;
}

import type { LucideIcon } from 'lucide-react';

interface MenuItem {
  label: string;
  href?: string;
  icon?: LucideIcon;
  children?: MenuItem[];
  section?: string;
}

interface DelegatedTenantSession {
  tenantId: number;
  tenantIdentifier?: string;
  tenantName?: string;
  expiresAt?: string | null;
}

export default function TenantLayout({ children }: TenantLayoutProps) {
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tenantNpsn = params?.tenant as string; // NPSN from URL
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
  const [hasHydrated, setHasHydrated] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [delegatedInfo, setDelegatedInfo] = useState<DelegatedTenantSession | null>(() => {
    if (typeof window === 'undefined') return null;
    const raw = sessionStorage.getItem('delegatedTenant');
    if (!raw) return null;
    try {
      return JSON.parse(raw) as DelegatedTenantSession;
    } catch (error) {
      sessionStorage.removeItem('delegatedTenant');
      return null;
    }
  });

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  useEffect(() => {
    if (hasHydrated && !isAuthenticated) {
      router.push('/login');
    }
  }, [hasHydrated, isAuthenticated, router]);

  useEffect(() => {
    if (!hasHydrated || !isAuthenticated || user?.role !== 'super_admin') {
      return;
    }

    const delegatedFlag = searchParams?.get('delegated');
    const tenantIdParam = searchParams?.get('tenantId');

    if (delegatedFlag === '1' && tenantIdParam && typeof window !== 'undefined') {
      const payload: DelegatedTenantSession = {
        tenantId: parseInt(tenantIdParam, 10),
        tenantIdentifier: tenantNpsn,
        tenantName: searchParams?.get('tenantName') || undefined,
        expiresAt: searchParams?.get('expiresAt'),
      };
      sessionStorage.setItem('delegatedTenant', JSON.stringify(payload));
      setDelegatedInfo(payload);
      return;
    }

    if (typeof window !== 'undefined') {
      const raw = sessionStorage.getItem('delegatedTenant');
      if (!raw) {
        router.replace('/admin/tenants?delegated=required');
        return;
      }
      try {
        const parsed = JSON.parse(raw) as DelegatedTenantSession;
        if (!parsed?.tenantId) {
          sessionStorage.removeItem('delegatedTenant');
          router.replace('/admin/tenants?delegated=required');
          return;
        }
        if (parsed.expiresAt && new Date(parsed.expiresAt).getTime() <= Date.now()) {
          sessionStorage.removeItem('delegatedTenant');
          router.replace('/admin/tenants?delegated=expired');
          return;
        }
        if (tenantNpsn && parsed.tenantIdentifier !== tenantNpsn) {
          parsed.tenantIdentifier = tenantNpsn;
          sessionStorage.setItem('delegatedTenant', JSON.stringify(parsed));
        }
        setDelegatedInfo(parsed);
      } catch (error) {
        sessionStorage.removeItem('delegatedTenant');
        router.replace('/admin/tenants?delegated=required');
      }
    }
  }, [hasHydrated, isAuthenticated, user?.role, searchParams, tenantNpsn, router]);

  const menuItems: MenuItem[] = useMemo(
    () => [
      {
        label: 'Dashboard',
        href: `/${tenantNpsn}/dashboard`,
        icon: LayoutDashboard,
      },
      {
        section: 'DATA POKOK',
        label: 'Data Pokok',
        icon: BookOpen,
        children: [
          { label: 'Siswa', href: `/${tenantNpsn}/students`, icon: Users2 },
          { label: 'Guru', href: `/${tenantNpsn}/teachers`, icon: GraduationCap },
          { label: 'Kelas', href: `/${tenantNpsn}/classes`, icon: Layers },
          { label: 'Data Pokok', href: `/${tenantNpsn}/data-pokok`, icon: Archive },
        ],
      },
      {
        section: 'AKADEMIK',
        label: 'Akademik',
        icon: ClipboardList,
        children: [
          { label: 'Tahun Pelajaran', href: `/${tenantNpsn}/academic-years`, icon: CalendarDays },
          { label: 'Mata Pelajaran', href: `/${tenantNpsn}/subjects`, icon: BookOpen },
          { label: 'Jadwal Pelajaran', href: `/${tenantNpsn}/schedules`, icon: CalendarDays },
          { label: 'Nilai Siswa', href: `/${tenantNpsn}/grades`, icon: TrendingUp },
          { label: 'Bobot Nilai', href: `/${tenantNpsn}/grade-weight`, icon: BadgeCheck },
          { label: 'Absensi', href: `/${tenantNpsn}/attendance`, icon: Activity },
          { label: 'Ujian Online', href: `/${tenantNpsn}/exams`, icon: FileBarChart },
          { label: 'E-Learning', href: `/${tenantNpsn}/elearning`, icon: GraduationCap },
          { label: 'Laporan Akademik', href: `/${tenantNpsn}/academic-reports`, icon: FileBarChart },
          { label: 'Kenaikan Kelas', href: `/${tenantNpsn}/promotion`, icon: TrendingUp },
          { label: 'Kelulusan', href: `/${tenantNpsn}/graduation`, icon: GraduationCap },
        ],
      },
      {
        section: 'SUMBER DAYA',
        label: 'Sumber Daya',
        icon: BriefcaseBusiness,
        children: [
          { label: 'Perpustakaan', href: `/${tenantNpsn}/library`, icon: LibraryBig },
          { label: 'SPP / Keuangan', href: `/${tenantNpsn}/finance`, icon: Wallet },
          { label: 'HR / SDM', href: `/${tenantNpsn}/hr`, icon: Users2 },
          { label: 'Transportasi', href: `/${tenantNpsn}/transportation`, icon: Bus },
          { label: 'Kafetaria', href: `/${tenantNpsn}/cafeteria`, icon: Utensils },
          { label: 'Infrastruktur', href: `/${tenantNpsn}/infrastructure`, icon: Building },
          { label: 'Fasilitas', href: `/${tenantNpsn}/facility`, icon: Boxes },
          { label: 'Inventori', href: `/${tenantNpsn}/inventory`, icon: Boxes },
        ],
      },
      {
        section: 'KEGIATAN',
        label: 'Kegiatan',
        icon: CalendarDays,
        children: [
          { label: 'Event / Agenda', href: `/${tenantNpsn}/events`, icon: CalendarDays },
          { label: 'Alumni', href: `/${tenantNpsn}/alumni`, icon: GraduationCap },
          { label: 'PPDB / SPMB', href: `/${tenantNpsn}/ppdb`, icon: ClipboardList },
          { label: 'Buku Tamu', href: `/${tenantNpsn}/guest-book`, icon: FileBarChart },
        ],
      },
      {
        section: 'BIDANG KHUSUS',
        label: 'Bidang Khusus',
        icon: ShieldCheck,
        children: [
          { label: 'Kedisiplinan', href: `/${tenantNpsn}/discipline`, icon: ShieldCheck },
          { label: 'Bimbingan Konseling', href: `/${tenantNpsn}/counseling`, icon: MessageSquare },
          { label: 'Kesehatan', href: `/${tenantNpsn}/health`, icon: Activity },
          { label: 'Ekstrakurikuler', href: `/${tenantNpsn}/extracurricular`, icon: Users2 },
        ],
      },
      {
        section: 'KOMUNIKASI',
        label: 'Komunikasi',
        icon: MessageSquare,
        children: [
          { label: 'Pengumuman', href: `/${tenantNpsn}/announcement`, icon: Megaphone },
          { label: 'Pesan', href: `/${tenantNpsn}/message`, icon: MessageSquare },
          { label: 'Notifikasi', href: `/${tenantNpsn}/notifications`, icon: Bell },
          { label: 'Persuratan', href: `/${tenantNpsn}/correspondence`, icon: Mail },
        ],
      },
      {
        section: 'UTILITAS',
        label: 'Utilitas',
        icon: Boxes,
        children: [
          { label: 'Ekspor/Impor', href: `/${tenantNpsn}/export-import`, icon: Globe },
          { label: 'Generator Laporan', href: `/${tenantNpsn}/report-generator`, icon: FileBarChart },
          { label: 'Manajemen Kartu', href: `/${tenantNpsn}/card-management`, icon: BadgeCheck },
          { label: 'Transfer Siswa', href: `/${tenantNpsn}/student-transfer`, icon: TrendingUp },
          { label: 'Log Aktivitas', href: `/${tenantNpsn}/activity-logs`, icon: ClipboardList },
          { label: 'Storage', href: `/${tenantNpsn}/storage`, icon: Archive },
        ],
      },
      {
        section: 'PENGATURAN',
        label: 'Pengaturan',
        icon: Cog,
        children: [
          { label: 'Profil Instansi', href: `/${tenantNpsn}/settings`, icon: Building },
          { label: 'Perubahan NPSN', href: `/${tenantNpsn}/settings/npsn-change`, icon: RefreshCw },
          { label: 'Akses Super Admin', href: `/${tenantNpsn}/settings/admin-access`, icon: ShieldCheck },
        ],
      },
    ],
    [tenantNpsn]
  );

  // Filter menu items based on search query
  const filteredMenuItems = useMemo(() => {
    if (!searchQuery.trim()) return menuItems;

    const query = searchQuery.toLowerCase();
    return menuItems
      .map((item) => {
        if (item.href && item.label.toLowerCase().includes(query)) {
          return item;
        }
        if (item.children) {
          const filteredChildren = item.children.filter((child) =>
            child.label.toLowerCase().includes(query)
          );
          if (filteredChildren.length > 0) {
            return { ...item, children: filteredChildren };
          }
        }
        return null;
      })
      .filter((item): item is MenuItem => item !== null);
  }, [menuItems, searchQuery]);

  const isActive = (href?: string) => {
    if (!href) return false;
    return pathname === href || pathname?.startsWith(href + '/');
  };

  const handleExitDelegated = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('delegatedTenant');
    }
    router.push('/admin/tenants');
  };

  if (!hasHydrated) {
    return null;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* Sidebar */}
      <aside
        className={cn(
          'bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-r border-slate-700/50 transition-all duration-300 ease-in-out shadow-2xl flex-shrink-0 relative z-10',
          sidebarOpen ? 'w-80' : 'w-20'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo & Toggle */}
          <div className="flex items-center justify-between p-4 border-b border-slate-700/50 bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm flex-shrink-0">
            {sidebarOpen && (
              <Link href={`/${tenantNpsn}/dashboard`} className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent hover:opacity-80 transition-opacity">
                CLASS
              </Link>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-slate-700/50 transition-all duration-200 text-slate-300 hover:text-white hover:scale-110 active:scale-95"
              aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              <span className="text-lg font-semibold">{sidebarOpen ? '←' : '→'}</span>
            </button>
          </div>

          {/* Search Bar */}
          {sidebarOpen && (
            <div className="p-3 border-b border-slate-700/50 flex-shrink-0">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Cari menu atau tekan / untuk fokus..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 pl-9 pr-9 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                    aria-label="Clear search"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Menu */}
          <nav className="flex-1 overflow-y-auto px-3 py-4 scrollbar-thin">
            {filteredMenuItems.map((item, index) => {
              const itemKey = `menu-${index}`;
              const Icon = item.icon;
              const hasChildren = Boolean(item.children?.length);
              const hasActiveChild = item.children?.some((child) => isActive(child.href));
              const isExpanded = hasChildren ? openMenus[itemKey] ?? Boolean(hasActiveChild) : false;

              return (
                <div key={`${item.label}-${index}`} className="mb-1">
                  {item.section && sidebarOpen && (
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-6 mb-2">
                      {item.section}
                    </p>
                  )}

                  {item.href ? (
                    <Link
                      href={item.href}
                      title={!sidebarOpen ? item.label : undefined}
                      aria-label={item.label}
                      className={cn(
                        'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                        isActive(item.href)
                          ? 'bg-blue-600/10 text-blue-400 font-medium'
                          : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                      )}
                    >
                      {Icon && <Icon className={cn('h-4 w-4 flex-shrink-0', isActive(item.href) && 'text-blue-400')} />}
                      {sidebarOpen && <span className="truncate">{item.label}</span>}
                    </Link>
                  ) : hasChildren ? (
                    <div>
                      <button
                        type="button"
                        onClick={() =>
                          setOpenMenus((prev) => ({
                            ...prev,
                            [itemKey]: !(prev[itemKey] ?? hasActiveChild),
                          }))
                        }
                        className={cn(
                          'flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors',
                          isExpanded
                            ? 'bg-slate-800/60 text-white'
                            : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                        )}
                        title={!sidebarOpen ? item.label : undefined}
                        aria-label={item.label}
                      >
                        <span className="flex items-center gap-3 truncate">
                          {Icon && <Icon className="h-4 w-4 flex-shrink-0" />}
                          {sidebarOpen && <span>{item.label}</span>}
                        </span>
                        {sidebarOpen && (
                          <ChevronRight
                            className={cn(
                              'h-4 w-4 text-slate-400 transition-transform',
                              isExpanded && 'rotate-90 text-white'
                            )}
                          />
                        )}
                      </button>
                      {sidebarOpen && isExpanded && (
                        <div className="mt-1 space-y-1 border-l border-slate-700/60 pl-3">
                          {item.children?.map((child, childIndex) => {
                            const ChildIcon = child.icon;
                            return (
                              <Link
                                key={`${child.label}-${childIndex}`}
                                href={child.href || '#'}
                                className={cn(
                                  'group flex items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors',
                                  isActive(child.href)
                                    ? 'bg-blue-600/10 text-blue-400 font-medium'
                                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                                )}
                              >
                                {ChildIcon && (
                                  <ChildIcon
                                    className={cn('h-4 w-4 flex-shrink-0', isActive(child.href) && 'text-blue-400')}
                                  />
                                )}
                                <span className="truncate">{child.label}</span>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
              );
            })}

            {filteredMenuItems.length === 0 && (
              <div className="mt-10 rounded-lg border border-slate-800/60 bg-slate-900/40 px-4 py-6 text-center text-sm text-slate-400">
                <p className="font-medium text-slate-300">Menu tidak ditemukan</p>
                <p className="text-xs text-slate-500">Coba kata kunci lain atau reset pencarian</p>
              </div>
            )}
          </nav>

          {/* User Info */}
          <div className="p-4 border-t border-slate-700/50 bg-gradient-to-t from-slate-800/80 to-slate-800/40 backdrop-blur-sm flex-shrink-0">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-500/40 ring-2 ring-blue-400/30 flex-shrink-0">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              {sidebarOpen && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">
                    {user?.name || 'User'}
                  </p>
                  <p className="text-xs text-slate-400 truncate">
                    {user?.email || ''}
                  </p>
                  {user?.role === 'super_admin' && delegatedInfo && (
                    <p className="text-xs text-blue-400 mt-0.5 font-medium">
                      Mode Delegasi
                    </p>
                  )}
                </div>
              )}
            </div>
            {sidebarOpen && (
              <div className="space-y-1.5">
                {user?.role === 'super_admin' && delegatedInfo && (
                  <button
                    onClick={handleExitDelegated}
                    className="w-full text-left px-3 py-2 text-sm text-blue-400 hover:bg-blue-500/20 hover:text-blue-300 rounded-lg transition-all duration-200 border border-blue-500/30 hover:border-blue-500/50 active:scale-95"
                  >
                    Keluar Mode Tenant
                  </button>
                )}
                <button
                  onClick={() => {
                    logout();
                    if (typeof window !== 'undefined') {
                      sessionStorage.removeItem('delegatedTenant');
                    }
                    router.push('/login');
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-500/20 hover:text-red-300 rounded-lg transition-all duration-200 border border-red-500/30 hover:border-red-500/50 active:scale-95 flex items-center gap-2"
                >
                  <span>🚪</span>
                  <span>Keluar</span>
                </button>
              </div>
            )}
            {!sidebarOpen && (
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={() => {
                    logout();
                    if (typeof window !== 'undefined') {
                      sessionStorage.removeItem('delegatedTenant');
                    }
                    router.push('/login');
                  }}
                  className="p-2 rounded-lg text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all duration-200 border border-red-500/30 hover:border-red-500/50 active:scale-95"
                  title="Keluar"
                  aria-label="Keluar"
                >
                  <span className="text-lg">🚪</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">
              {menuItems
                .flatMap((item) => [
                  item,
                  ...(item.children || []),
                ])
                .find((item) => isActive(item.href))?.label || 'Dashboard'}
            </h2>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{user?.name}</span>
              {user?.role === 'super_admin' && delegatedInfo && (
                <ButtonLike onClick={handleExitDelegated} />
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {user?.role === 'super_admin' && delegatedInfo && (
            <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
              <div className="font-semibold">
                Mode delegasi tenant aktif
              </div>
              <div>
                Anda mengakses tenant {delegatedInfo.tenantName || delegatedInfo.tenantIdentifier || `#${delegatedInfo.tenantId}`}.
                {delegatedInfo.expiresAt && (
                  <span className="block text-xs text-blue-600 mt-1">
                    Akses berakhir pada {new Date(delegatedInfo.expiresAt).toLocaleString('id-ID')}
                  </span>
                )}
              </div>
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}

function ButtonLike({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 text-sm rounded-lg border border-blue-500 text-blue-600 hover:bg-blue-50 transition-colors"
    >
      Keluar Mode Tenant
    </button>
  );
}
