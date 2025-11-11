'use client';

import { useState } from 'react';
import TenantLayout from '@/components/layouts/TenantLayout';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { cafeteriaApi, Menu, MenuCreateData, Order, OrderCreateData } from '@/lib/api/cafeteria';
import { formatDate } from '@/lib/utils/date';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTenantId } from '@/lib/hooks/useTenant';

export default function CafeteriaPage() {
  const tenantId = useTenantId();
  const [activeTab, setActiveTab] = useState<'menus' | 'orders'>('menus');
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);
  const [menuFormData, setMenuFormData] = useState<MenuCreateData>({
    name: '',
    description: '',
    price: 0,
    category: '',
    image_url: '',
    status: 'available',
  });
  const [orderFormData, setOrderFormData] = useState<OrderCreateData>({
    student_id: undefined,
    items: [],
    payment_status: 'unpaid',
  });

  const queryClient = useQueryClient();

  const { data: menusData, isLoading: menusLoading } = useQuery({
    queryKey: ['cafeteria-menus', tenantId],
    queryFn: () => cafeteriaApi.getAllMenus(tenantId!),
    enabled: activeTab === 'menus' && !!tenantId,
  });

  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ['cafeteria-orders', tenantId],
    queryFn: () => cafeteriaApi.getAllOrders(tenantId!),
    enabled: activeTab === 'orders' && !!tenantId,
  });

  const createMenuMutation = useMutation({
    mutationFn: (data: MenuCreateData) => {
      if (!tenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return cafeteriaApi.createMenu(tenantId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cafeteria-menus', tenantId] });
      setIsMenuModalOpen(false);
      resetMenuForm();
    },
  });

  const updateMenuMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<MenuCreateData> }) => {
      if (!tenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return cafeteriaApi.updateMenu(tenantId, id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cafeteria-menus', tenantId] });
      setIsMenuModalOpen(false);
      setSelectedMenu(null);
      resetMenuForm();
    },
  });

  const deleteMenuMutation = useMutation({
    mutationFn: (id: number) => {
      if (!tenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return cafeteriaApi.deleteMenu(tenantId, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cafeteria-menus', tenantId] });
    },
  });

  const createOrderMutation = useMutation({
    mutationFn: (data: OrderCreateData) => {
      if (!tenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return cafeteriaApi.createOrder(tenantId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cafeteria-orders', tenantId] });
      setIsOrderModalOpen(false);
      resetOrderForm();
    },
  });

  const resetMenuForm = () => {
    setMenuFormData({
      name: '',
      description: '',
      price: 0,
      category: '',
      image_url: '',
      status: 'available',
    });
    setSelectedMenu(null);
  };

  const resetOrderForm = () => {
    setOrderFormData({
      student_id: undefined,
      items: [],
      payment_status: 'unpaid',
    });
  };

  const handleEditMenu = (menu: Menu) => {
    setSelectedMenu(menu);
    setMenuFormData({
      name: menu.name,
      description: menu.description || '',
      price: menu.price,
      category: menu.category || '',
      image_url: menu.image_url || '',
      status: menu.status || 'available',
    });
    setIsMenuModalOpen(true);
  };

  const totalMenus = menusData?.data?.length || 0;
  const availableMenus = menusData?.data?.filter((m) => m.status === 'available').length || 0;
  const totalOrders = ordersData?.data?.length || 0;
  const totalRevenue = ordersData?.data?.filter((o) => o.payment_status === 'paid').reduce((sum, o) => sum + o.total_amount, 0) || 0;

  return (
    <TenantLayout>
      <div className="p-6 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 min-h-screen">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Kafetaria
              </h1>
              <p className="text-gray-600">Manajemen menu dan pesanan kafetaria</p>
            </div>
            {activeTab === 'menus' ? (
              <Button
                onClick={() => {
                  resetMenuForm();
                  setIsMenuModalOpen(true);
                }}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Tambah Menu
              </Button>
            ) : (
              <Button
                onClick={() => {
                  resetOrderForm();
                  setIsOrderModalOpen(true);
                }}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Buat Pesanan
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Menu</p>
                <p className="text-3xl font-bold text-blue-600">{totalMenus}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Menu Tersedia</p>
                <p className="text-3xl font-bold text-green-600">{availableMenus}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Pesanan</p>
                <p className="text-3xl font-bold text-purple-600">{totalOrders}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Pendapatan</p>
                <p className="text-3xl font-bold text-green-600">Rp {totalRevenue.toLocaleString('id-ID')}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('menus')}
              className={`flex-1 px-6 py-4 text-center font-semibold transition-all duration-200 ${
                activeTab === 'menus'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white border-b-2 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Menu
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex-1 px-6 py-4 text-center font-semibold transition-all duration-200 ${
                activeTab === 'orders'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white border-b-2 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Pesanan
            </button>
          </div>
        </div>

        {activeTab === 'menus' ? (
          <>
            {menusLoading ? (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-600">Memuat data...</p>
              </div>
            ) : (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gradient-to-r from-blue-50 to-purple-50">
                        <TableHead className="font-semibold text-gray-700">Nama Menu</TableHead>
                        <TableHead className="font-semibold text-gray-700">Kategori</TableHead>
                        <TableHead className="font-semibold text-gray-700">Harga</TableHead>
                        <TableHead className="font-semibold text-gray-700">Status</TableHead>
                        <TableHead className="font-semibold text-gray-700">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {menusData?.data?.map((menu) => (
                        <TableRow key={menu.id} className="hover:bg-blue-50/50 transition-colors">
                          <TableCell className="font-medium text-gray-800">{menu.name}</TableCell>
                          <TableCell>{menu.category || '-'}</TableCell>
                          <TableCell>Rp {menu.price.toLocaleString('id-ID')}</TableCell>
                          <TableCell>
                            <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                              menu.status === 'available' 
                                ? 'bg-green-500 text-white' 
                                : 'bg-gray-500 text-white'
                            }`}>
                              {menu.status === 'available' ? 'Tersedia' : 'Tidak Tersedia'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditMenu(menu)}
                                className="hover:bg-blue-50 hover:border-blue-300 transition-colors"
                              >
                                Edit
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => {
                                  if (confirm('Apakah Anda yakin ingin menghapus menu ini?')) {
                                    deleteMenuMutation.mutate(menu.id);
                                  }
                                }}
                                className="hover:bg-red-600 transition-colors"
                              >
                                Hapus
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {menusData?.data?.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-12">
                            <div className="flex flex-col items-center">
                              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                              </div>
                              <p className="text-gray-500 font-medium">Belum ada menu</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            <Modal
              isOpen={isMenuModalOpen}
              onClose={() => {
                setIsMenuModalOpen(false);
                resetMenuForm();
              }}
              title={selectedMenu ? 'Edit Menu' : 'Tambah Menu'}
              size="md"
            >
              <form onSubmit={(e) => {
                e.preventDefault();
                if (!tenantId) {
                  alert('Tenant belum siap. Silakan tunggu beberapa saat dan coba lagi.');
                  return;
                }
                if (selectedMenu) {
                  updateMenuMutation.mutate({ id: selectedMenu.id, data: menuFormData });
                } else {
                  createMenuMutation.mutate(menuFormData);
                }
              }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Menu <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={menuFormData.name}
                    onChange={(e) => setMenuFormData({ ...menuFormData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                  <textarea
                    value={menuFormData.description}
                    onChange={(e) => setMenuFormData({ ...menuFormData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Harga <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={menuFormData.price}
                      onChange={(e) => setMenuFormData({ ...menuFormData, price: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                    <input
                      type="text"
                      value={menuFormData.category}
                      onChange={(e) => setMenuFormData({ ...menuFormData, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={menuFormData.status}
                      onChange={(e) => setMenuFormData({ ...menuFormData, status: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="available">Tersedia</option>
                      <option value="unavailable">Tidak Tersedia</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setIsMenuModalOpen(false);
                      resetMenuForm();
                    }}
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    loading={createMenuMutation.isPending || updateMenuMutation.isPending}
                  >
                    {selectedMenu ? 'Update' : 'Simpan'}
                  </Button>
                </div>
              </form>
            </Modal>
          </>
        ) : (
          <>
            {ordersLoading ? (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-600">Memuat data...</p>
              </div>
            ) : (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gradient-to-r from-blue-50 to-purple-50">
                        <TableHead className="font-semibold text-gray-700">No. Pesanan</TableHead>
                        <TableHead className="font-semibold text-gray-700">Siswa</TableHead>
                        <TableHead className="font-semibold text-gray-700">Total</TableHead>
                        <TableHead className="font-semibold text-gray-700">Status</TableHead>
                        <TableHead className="font-semibold text-gray-700">Pembayaran</TableHead>
                        <TableHead className="font-semibold text-gray-700">Tanggal</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ordersData?.data?.map((order) => (
                        <TableRow key={order.id} className="hover:bg-blue-50/50 transition-colors">
                          <TableCell className="font-medium text-gray-800">{order.order_number || `#${order.id}`}</TableCell>
                          <TableCell>{order.student_name || '-'}</TableCell>
                          <TableCell>Rp {order.total_amount.toLocaleString('id-ID')}</TableCell>
                          <TableCell>
                            <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                              order.status === 'completed' 
                                ? 'bg-green-500 text-white' 
                                : order.status === 'processing'
                                ? 'bg-yellow-500 text-white'
                                : order.status === 'cancelled'
                                ? 'bg-red-500 text-white'
                                : 'bg-gray-500 text-white'
                            }`}>
                              {order.status === 'pending' ? 'Menunggu' :
                               order.status === 'processing' ? 'Diproses' :
                               order.status === 'completed' ? 'Selesai' :
                               order.status === 'cancelled' ? 'Dibatalkan' : '-'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                              order.payment_status === 'paid' 
                                ? 'bg-green-500 text-white' 
                                : 'bg-yellow-500 text-white'
                            }`}>
                              {order.payment_status === 'paid' ? 'Lunas' : 'Belum Lunas'}
                            </span>
                          </TableCell>
                          <TableCell>{formatDate(order.order_date || order.created_at)}</TableCell>
                        </TableRow>
                      ))}
                      {ordersData?.data?.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-12">
                            <div className="flex flex-col items-center">
                              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                              </div>
                              <p className="text-gray-500 font-medium">Belum ada pesanan</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </TenantLayout>
  );
}
