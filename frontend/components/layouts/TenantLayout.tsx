'use client';

import { useAuthStore } from '@/lib/store/auth';
import { useRouter, useParams, usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils/cn';

interface TenantLayoutProps {
  children: React.ReactNode;
}

interface MenuItem {
  label: string;
  href?: string;
  icon?: string;
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

  if (!hasHydrated) {
    return null;
  }

  if (!isAuthenticated) {
    return null;
  }

  const toggleMenu = (key: string) => {
    setOpenMenus((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const menuItems: MenuItem[] = [
    {
      label: 'Dashboard',
      href: `/${tenantNpsn}/dashboard`,
      icon: '📊',
    },
    {
      section: 'DATA POKOK',
      label: 'Data Pokok',
      children: [
        { label: 'Siswa', href: `/${tenantNpsn}/students`, icon: '👨‍🎓' },
        { label: 'Guru', href: `/${tenantNpsn}/teachers`, icon: '👨‍🏫' },
        { label: 'Kelas', href: `/${tenantNpsn}/classes`, icon: '🚪' },
        { label: 'Data Pokok', href: `/${tenantNpsn}/data-pokok`, icon: '📋' },
      ],
    },
    {
      section: 'AKADEMIK',
      label: 'Akademik',
      children: [
        { label: 'Tahun Pelajaran', href: `/${tenantNpsn}/academic-years`, icon: '📅' },
        { label: 'Mata Pelajaran', href: `/${tenantNpsn}/subjects`, icon: '📚' },
        { label: 'Jadwal Pelajaran', href: `/${tenantNpsn}/schedules`, icon: '📆' },
        { label: 'Nilai Siswa', href: `/${tenantNpsn}/grades`, icon: '📈' },
        { label: 'Bobot Nilai', href: `/${tenantNpsn}/grade-weight`, icon: '⚖️' },
        { label: 'Absensi', href: `/${tenantNpsn}/attendance`, icon: '✅' },
        { label: 'Ujian Online', href: `/${tenantNpsn}/exams`, icon: '📝' },
        { label: 'E-Learning', href: `/${tenantNpsn}/elearning`, icon: '💻' },
        { label: 'Laporan Akademik', href: `/${tenantNpsn}/academic-reports`, icon: '📊' },
        { label: 'Kenaikan Kelas', href: `/${tenantNpsn}/promotion`, icon: '⬆️' },
        { label: 'Kelulusan', href: `/${tenantNpsn}/graduation`, icon: '🎓' },
      ],
    },
    {
      section: 'SUMBER DAYA',
      label: 'Sumber Daya',
      children: [
        { label: 'Perpustakaan', href: `/${tenantNpsn}/library`, icon: '📖' },
        { label: 'SPP / Keuangan', href: `/${tenantNpsn}/finance`, icon: '💰' },
        { label: 'HR / SDM', href: `/${tenantNpsn}/hr`, icon: '👥' },
        { label: 'Transportasi', href: `/${tenantNpsn}/transportation`, icon: '🚌' },
        { label: 'Kafetaria', href: `/${tenantNpsn}/cafeteria`, icon: '🍽️' },
        { label: 'Infrastruktur', href: `/${tenantNpsn}/infrastructure`, icon: '🏢' },
        { label: 'Fasilitas', href: `/${tenantNpsn}/facility`, icon: '🏗️' },
        { label: 'Inventori', href: `/${tenantNpsn}/inventory`, icon: '📦' },
      ],
    },
    {
      section: 'KEGIATAN',
      label: 'Kegiatan',
      children: [
        { label: 'Event / Agenda', href: `/${tenantNpsn}/events`, icon: '📅' },
        { label: 'Alumni', href: `/${tenantNpsn}/alumni`, icon: '🎓' },
        { label: 'PPDB / SPMB', href: `/${tenantNpsn}/ppdb`, icon: '📋' },
        { label: 'Buku Tamu', href: `/${tenantNpsn}/guest-book`, icon: '📝' },
      ],
    },
    {
      section: 'BIDANG KHUSUS',
      label: 'Bidang Khusus',
      children: [
        { label: 'Kedisiplinan', href: `/${tenantNpsn}/discipline`, icon: '⚖️' },
        { label: 'Bimbingan Konseling', href: `/${tenantNpsn}/counseling`, icon: '💬' },
        { label: 'Kesehatan', href: `/${tenantNpsn}/health`, icon: '🏥' },
        { label: 'Ekstrakurikuler', href: `/${tenantNpsn}/extracurricular`, icon: '🏃' },
      ],
    },
    {
      section: 'KOMUNIKASI',
      label: 'Komunikasi',
      children: [
        { label: 'Pengumuman', href: `/${tenantNpsn}/announcement`, icon: '📢' },
        { label: 'Pesan', href: `/${tenantNpsn}/message`, icon: '💬' },
        { label: 'Notifikasi', href: `/${tenantNpsn}/notifications`, icon: '🔔' },
        { label: 'Persuratan', href: `/${tenantNpsn}/correspondence`, icon: '📨' },
      ],
    },
    {
      section: 'UTILITAS',
      label: 'Utilitas',
      children: [
        { label: 'Ekspor/Impor', href: `/${tenantNpsn}/export-import`, icon: '📤' },
        { label: 'Generator Laporan', href: `/${tenantNpsn}/report-generator`, icon: '📄' },
        { label: 'Manajemen Kartu', href: `/${tenantNpsn}/card-management`, icon: '💳' },
        { label: 'Transfer Siswa', href: `/${tenantNpsn}/student-transfer`, icon: '🔄' },
        { label: 'Log Aktivitas', href: `/${tenantNpsn}/activity-logs`, icon: '📋' },
        { label: 'Storage', href: `/${tenantNpsn}/storage`, icon: '💾' },
      ],
    },
    {
      section: 'PENGATURAN',
      label: 'Pengaturan',
      children: [
        { label: 'Profil Instansi', href: `/${tenantNpsn}/settings`, icon: '🏢' },
        { label: 'Perubahan NPSN', href: `/${tenantNpsn}/settings/npsn-change`, icon: '🔄' },
        { label: 'Akses Super Admin', href: `/${tenantNpsn}/settings/admin-access`, icon: '🛡️' },
      ],
    },
  ];

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

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* Sidebar */}
      <aside
        className={cn(
          'bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-r border-slate-700/50 transition-all duration-300 ease-in-out shadow-2xl flex-shrink-0',
          sidebarOpen ? 'w-64' : 'w-20'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-4 border-b border-slate-700/50 bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm flex-shrink-0">
            {sidebarOpen && (
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                CLASS
              </h1>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-slate-700/50 transition-all duration-200 text-slate-300 hover:text-white hover:scale-110"
            >
              {sidebarOpen ? '←' : '→'}
            </button>
          </div>

          {/* Menu */}
          <nav className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
            {menuItems.map((item, index) => (
              <div key={index}>
                {item.section && sidebarOpen && (
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 mt-6 px-3 py-1 bg-slate-800/50 rounded-md border-l-2 border-blue-500/50">
                    {item.section}
                  </div>
                )}
                {item.href ? (
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center space-x-3 px-3 py-2.5 rounded-xl mb-2 transition-all duration-200 group relative overflow-hidden',
                      isActive(item.href)
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium shadow-lg shadow-blue-500/30 scale-105'
                        : 'text-slate-300 hover:bg-slate-700/50 hover:text-white hover:scale-105 hover:shadow-md'
                    )}
                  >
                    <div className={cn(
                      'absolute inset-0 bg-gradient-to-r from-blue-600/0 to-purple-600/0 transition-opacity duration-200',
                      isActive(item.href) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    )} />
                    {item.icon && (
                      <span className={cn(
                        'text-lg relative z-10 transition-transform duration-200',
                        isActive(item.href) ? 'scale-110' : 'group-hover:scale-110'
                      )}>
                        {item.icon}
                      </span>
                    )}
                    {sidebarOpen && (
                      <span className="relative z-10">{item.label}</span>
                    )}
                    {isActive(item.href) && (
                      <div className="absolute right-2 w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                    )}
                  </Link>
                ) : item.children ? (
                  <div>
                    <button
                      onClick={() => toggleMenu(`menu-${index}`)}
                      className={cn(
                        'flex items-center justify-between w-full px-3 py-2.5 rounded-xl mb-2 transition-all duration-200 group',
                        'text-slate-300 hover:bg-slate-700/50 hover:text-white hover:scale-105'
                      )}
                    >
                      <div className="flex items-center space-x-3">
                        {item.icon && (
                          <span className="text-lg transition-transform duration-200 group-hover:scale-110">
                            {item.icon}
                          </span>
                        )}
                        {sidebarOpen && <span>{item.label}</span>}
                      </div>
                      {sidebarOpen && (
                        <span className={cn(
                          'transition-transform duration-300 text-slate-400',
                          openMenus[`menu-${index}`] ? 'rotate-90 text-white' : ''
                        )}>
                          ▶
                        </span>
                      )}
                    </button>
                    {sidebarOpen && openMenus[`menu-${index}`] && (
                      <div className="ml-6 mt-1 space-y-1 animate-slide-in-from-top">
                        {item.children.map((child, childIndex) => (
                          <Link
                            key={childIndex}
                            href={child.href || '#'}
                            className={cn(
                              'flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-all duration-200 group relative',
                              isActive(child.href)
                                ? 'bg-gradient-to-r from-blue-600/80 to-purple-600/80 text-white font-medium shadow-md shadow-blue-500/20 scale-105'
                                : 'text-slate-400 hover:bg-slate-700/50 hover:text-white hover:scale-105'
                            )}
                          >
                            {child.icon && (
                              <span className="transition-transform duration-200 group-hover:scale-110">
                                {child.icon}
                              </span>
                            )}
                            <span>{child.label}</span>
                            {isActive(child.href) && (
                              <div className="absolute right-2 w-1 h-1 bg-white rounded-full animate-pulse" />
                            )}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            ))}
          </nav>

          {/* User Info */}
          <div className="p-4 border-t border-slate-700/50 bg-gradient-to-t from-slate-800/50 to-transparent flex-shrink-0">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold shadow-lg shadow-blue-500/30 ring-2 ring-blue-400/50">
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
                </div>
              )}
            </div>
            {sidebarOpen && (
              <button
                onClick={() => {
                  logout();
                  if (typeof window !== 'undefined') {
                    sessionStorage.removeItem('delegatedTenant');
                  }
                  router.push('/login');
                }}
                className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-500/20 hover:text-red-300 rounded-lg transition-all duration-200 border border-red-500/30 hover:border-red-500/50 hover:scale-105"
              >
                Keluar
              </button>
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
