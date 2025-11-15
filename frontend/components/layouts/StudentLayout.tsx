'use client';

import { useAuthStore } from '@/lib/store/auth';
import { useRouter, useParams, usePathname } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils/cn';
import {
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  CalendarDays,
  FileBarChart,
  Megaphone,
  MessageSquare,
  User,
  TrendingUp,
  Activity,
  Clock,
  LogOut,
  Menu,
  X,
  Bell,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useStudentNotifications } from '@/lib/hooks/useStudentNotifications';
import type { LucideIcon } from 'lucide-react';

interface StudentLayoutProps {
  children: React.ReactNode;
}

interface MenuItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export default function StudentLayout({ children }: StudentLayoutProps) {
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const tenantNpsn = params?.tenant as string;
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hasHydrated, setHasHydrated] = useState(false);
  
  // Fetch notification counts
  const { counts } = useStudentNotifications(tenantNpsn);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  useEffect(() => {
    if (hasHydrated && !isAuthenticated) {
      router.push('/login');
    }
  }, [hasHydrated, isAuthenticated, router]);

  useEffect(() => {
    if (hasHydrated && isAuthenticated && user?.role !== 'student') {
      // Redirect non-student users to appropriate dashboard
      if (user?.role === 'teacher') {
        router.replace(`/${tenantNpsn}/teacher-portal/dashboard`);
      } else if (user?.role === 'super_admin') {
        router.replace('/admin/dashboard');
      } else {
        router.replace(`/${tenantNpsn}/dashboard`);
      }
    }
  }, [hasHydrated, isAuthenticated, user, router, tenantNpsn]);

  const menuItems: MenuItem[] = useMemo(
    () => [
      {
        label: 'Dashboard',
        href: `/${tenantNpsn}/student-portal/dashboard`,
        icon: LayoutDashboard,
      },
      {
        label: 'Nilai',
        href: `/${tenantNpsn}/student-portal/grades`,
        icon: TrendingUp,
      },
      {
        label: 'Absensi',
        href: `/${tenantNpsn}/student-portal/attendance`,
        icon: Activity,
      },
      {
        label: 'Jadwal',
        href: `/${tenantNpsn}/student-portal/schedules`,
        icon: CalendarDays,
      },
      {
        label: 'Ujian Online',
        href: `/${tenantNpsn}/student-portal/exams`,
        icon: FileBarChart,
      },
      {
        label: 'Pengumuman',
        href: `/${tenantNpsn}/student-portal/announcements`,
        icon: Megaphone,
      },
      {
        label: 'Pesan',
        href: `/${tenantNpsn}/student-portal/messages`,
        icon: MessageSquare,
      },
      {
        label: 'Profil',
        href: `/${tenantNpsn}/student-portal/profile`,
        icon: User,
      },
    ],
    [tenantNpsn]
  );

  const isActive = (href: string) => {
    return pathname === href || pathname?.startsWith(href + '/');
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (!hasHydrated) {
    return null;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
      {/* Mobile Header */}
      <header className="lg:hidden bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 sticky top-0 z-50">
        <div className="flex items-center justify-between p-4">
          <Link href={`/${tenantNpsn}/student-portal/dashboard`} className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            CLASS
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle variant="button" className="hidden sm:flex" />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside
          className={cn(
            'hidden lg:flex flex-col bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 border-r border-slate-700/50 dark:border-slate-800/50 transition-all duration-300 shadow-xl',
            sidebarOpen ? 'w-64' : 'w-20'
          )}
        >
          {/* Logo & Toggle */}
          <div className="flex items-center justify-between p-4 border-b border-slate-700/50 dark:border-slate-800/50 bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm">
            {sidebarOpen && (
              <Link href={`/${tenantNpsn}/student-portal/dashboard`} className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent hover:opacity-80 transition-opacity">
                CLASS
              </Link>
            )}
            <div className="flex items-center gap-2">
              {sidebarOpen && (
                <ThemeToggle variant="button" className="scale-75" />
              )}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg hover:bg-slate-700/50 transition-all text-slate-300 hover:text-white"
                aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
              >
                {sidebarOpen ? '←' : '→'}
              </button>
            </div>
          </div>

          {/* User Info */}
          {sidebarOpen && (
            <div className="p-4 border-b border-slate-700/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                  {user?.name?.charAt(0).toUpperCase() || 'S'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{user?.name || 'Siswa'}</p>
                  <p className="text-xs text-slate-400 truncate">{user?.email || ''}</p>
                </div>
              </div>
            </div>
          )}

          {/* Menu */}
          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              
              // Get notification count for specific menu items
              let notificationCount = 0;
              if (item.label === 'Pesan') {
                notificationCount = counts.messages;
              } else if (item.label === 'Pengumuman') {
                notificationCount = counts.announcements;
              }
              
              const hasNotification = notificationCount > 0;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative',
                    active
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30'
                      : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                  )}
                >
                  <div className="relative">
                    <Icon className={cn('w-5 h-5 flex-shrink-0', active && 'text-white')} />
                    {hasNotification && !active && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-slate-900 dark:border-slate-800" />
                    )}
                  </div>
                  {sidebarOpen && (
                    <>
                      <span className="text-sm font-medium">{item.label}</span>
                      {hasNotification && (
                        <span className="ml-auto px-2 py-0.5 text-xs font-bold bg-red-500 text-white rounded-full min-w-[20px] text-center">
                          {notificationCount > 99 ? '99+' : notificationCount}
                        </span>
                      )}
                    </>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          {sidebarOpen && (
            <div className="p-4 border-t border-slate-700/50">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-red-500/20 hover:text-red-400 transition-all"
              >
                <LogOut className="w-5 h-5" />
                <span className="text-sm font-medium">Keluar</span>
              </button>
            </div>
          )}
        </aside>

        {/* Mobile Sidebar */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div className="fixed inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
            <aside className="relative w-64 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex flex-col">
              {/* Mobile Header */}
              <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
                <Link href={`/${tenantNpsn}/student-portal/dashboard`} className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  CLASS
                </Link>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* User Info */}
              <div className="p-4 border-b border-slate-700/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                    {user?.name?.charAt(0).toUpperCase() || 'S'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{user?.name || 'Siswa'}</p>
                    <p className="text-xs text-slate-400 truncate">{user?.email || ''}</p>
                  </div>
                </div>
              </div>

              {/* Menu */}
              <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  
                  // Get notification count for specific menu items
                  let notificationCount = 0;
                  if (item.label === 'Pesan') {
                    notificationCount = counts.messages;
                  } else if (item.label === 'Pengumuman') {
                    notificationCount = counts.announcements;
                  }
                  
                  const hasNotification = notificationCount > 0;
                  
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all relative',
                        active
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                          : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                      )}
                    >
                      <div className="relative">
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        {hasNotification && !active && (
                          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-slate-900" />
                        )}
                      </div>
                      <span className="text-sm font-medium flex-1">{item.label}</span>
                      {hasNotification && (
                        <span className="px-2 py-0.5 text-xs font-bold bg-red-500 text-white rounded-full min-w-[20px] text-center">
                          {notificationCount > 99 ? '99+' : notificationCount}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>

              {/* Logout */}
              <div className="p-4 border-t border-slate-700/50">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-red-500/20 hover:text-red-400 transition-all"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="text-sm font-medium">Keluar</span>
                </button>
              </div>
            </aside>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-x-hidden">
          <div className="p-4 lg:p-6 xl:p-8 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

