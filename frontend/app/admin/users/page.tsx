'use client';

import { useState, useEffect, useMemo } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import { adminApi, User } from '@/lib/api/admin';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { SearchInput } from '@/components/ui/SearchInput';
import { SortableTableHead, SortDirection } from '@/components/ui/SortableTableHead';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToastStore } from '@/lib/store/toast';
import { formatDate, formatDateTime } from '@/lib/utils/date';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: SortDirection } | null>(null);
  const { success, error: showError } = useToastStore();
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    loadUsers();
  }, []);

  // Filter dan sort users
  const filteredAndSortedUsers = useMemo(() => {
    let filtered = [...allUsers];

    // Apply role filter
    if (selectedRole) {
      filtered = filtered.filter((user) => user.role === selectedRole);
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.name?.toLowerCase().includes(query) ||
          user.email?.toLowerCase().includes(query) ||
          user.phone?.toLowerCase().includes(query) ||
          user.tenant?.name?.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    if (sortConfig?.key && sortConfig.direction) {
      filtered.sort((a, b) => {
        let aValue: any = a[sortConfig.key as keyof User];
        let bValue: any = b[sortConfig.key as keyof User];

        // Handle nested properties
        if (sortConfig.key === 'tenant') {
          aValue = a.tenant?.name || '';
          bValue = b.tenant?.name || '';
        }

        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortConfig.direction === 'asc'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [allUsers, selectedRole, searchQuery, sortConfig]);

  // Paginate filtered results
  const paginatedUsers = useMemo(() => {
    const start = (pagination.page - 1) * pagination.limit;
    const end = start + pagination.limit;
    return filteredAndSortedUsers.slice(start, end);
  }, [filteredAndSortedUsers, pagination.page, pagination.limit]);

  // Update pagination when filtered results change
  useEffect(() => {
    const totalPages = Math.ceil(filteredAndSortedUsers.length / pagination.limit);
    setPagination((prev) => ({
      ...prev,
      total: filteredAndSortedUsers.length,
      totalPages: totalPages || 1,
      page: prev.page > totalPages && totalPages > 0 ? 1 : prev.page,
    }));
  }, [filteredAndSortedUsers.length, pagination.limit]);

  // Update users when paginated results change
  useEffect(() => {
    setUsers(paginatedUsers);
  }, [paginatedUsers]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getAllUsers({
        page: 1,
        limit: 1000, // Load all for client-side filtering
      });
      setAllUsers(response.data.data);
      setPagination({
        page: 1,
        limit: 20,
        total: response.data.total,
        totalPages: Math.ceil(response.data.total / 20),
      });
    } catch (err: any) {
      console.error('Error loading users:', err);
      showError(err?.response?.data?.message || 'Gagal memuat data users');
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async (id: number) => {
    if (!confirm('Yakin ingin mengaktifkan user ini?')) return;
    try {
      await adminApi.activateUser(id);
      success('User berhasil diaktifkan');
      loadUsers();
    } catch (err: any) {
      console.error('Error activating user:', err);
      showError(err?.response?.data?.message || 'Gagal mengaktifkan user');
    }
  };

  const handleDeactivate = async (id: number) => {
    if (!confirm('Yakin ingin menonaktifkan user ini?')) return;
    try {
      await adminApi.deactivateUser(id);
      success('User berhasil dinonaktifkan');
      loadUsers();
    } catch (err: any) {
      console.error('Error deactivating user:', err);
      showError(err?.response?.data?.message || 'Gagal menonaktifkan user');
    }
  };

  const handleSort = (key: string) => {
    let direction: SortDirection = 'asc';
    if (sortConfig?.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    } else if (sortConfig?.key === key && sortConfig.direction === 'desc') {
      direction = null;
    }
    setSortConfig(direction ? { key, direction } : null);
  };

  const getRoleLabel = (role: string) => {
    const roleLabels: Record<string, string> = {
      super_admin: 'Super Admin',
      admin_tenant: 'Admin Tenant',
      teacher: 'Guru',
      student: 'Siswa',
      staff: 'Staff',
    };
    return roleLabels[role] || role;
  };

  const getRoleColor = (role: string) => {
    const roleColors: Record<string, string> = {
      super_admin: 'bg-purple-100 text-purple-800',
      admin_tenant: 'bg-blue-100 text-blue-800',
      teacher: 'bg-green-100 text-green-800',
      student: 'bg-yellow-100 text-yellow-800',
      staff: 'bg-gray-100 text-gray-800',
    };
    return roleColors[role] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <AdminLayout>
        <Loading />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 min-h-screen">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Manajemen Users
          </h1>
          <p className="text-gray-600">Kelola semua pengguna yang terdaftar di sistem</p>
        </div>

        {/* Filters */}
        <div className="mb-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100 p-4">
          <div className="flex gap-4">
            <div className="flex-1 max-w-md">
              <SearchInput
                placeholder="Cari berdasarkan nama, email, telepon, atau tenant..."
                onSearch={setSearchQuery}
              />
            </div>
            <select
              value={selectedRole}
              onChange={(e) => {
                setSelectedRole(e.target.value);
                setPagination({ ...pagination, page: 1 });
              }}
              className="w-48 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
            >
              <option value="">Semua Role</option>
              <option value="super_admin">Super Admin</option>
              <option value="admin_tenant">Admin Tenant</option>
              <option value="teacher">Guru</option>
              <option value="student">Siswa</option>
              <option value="staff">Staff</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {users.length === 0 ? (
            <EmptyState
              title="Tidak ada user"
              description={
                searchQuery || selectedRole
                  ? `Tidak ada user yang sesuai dengan filter yang dipilih`
                  : 'Belum ada user yang terdaftar.'
              }
            />
          ) : (
            <>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-emerald-50 to-teal-50">
                  <tr>
                    <SortableTableHead
                      sortKey="name"
                      currentSort={sortConfig || undefined}
                      onSort={handleSort}
                    >
                      Nama
                    </SortableTableHead>
                    <SortableTableHead
                      sortKey="email"
                      currentSort={sortConfig || undefined}
                      onSort={handleSort}
                    >
                      Email
                    </SortableTableHead>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Telepon
                    </th>
                    <SortableTableHead
                      sortKey="role"
                      currentSort={sortConfig || undefined}
                      onSort={handleSort}
                    >
                      Role
                    </SortableTableHead>
                    <SortableTableHead
                      sortKey="tenant"
                      currentSort={sortConfig || undefined}
                      onSort={handleSort}
                    >
                      Tenant
                    </SortableTableHead>
                    <SortableTableHead
                      sortKey="isActive"
                      currentSort={sortConfig || undefined}
                      onSort={handleSort}
                    >
                      Status
                    </SortableTableHead>
                    <SortableTableHead
                      sortKey="lastLoginAt"
                      currentSort={sortConfig || undefined}
                      onSort={handleSort}
                    >
                      Login Terakhir
                    </SortableTableHead>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gradient-to-r hover:from-emerald-50/50 hover:to-teal-50/50 transition-all duration-200">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {user.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.phone || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full shadow-sm ${getRoleColor(
                            user.role,
                          )}`}
                        >
                          {getRoleLabel(user.role)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.tenant?.name || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full shadow-sm ${
                            user.isActive
                              ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                              : 'bg-gradient-to-r from-red-500 to-rose-500 text-white'
                          }`}
                        >
                          {user.isActive ? 'Aktif' : 'Tidak Aktif'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.lastLoginAt ? formatDateTime(user.lastLoginAt) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          {user.isActive ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeactivate(user.id)}
                            >
                              Nonaktifkan
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleActivate(user.id)}
                            >
                              Aktifkan
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100 p-4 flex justify-between items-center">
            <div className="text-sm text-gray-700 font-medium">
              Menampilkan <span className="font-bold text-emerald-600">{users.length}</span> dari <span className="font-bold text-teal-600">{pagination.total}</span> user
              {(searchQuery || selectedRole) && ` (dari ${allUsers.length} total)`}
            </div>
            <div className="flex gap-2 items-center">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page === 1}
                onClick={() =>
                  setPagination({ ...pagination, page: pagination.page - 1 })
                }
                className="disabled:opacity-50"
              >
                Sebelumnya
              </Button>
              <span className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg">
                Halaman {pagination.page} dari {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page === pagination.totalPages}
                onClick={() =>
                  setPagination({ ...pagination, page: pagination.page + 1 })
                }
                className="disabled:opacity-50"
              >
                Selanjutnya
              </Button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
