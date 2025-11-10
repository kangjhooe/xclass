'use client';

import { useAuthStore } from '@/lib/store/auth';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface AdminLayoutProps {
  children: React.ReactNode;
}

interface MenuItem {
  label: string;
  href: string;
  icon?: string;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'super_admin') {
      router.push('/login');
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || user?.role !== 'super_admin') {
    return null;
  }

  const menuItems: MenuItem[] = [
    {
      label: 'Dashboard',
      href: '/admin/dashboard',
      icon: '📊',
    },
    {
      label: 'Tenants',
      href: '/admin/tenants',
      icon: '🏢',
    },
    {
      label: 'NPSN Change Requests',
      href: '/admin/npsn-change-requests',
      icon: '🔄',
    },
    {
      label: 'Users',
      href: '/admin/users',
      icon: '👥',
    },
    {
      label: 'System Settings',
      href: '/admin/system-settings',
      icon: '⚙️',
    },
    {
      label: 'Backup & Recovery',
      href: '/admin/backup',
      icon: '💾',
    },
    {
      label: 'Tenant Features',
      href: '/admin/tenant-features',
      icon: '🔧',
    },
    {
      label: 'Subscription',
      href: '/admin/subscription',
      icon: '💳',
    },
  ];

  const isActive = (href: string) => {
    return pathname === href || pathname?.startsWith(href + '/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-white shadow-lg transition-all duration-300 flex flex-col`}
      >
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <Link href="/admin/dashboard" className="text-xl font-bold text-gray-800">
                CLASS Admin
              </Link>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              {sidebarOpen ? '←' : '→'}
            </button>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive(item.href)
                  ? 'bg-blue-50 text-blue-600 font-semibold'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {item.icon && <span className="text-xl">{item.icon}</span>}
              {sidebarOpen && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t">
          <div className="flex items-center gap-3 px-4 py-3">
            {sidebarOpen && (
              <>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{user?.name}</p>
                  <p className="text-xs text-gray-500">Super Admin</p>
                </div>
                <button
                  onClick={() => {
                    logout();
                    router.push('/login');
                  }}
                  className="p-2 rounded-lg hover:bg-gray-100 text-red-600"
                  title="Keluar"
                >
                  🚪
                </button>
              </>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm border-b">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-semibold text-gray-800">
                {menuItems.find((item) => isActive(item.href))?.label || 'Admin Panel'}
              </h1>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

