'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  CalendarDays,
  TrendingUp,
  Activity,
  FileBarChart,
  GraduationCap,
  MessageSquare,
  Bell,
  Megaphone,
  Cog,
  Menu,
  X,
  Search,
  LogOut,
  User,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth';

interface TeacherLayoutProps {
  children: React.ReactNode;
}

interface MenuItem {
  label: string;
  href?: string;
  icon?: any;
  section?: string;
  children?: MenuItem[];
}

export default function TeacherLayout({ children }: TeacherLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  useEffect(() => {
    if (hasHydrated && (!isAuthenticated || user?.role !== 'teacher')) {
      router.replace('/login');
    }
  }, [hasHydrated, isAuthenticated, user?.role, router]);

  // Extract tenant NPSN from pathname
  const tenantNpsn = useMemo(() => {
    const match = pathname?.match(/\/([^\/]+)\//);
    return match ? match[1] : '';
  }, [pathname]);

  // Teacher-specific menu items
  const menuItems: MenuItem[] = useMemo(
    () => [
      {
        label: 'Dashboard',
        href: `/${tenantNpsn}/teacher-portal/dashboard`,
        icon: LayoutDashboard,
      },
      {
        section: 'AKADEMIK',
        label: 'Akademik',
        icon: ClipboardList,
        children: [
          {
            label: 'Jadwal Mengajar',
            href: `/${tenantNpsn}/teacher-portal/schedules`,
            icon: CalendarDays,
          },
          {
            label: 'Input Nilai',
            href: `/${tenantNpsn}/teacher-portal/grades`,
            icon: TrendingUp,
          },
          {
            label: 'Absensi Siswa',
            href: `/${tenantNpsn}/teacher-portal/attendance`,
            icon: Activity,
          },
          {
            label: 'Ujian Online',
            href: `/${tenantNpsn}/teacher-portal/exams`,
            icon: FileBarChart,
          },
          {
            label: 'E-Learning',
            href: `/${tenantNpsn}/teacher-portal/elearning`,
            icon: GraduationCap,
          },
          {
            label: 'Laporan Akademik',
            href: `/${tenantNpsn}/teacher-portal/reports`,
            icon: FileBarChart,
          },
        ],
      },
      {
        section: 'KOMUNIKASI',
        label: 'Komunikasi',
        icon: MessageSquare,
        children: [
          {
            label: 'Pesan',
            href: `/${tenantNpsn}/teacher-portal/messages`,
            icon: MessageSquare,
          },
          {
            label: 'Pengumuman',
            href: `/${tenantNpsn}/teacher-portal/announcements`,
            icon: Megaphone,
          },
          {
            label: 'Notifikasi',
            href: `/${tenantNpsn}/teacher-portal/notifications`,
            icon: Bell,
          },
        ],
      },
      {
        section: 'PENGATURAN',
        label: 'Pengaturan',
        icon: Cog,
        children: [
          {
            label: 'Profil',
            href: `/${tenantNpsn}/teacher-portal/profile`,
            icon: User,
          },
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

  const toggleMenu = (label: string) => {
    setExpandedMenus((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (!hasHydrated) {
    return null;
  }

  if (!isAuthenticated || user?.role !== 'teacher') {
    return null;
  }

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out`}
      >
        {/* Logo & Toggle */}
        <div className="h-16 border-b border-gray-200 flex items-center justify-between px-4">
          {sidebarOpen && (
            <Link href={`/${tenantNpsn}/teacher-portal/dashboard`} className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-gray-900">Teacher Portal</span>
            </Link>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {sidebarOpen ? (
              <X className="w-5 h-5 text-gray-600" />
            ) : (
              <Menu className="w-5 h-5 text-gray-600" />
            )}
          </button>
        </div>

        {/* Search */}
        {sidebarOpen && (
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cari menu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        )}

        {/* Menu Items */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {filteredMenuItems.map((item, index) => {
            if (item.section && sidebarOpen) {
              return (
                <div key={item.label} className="mt-4 first:mt-0">
                  <p className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {item.section}
                  </p>
                  {item.children?.map((child) => {
                    const Icon = child.icon || BookOpen;
                    const active = isActive(child.href);
                    return (
                      <Link
                        key={child.label}
                        href={child.href || '#'}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          active
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        {sidebarOpen && <span>{child.label}</span>}
                      </Link>
                    );
                  })}
                </div>
              );
            }

            if (item.children) {
              const Icon = item.icon || BookOpen;
              const isExpanded = expandedMenus[item.label] || false;
              return (
                <div key={item.label}>
                  <button
                    onClick={() => toggleMenu(item.label)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive(item.href)
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5" />
                      {sidebarOpen && <span>{item.label}</span>}
                    </div>
                    {sidebarOpen && (
                      isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )
                    )}
                  </button>
                  {isExpanded && sidebarOpen && (
                    <div className="ml-4 mt-1 space-y-1">
                      {item.children.map((child) => {
                        const ChildIcon = child.icon || BookOpen;
                        const active = isActive(child.href);
                        return (
                          <Link
                            key={child.label}
                            href={child.href || '#'}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                              active
                                ? 'bg-blue-50 text-blue-700 font-medium'
                                : 'text-gray-600 hover:bg-gray-50'
                            }`}
                          >
                            <ChildIcon className="w-4 h-4" />
                            <span>{child.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            const Icon = item.icon || BookOpen;
            const active = isActive(item.href);
            return (
              <Link
                key={item.label}
                href={item.href || '#'}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User Profile & Logout */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
              {user?.name?.charAt(0).toUpperCase() || 'G'}
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.name || 'Guru'}
                </p>
                <p className="text-xs text-gray-500 truncate">Guru</p>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span>Keluar</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors lg:hidden"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">
              {pathname?.split('/').pop()?.replace(/-/g, ' ') || 'Dashboard'}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

