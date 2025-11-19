'use client';

import { useEffect, useMemo, useState } from 'react';
import TenantLayout from '@/components/layouts/TenantLayout';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Switch } from '@/components/ui/Switch';
import {
  cafeteriaApi,
  CafeteriaMenu,
  CafeteriaMenuPayload,
  CafeteriaOrder,
  CafeteriaOutlet,
  MenuCategory,
  OrderStatus,
  PaymentStatus,
} from '@/lib/api/cafeteria';
import { formatDate } from '@/lib/utils/date';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTenantId } from '@/lib/hooks/useTenant';
import { useToastStore } from '@/lib/store/toast';
import { cn } from '@/lib/utils/cn';

const currency = (value?: number | string) => {
  let numericValue =
    typeof value === 'string' ? Number(value) : value ?? 0;
  if (!Number.isFinite(numericValue)) {
    numericValue = 0;
  }
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(numericValue);
};

const categoryLabels: Record<MenuCategory, string> = {
  food: 'Makanan',
  drink: 'Minuman',
  snack: 'Snack',
};

const orderStatusLabels: Record<OrderStatus, string> = {
  pending: 'Menunggu',
  preparing: 'Disiapkan',
  ready: 'Siap',
  completed: 'Selesai',
  cancelled: 'Dibatalkan',
};

const paymentLabels: Record<PaymentStatus, string> = {
  unpaid: 'Belum Lunas',
  paid: 'Lunas',
  refunded: 'Dikembalikan',
};

const paymentMethodOptions = [
  { value: 'cash', label: 'Tunai' },
  { value: 'card', label: 'Kartu' },
  { value: 'transfer', label: 'Transfer' },
  { value: 'qris', label: 'QRIS' },
] as const;

type MenuFilterState = {
  canteenId: 'all' | number;
  category: 'all' | MenuCategory;
  availability: 'all' | 'available' | 'unavailable';
  search: string;
};

type OrderFilterState = {
  canteenId: 'all' | number;
  status: 'all' | OrderStatus;
  paymentStatus: 'all' | PaymentStatus;
  startDate: string;
  endDate: string;
};

type OrderFormItem = {
  menuId?: number;
  quantity: number;
};

export default function CafeteriaPage() {
  const tenantId = useTenantId();
  const queryClient = useQueryClient();
  const { success: showSuccess, error: showError } = useToastStore();

  const [activeTab, setActiveTab] =
    useState<'overview' | 'canteens' | 'menus' | 'orders'>('overview');

  const [isCanteenModalOpen, setIsCanteenModalOpen] = useState(false);
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const [editingCanteen, setEditingCanteen] = useState<CafeteriaOutlet | null>(
    null,
  );
  const [editingMenu, setEditingMenu] = useState<CafeteriaMenu | null>(null);
  const [selectedPaymentOrder, setSelectedPaymentOrder] =
    useState<CafeteriaOrder | null>(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState<number | null>(null);

  const [canteenForm, setCanteenForm] = useState({
    name: '',
    description: '',
    location: '',
    contactPerson: '',
    contactPhone: '',
    openingHours: '',
    isActive: true,
  });

  const [menuForm, setMenuForm] = useState<CafeteriaMenuPayload>({
    canteenId: 0,
    name: '',
    description: '',
    category: 'food',
    price: 0,
    stock: undefined,
    isAvailable: true,
    image: '',
  });

  const [orderForm, setOrderForm] = useState<{
    canteenId?: number;
    studentId?: number;
    notes?: string;
    menuItems: OrderFormItem[];
  }>({
    canteenId: undefined,
    studentId: undefined,
    notes: '',
    menuItems: [{ menuId: undefined, quantity: 1 }],
  });

  const [menuFilters, setMenuFilters] = useState<MenuFilterState>({
    canteenId: 'all',
    category: 'all',
    availability: 'all',
    search: '',
  });

  const [orderFilters, setOrderFilters] = useState<OrderFilterState>({
    canteenId: 'all',
    status: 'all',
    paymentStatus: 'all',
    startDate: '',
    endDate: '',
  });

  const [paymentForm, setPaymentForm] = useState({
    paymentMethod: 'cash' as 'cash' | 'card' | 'transfer' | 'qris',
    paymentAmount: 0,
    paymentReference: '',
    notes: '',
  });

  const getErrorMessage = (error: any) =>
    error?.response?.data?.message || error?.message || 'Terjadi kesalahan';

  const { data: canteensData, isLoading: canteensLoading } = useQuery({
    queryKey: ['cafeteria-canteens', tenantId],
    queryFn: () => cafeteriaApi.getCanteens(tenantId!),
    enabled: !!tenantId,
  });
  const canteens = canteensData ?? [];
  const canteenMap = useMemo(() => {
    const map = new Map<number, CafeteriaOutlet>();
    canteens.forEach((item) => map.set(item.id, item));
    return map;
  }, [canteens]);

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['cafeteria-stats', tenantId],
    queryFn: () => cafeteriaApi.getStatistics(tenantId!),
    enabled: !!tenantId,
  });

  const { data: menusResponse, isLoading: menusLoading } = useQuery({
    queryKey: ['cafeteria-menus', tenantId, menuFilters],
    queryFn: () =>
      cafeteriaApi.getMenus(tenantId!, {
        canteenId:
          menuFilters.canteenId === 'all' ? undefined : menuFilters.canteenId,
        category:
          menuFilters.category === 'all' ? undefined : menuFilters.category,
        isAvailable:
          menuFilters.availability === 'all'
            ? undefined
            : menuFilters.availability === 'available',
        search: menuFilters.search || undefined,
        limit: 200,
      }),
    enabled: !!tenantId && activeTab === 'menus',
  });
  const menus = menusResponse?.data ?? [];

  const { data: menuOptionsResponse } = useQuery({
    queryKey: ['cafeteria-menu-options', tenantId],
    queryFn: () =>
      cafeteriaApi.getMenus(tenantId!, {
        limit: 500,
      }),
    enabled: !!tenantId,
    staleTime: 60_000,
  });
  const allMenus = menuOptionsResponse?.data ?? [];

  const { data: ordersResponse, isLoading: ordersLoading } = useQuery({
    queryKey: ['cafeteria-orders', tenantId, orderFilters],
    queryFn: () =>
      cafeteriaApi.getOrders(tenantId!, {
        canteenId:
          orderFilters.canteenId === 'all'
            ? undefined
            : orderFilters.canteenId,
        status:
          orderFilters.status === 'all' ? undefined : orderFilters.status,
        paymentStatus:
          orderFilters.paymentStatus === 'all'
            ? undefined
            : orderFilters.paymentStatus,
        startDate: orderFilters.startDate || undefined,
        endDate: orderFilters.endDate || undefined,
        limit: 200,
      }),
    enabled: !!tenantId && activeTab === 'orders',
  });
  const orders = ordersResponse?.data ?? [];

  const summary = useMemo(() => {
    if (!statsData) {
      return {
        totalCanteens: canteens.length,
        totalMenus: menusResponse?.total ?? 0,
        availableMenus: menus.filter((menu) => menu.isAvailable).length,
        totalOrders: ordersResponse?.total ?? 0,
        todayOrders: 0,
      };
    }
    return statsData.perCanteen.reduce(
      (acc, item) => {
        acc.totalMenus += item.menu.total;
        acc.availableMenus += item.menu.available;
        acc.totalOrders += item.orders.total;
        acc.todayOrders += item.orders.today;
        return acc;
      },
      {
        totalCanteens: statsData.totalCanteens,
        totalMenus: 0,
        availableMenus: 0,
        totalOrders: 0,
        todayOrders: 0,
      },
    );
  }, [statsData, canteens.length, menusResponse, menus, ordersResponse]);

  useEffect(() => {
    if (canteens.length) {
      setMenuForm((prev) =>
        prev.canteenId ? prev : { ...prev, canteenId: canteens[0].id },
      );
      setOrderForm((prev) =>
        prev.canteenId ? prev : { ...prev, canteenId: canteens[0].id },
      );
    }
  }, [canteens]);

  const invalidateAll = () => {
    if (!tenantId) return;
    queryClient.invalidateQueries({ queryKey: ['cafeteria-canteens', tenantId] });
    queryClient.invalidateQueries({ queryKey: ['cafeteria-menus', tenantId] });
    queryClient.invalidateQueries({
      queryKey: ['cafeteria-menu-options', tenantId],
    });
    queryClient.invalidateQueries({ queryKey: ['cafeteria-orders', tenantId] });
    queryClient.invalidateQueries({ queryKey: ['cafeteria-stats', tenantId] });
  };

  const createCanteenMutation = useMutation({
    mutationFn: (payload: typeof canteenForm) =>
      cafeteriaApi.createCanteen(tenantId!, payload),
    onSuccess: () => {
      invalidateAll();
      showSuccess('Kantin berhasil ditambahkan');
      closeCanteenModal();
    },
    onError: (error) => showError(getErrorMessage(error)),
  });

  const updateCanteenMutation = useMutation({
    mutationFn: (payload: typeof canteenForm) =>
      cafeteriaApi.updateCanteen(tenantId!, editingCanteen!.id, payload),
    onSuccess: () => {
      invalidateAll();
      showSuccess('Kantin berhasil diperbarui');
      closeCanteenModal();
    },
    onError: (error) => showError(getErrorMessage(error)),
  });

  const deleteCanteenMutation = useMutation({
    mutationFn: (id: number) => cafeteriaApi.deleteCanteen(tenantId!, id),
    onSuccess: () => {
      invalidateAll();
      showSuccess('Kantin berhasil dihapus');
    },
    onError: (error) => showError(getErrorMessage(error)),
  });

  const createMenuMutation = useMutation({
    mutationFn: (payload: CafeteriaMenuPayload) =>
      cafeteriaApi.createMenu(tenantId!, payload),
    onSuccess: () => {
      invalidateAll();
      showSuccess('Menu berhasil ditambahkan');
      closeMenuModal();
    },
    onError: (error) => showError(getErrorMessage(error)),
  });

  const updateMenuMutation = useMutation({
    mutationFn: (payload: Partial<CafeteriaMenuPayload>) =>
      cafeteriaApi.updateMenu(tenantId!, editingMenu!.id, payload),
    onSuccess: () => {
      invalidateAll();
      showSuccess('Menu berhasil diperbarui');
      closeMenuModal();
    },
    onError: (error) => showError(getErrorMessage(error)),
  });

  const deleteMenuMutation = useMutation({
    mutationFn: (id: number) => cafeteriaApi.deleteMenu(tenantId!, id),
    onSuccess: () => {
      invalidateAll();
      showSuccess('Menu berhasil dihapus');
    },
    onError: (error) => showError(getErrorMessage(error)),
  });

  const createOrderMutation = useMutation({
    mutationFn: (payload: {
      canteenId: number;
      studentId: number;
      menuItems: { id: number; quantity: number }[];
      notes?: string;
    }) => cafeteriaApi.createOrder(tenantId!, payload),
    onSuccess: () => {
      invalidateAll();
      showSuccess('Pesanan berhasil dibuat');
      closeOrderModal();
    },
    onError: (error) => showError(getErrorMessage(error)),
  });

  const updateOrderStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: OrderStatus }) =>
      cafeteriaApi.updateOrderStatus(tenantId!, id, status),
    onMutate: ({ id }) => setStatusUpdatingId(id),
    onSuccess: () => {
      invalidateAll();
      showSuccess('Status pesanan diperbarui');
    },
    onError: (error) => showError(getErrorMessage(error)),
    onSettled: () => setStatusUpdatingId(null),
  });

  const processPaymentMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: {
        paymentMethod: 'cash' | 'card' | 'transfer' | 'qris';
        paymentAmount: number;
        paymentReference?: string;
        notes?: string;
      };
    }) => cafeteriaApi.processPayment(tenantId!, id, payload),
    onSuccess: () => {
      invalidateAll();
      showSuccess('Pembayaran berhasil diproses');
      closePaymentModal();
    },
    onError: (error) => showError(getErrorMessage(error)),
  });

  const openCanteenModal = (canteen?: CafeteriaOutlet) => {
    if (canteen) {
      setEditingCanteen(canteen);
      setCanteenForm({
        name: canteen.name,
        description: canteen.description ?? '',
        location: canteen.location ?? '',
        contactPerson: canteen.contactPerson ?? '',
        contactPhone: canteen.contactPhone ?? '',
        openingHours: canteen.openingHours ?? '',
        isActive: canteen.isActive,
      });
    } else {
      setEditingCanteen(null);
      setCanteenForm({
        name: '',
        description: '',
        location: '',
        contactPerson: '',
        contactPhone: '',
        openingHours: '',
        isActive: true,
      });
    }
    setIsCanteenModalOpen(true);
  };

  const closeCanteenModal = () => {
    setIsCanteenModalOpen(false);
    setEditingCanteen(null);
  };

  const openMenuModal = (menu?: CafeteriaMenu) => {
    if (menu) {
      setEditingMenu(menu);
      setMenuForm({
        canteenId: menu.canteenId,
        name: menu.name,
        description: menu.description ?? '',
        category: menu.category,
        price: Number(menu.price),
        stock: menu.stock ?? undefined,
        isAvailable: menu.isAvailable,
        image: menu.image ?? '',
      });
    } else {
      setEditingMenu(null);
      setMenuForm((prev) => ({
        canteenId: prev.canteenId || canteens[0]?.id || 0,
        name: '',
        description: '',
        category: 'food',
        price: 0,
        stock: undefined,
        isAvailable: true,
        image: '',
      }));
    }
    setIsMenuModalOpen(true);
  };

  const closeMenuModal = () => {
    setIsMenuModalOpen(false);
    setEditingMenu(null);
  };

  const openOrderModal = () => {
    setOrderForm({
      canteenId: orderForm.canteenId ?? canteens[0]?.id,
      studentId: undefined,
      notes: '',
      menuItems: [{ menuId: undefined, quantity: 1 }],
    });
    setIsOrderModalOpen(true);
  };

  const closeOrderModal = () => {
    setIsOrderModalOpen(false);
    setOrderForm({
      canteenId: canteens[0]?.id,
      studentId: undefined,
      notes: '',
      menuItems: [{ menuId: undefined, quantity: 1 }],
    });
  };

  const openPaymentModal = (order: CafeteriaOrder) => {
    setSelectedPaymentOrder(order);
    setPaymentForm({
      paymentMethod: 'cash',
      paymentAmount: Number(order.totalAmount),
      paymentReference: '',
      notes: '',
    });
    setIsPaymentModalOpen(true);
  };

  const closePaymentModal = () => {
    setIsPaymentModalOpen(false);
    setSelectedPaymentOrder(null);
    setPaymentForm({
      paymentMethod: 'cash',
      paymentAmount: 0,
      paymentReference: '',
      notes: '',
    });
  };

  const handleSubmitCanteen = (event: React.FormEvent) => {
    event.preventDefault();
    if (!tenantId) return;
    const payload = {
      ...canteenForm,
      description: canteenForm.description || undefined,
      location: canteenForm.location || undefined,
      contactPerson: canteenForm.contactPerson || undefined,
      contactPhone: canteenForm.contactPhone || undefined,
      openingHours: canteenForm.openingHours || undefined,
    };
    if (editingCanteen) {
      updateCanteenMutation.mutate(payload);
    } else {
      createCanteenMutation.mutate(payload);
    }
  };

  const handleSubmitMenu = (event: React.FormEvent) => {
    event.preventDefault();
    if (!tenantId) return;
    if (!menuForm.canteenId) {
      showError('Pilih kantin terlebih dahulu');
      return;
    }
    const payload: CafeteriaMenuPayload = {
      ...menuForm,
      description: menuForm.description || undefined,
      image: menuForm.image || undefined,
      stock: menuForm.stock === undefined || menuForm.stock === null ? undefined : menuForm.stock,
    };
    if (editingMenu) {
      updateMenuMutation.mutate(payload);
    } else {
      createMenuMutation.mutate(payload);
    }
  };

  const handleSubmitOrder = (event: React.FormEvent) => {
    event.preventDefault();
    if (!tenantId || !orderForm.canteenId || !orderForm.studentId) {
      showError('Lengkapi data pemesanan');
      return;
    }

    const items = orderForm.menuItems
      .filter((item) => item.menuId && item.quantity > 0)
      .map((item) => ({
        id: item.menuId!,
        quantity: item.quantity,
      }));

    if (!items.length) {
      showError('Tambahkan minimal satu menu');
      return;
    }

    createOrderMutation.mutate({
      canteenId: orderForm.canteenId,
      studentId: orderForm.studentId,
      menuItems: items,
      notes: orderForm.notes || undefined,
    });
  };

  const handleSubmitPayment = (event: React.FormEvent) => {
    event.preventDefault();
    if (!tenantId || !selectedPaymentOrder) return;

    if (
      paymentForm.paymentAmount <
      Number(selectedPaymentOrder.totalAmount)
    ) {
      showError('Nominal pembayaran kurang dari total pesanan');
      return;
    }

    processPaymentMutation.mutate({
      id: selectedPaymentOrder.id,
      payload: {
        paymentMethod: paymentForm.paymentMethod,
        paymentAmount: paymentForm.paymentAmount,
        paymentReference: paymentForm.paymentReference || undefined,
        notes: paymentForm.notes || undefined,
      },
    });
  };

  const availableOrderMenus = orderForm.canteenId
    ? allMenus.filter((menu) => menu.canteenId === orderForm.canteenId)
    : [];

  const orderItemsSummary = (order: CafeteriaOrder) =>
    order.orderItems
      .map((item) => item.menu?.name ?? `Menu #${item.menuId}`)
      .join(', ');

  const handleExportOrders = (records: CafeteriaOrder[]) => {
    if (!records.length) {
      showError('Tidak ada data pesanan untuk diekspor');
      return;
    }

    const headers = [
      'ID',
      'Kantin',
      'Siswa',
      'Menu',
      'Total',
      'Status',
      'Pembayaran',
      'Tanggal',
    ];

    const rows = records.map((order) => [
      order.id,
      order.canteen?.name || canteenMap.get(order.canteenId)?.name || '-',
      order.student?.name || '-',
      orderItemsSummary(order),
      Number(order.totalAmount),
      orderStatusLabels[order.status],
      paymentLabels[order.paymentStatus],
      formatDate(order.createdAt),
    ]);

    const csvContent = [headers, ...rows]
      .map((row) =>
        row
          .map((value) =>
            `"${String(value ?? '')
              .replace(/"/g, '""')
              .trim()}"`,
          )
          .join(','),
      )
      .join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `laporan-pesanan-kantin-${new Date()
      .toISOString()
      .split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showSuccess('Laporan pesanan berhasil diekspor');
  };

  const renderPrimaryAction = () => {
    if (activeTab === 'canteens') {
      return (
        <Button onClick={() => openCanteenModal()}>
          + Tambah Kantin
        </Button>
      );
    }

    if (activeTab === 'menus') {
      return (
        <Button
          onClick={() => openMenuModal()}
          disabled={!canteens.length}
        >
          + Tambah Menu
        </Button>
      );
    }

    if (activeTab === 'orders') {
      return (
        <Button
          onClick={openOrderModal}
          disabled={!canteens.length || !allMenus.length}
        >
          + Buat Pesanan
        </Button>
      );
    }
    return null;
  };

  return (
    <TenantLayout>
      <div className="p-6 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 min-h-screen space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Modul Kantin</h1>
            <p className="text-gray-600">
              Kelola outlet, menu, dan pesanan kantin sekolah
            </p>
          </div>
          {renderPrimaryAction()}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <SummaryCard
            label="Total Kantin"
            value={summary.totalCanteens}
            icon="🏬"
          />
          <SummaryCard
            label="Total Menu"
            value={summary.totalMenus}
            icon="🍱"
          />
          <SummaryCard
            label="Menu Tersedia"
            value={summary.availableMenus}
            icon="✅"
          />
          <SummaryCard
            label="Pesanan Hari Ini"
            value={summary.todayOrders}
            icon="🛒"
          />
        </div>

        <div className="bg-white rounded-2xl shadow border border-gray-100">
          <div className="flex flex-wrap">
            {[
              { key: 'overview', label: 'Ringkasan' },
              { key: 'canteens', label: 'Kantin' },
              { key: 'menus', label: 'Menu' },
              { key: 'orders', label: 'Pesanan' },
            ].map((tab) => (
              <button
                key={tab.key}
                className={cn(
                  'flex-1 px-6 py-4 text-sm font-semibold transition-colors',
                  activeTab === tab.key
                    ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/60'
                    : 'text-gray-600 hover:bg-gray-50',
                )}
                onClick={() =>
                  setActiveTab(tab.key as typeof activeTab)
                }
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'overview' && (
          <div className="bg-white rounded-2xl shadow border border-gray-100 p-6">
            {statsLoading ? (
              <LoadingState message="Memuat ringkasan kantin..." />
            ) : statsData && statsData.perCanteen.length ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama Kantin</TableHead>
                      <TableHead>Menu</TableHead>
                      <TableHead>Menu Tersedia</TableHead>
                      <TableHead>Total Pesanan</TableHead>
                      <TableHead>Pesanan Hari Ini</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {statsData.perCanteen.map((item) => (
                      <TableRow key={item.canteen.id}>
                        <TableCell className="font-semibold">
                          {item.canteen.name}
                        </TableCell>
                        <TableCell>{item.menu.total}</TableCell>
                        <TableCell>{item.menu.available}</TableCell>
                        <TableCell>{item.orders.total}</TableCell>
                        <TableCell>{item.orders.today}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <EmptyState message="Belum ada data kantin." />
            )}
          </div>
        )}

        {activeTab === 'canteens' && (
          <div className="bg-white rounded-2xl shadow border border-gray-100 p-6">
            {canteensLoading ? (
              <LoadingState message="Memuat daftar kantin..." />
            ) : canteens.length ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama</TableHead>
                      <TableHead>Lokasi</TableHead>
                      <TableHead>Kontak</TableHead>
                      <TableHead>Jam Operasional</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {canteens.map((canteen) => (
                      <TableRow key={canteen.id}>
                        <TableCell className="font-semibold">
                          {canteen.name}
                        </TableCell>
                        <TableCell>{canteen.location || '-'}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {canteen.contactPerson && (
                              <div className="text-sm font-medium">
                                {canteen.contactPerson}
                              </div>
                            )}
                            <div className="text-xs text-gray-500">
                              {canteen.contactPhone || '-'}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{canteen.openingHours || '-'}</TableCell>
                        <TableCell>
                          <span
                            className={cn('px-3 py-1 rounded-full text-xs font-semibold', {
                              'bg-green-100 text-green-700': canteen.isActive,
                              'bg-gray-100 text-gray-600': !canteen.isActive,
                            })}
                          >
                            {canteen.isActive ? 'Aktif' : 'Nonaktif'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openCanteenModal(canteen)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => {
                                if (
                                  confirm(
                                    'Hapus kantin ini? Pastikan tidak ada menu aktif.',
                                  )
                                ) {
                                  deleteCanteenMutation.mutate(canteen.id);
                                }
                              }}
                            >
                              Hapus
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <EmptyState message="Belum ada kantin" />
            )}
          </div>
        )}

        {activeTab === 'menus' && (
          <div className="bg-white rounded-2xl shadow border border-gray-100 p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Select
                label="Kantin"
                value={
                  menuFilters.canteenId === 'all'
                    ? ''
                    : String(menuFilters.canteenId)
                }
                placeholder="Semua kantin"
                onChange={(event) =>
                  setMenuFilters((prev) => ({
                    ...prev,
                    canteenId: event.target.value
                      ? Number(event.target.value)
                      : 'all',
                  }))
                }
                options={[
                  { value: '', label: 'Semua kantin' },
                  ...canteens.map((canteen) => ({
                    value: String(canteen.id),
                    label: canteen.name,
                  })),
                ]}
              />
              <Select
                label="Kategori"
                value={menuFilters.category === 'all' ? '' : menuFilters.category}
                placeholder="Semua kategori"
                onChange={(event) =>
                  setMenuFilters((prev) => ({
                    ...prev,
                    category: (event.target.value as MenuCategory) || 'all',
                  }))
                }
                options={[
                  { value: '', label: 'Semua kategori' },
                  ...Object.entries(categoryLabels).map(([value, label]) => ({
                    value,
                    label,
                  })),
                ]}
              />
              <Select
                label="Ketersediaan"
                value={
                  menuFilters.availability === 'all'
                    ? ''
                    : menuFilters.availability
                }
                placeholder="Semua status"
                onChange={(event) =>
                  setMenuFilters((prev) => ({
                    ...prev,
                    availability: (event.target.value as typeof prev.availability) || 'all',
                  }))
                }
                options={[
                  { value: '', label: 'Semua status' },
                  { value: 'available', label: 'Tersedia' },
                  { value: 'unavailable', label: 'Tidak tersedia' },
                ]}
              />
              <Input
                label="Cari"
                placeholder="Cari nama menu..."
                value={menuFilters.search}
                onChange={(event) =>
                  setMenuFilters((prev) => ({
                    ...prev,
                    search: event.target.value,
                  }))
                }
              />
            </div>

            {menusLoading ? (
              <LoadingState message="Memuat menu..." />
            ) : menus.length ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Menu</TableHead>
                      <TableHead>Kantin</TableHead>
                      <TableHead>Kategori</TableHead>
                      <TableHead>Harga</TableHead>
                      <TableHead>Stok</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {menus.map((menu) => (
                      <TableRow key={menu.id}>
                        <TableCell className="font-semibold">
                          {menu.name}
                        </TableCell>
                        <TableCell>
                          {canteenMap.get(menu.canteenId)?.name || '-'}
                        </TableCell>
                        <TableCell>{categoryLabels[menu.category]}</TableCell>
                        <TableCell>{currency(Number(menu.price))}</TableCell>
                        <TableCell>
                          {menu.stock === null || menu.stock === undefined
                            ? '—'
                            : menu.stock}
                        </TableCell>
                        <TableCell>
                          <span
                            className={cn(
                              'px-3 py-1 rounded-full text-xs font-semibold',
                              menu.isAvailable
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-200 text-gray-700',
                            )}
                          >
                            {menu.isAvailable ? 'Tersedia' : 'Habis'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openMenuModal(menu)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => {
                                if (confirm('Hapus menu ini?')) {
                                  deleteMenuMutation.mutate(menu.id);
                                }
                              }}
                            >
                              Hapus
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <EmptyState message="Belum ada menu." />
            )}
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="bg-white rounded-2xl shadow border border-gray-100 p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <Select
                label="Kantin"
                placeholder="Semua kantin"
                value={
                  orderFilters.canteenId === 'all'
                    ? ''
                    : String(orderFilters.canteenId)
                }
                onChange={(event) =>
                  setOrderFilters((prev) => ({
                    ...prev,
                    canteenId: event.target.value
                      ? Number(event.target.value)
                      : 'all',
                  }))
                }
                options={[
                  { value: '', label: 'Semua kantin' },
                  ...canteens.map((canteen) => ({
                    value: String(canteen.id),
                    label: canteen.name,
                  })),
                ]}
              />
              <Select
                label="Status Pesanan"
                placeholder="Semua status"
                value={orderFilters.status === 'all' ? '' : orderFilters.status}
                onChange={(event) =>
                  setOrderFilters((prev) => ({
                    ...prev,
                    status: (event.target.value as OrderStatus) || 'all',
                  }))
                }
                options={[
                  { value: '', label: 'Semua status' },
                  ...Object.entries(orderStatusLabels).map(
                    ([value, label]) => ({
                      value,
                      label,
                    }),
                  ),
                ]}
              />
              <Select
                label="Status Pembayaran"
                placeholder="Semua status"
                value={
                  orderFilters.paymentStatus === 'all'
                    ? ''
                    : orderFilters.paymentStatus
                }
                onChange={(event) =>
                  setOrderFilters((prev) => ({
                    ...prev,
                    paymentStatus:
                      (event.target.value as PaymentStatus) || 'all',
                  }))
                }
                options={[
                  { value: '', label: 'Semua pembayaran' },
                  ...Object.entries(paymentLabels).map(([value, label]) => ({
                    value,
                    label,
                  })),
                ]}
              />
              <Input
                type="date"
                label="Tanggal Mulai"
                value={orderFilters.startDate}
                onChange={(event) =>
                  setOrderFilters((prev) => ({
                    ...prev,
                    startDate: event.target.value,
                  }))
                }
              />
              <Input
                type="date"
                label="Tanggal Selesai"
                value={orderFilters.endDate}
                onChange={(event) =>
                  setOrderFilters((prev) => ({
                    ...prev,
                    endDate: event.target.value,
                  }))
                }
              />
            </div>
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={() => handleExportOrders(orders)}
                disabled={!orders.length}
              >
                Ekspor CSV
              </Button>
            </div>

            {ordersLoading ? (
              <LoadingState message="Memuat pesanan..." />
            ) : orders.length ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Pesanan</TableHead>
                      <TableHead>Kantin</TableHead>
                      <TableHead>Siswa</TableHead>
                      <TableHead>Menu</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Pembayaran</TableHead>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-semibold">
                          #{order.id}
                        </TableCell>
                        <TableCell>
                          {order.canteen?.name ||
                            canteenMap.get(order.canteenId)?.name ||
                            '-'}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-medium">
                            {order.student?.name || '-'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {order.student?.studentNumber || ''}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {orderItemsSummary(order)}
                        </TableCell>
                        <TableCell>{currency(order.totalAmount)}</TableCell>
                        <TableCell>
                          <span
                            className={cn(
                              'px-3 py-1 rounded-full text-xs font-semibold capitalize',
                              {
                                'bg-yellow-100 text-yellow-700':
                                  order.status === 'pending' ||
                                  order.status === 'preparing',
                                'bg-indigo-100 text-indigo-700':
                                  order.status === 'ready',
                                'bg-green-100 text-green-700':
                                  order.status === 'completed',
                                'bg-red-100 text-red-700':
                                  order.status === 'cancelled',
                              },
                            )}
                          >
                            {orderStatusLabels[order.status]}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span
                            className={cn(
                              'px-3 py-1 rounded-full text-xs font-semibold',
                              {
                                'bg-green-100 text-green-700':
                                  order.paymentStatus === 'paid',
                                'bg-yellow-100 text-yellow-700':
                                  order.paymentStatus === 'unpaid',
                                'bg-purple-100 text-purple-700':
                                  order.paymentStatus === 'refunded',
                              },
                            )}
                          >
                            {paymentLabels[order.paymentStatus]}
                          </span>
                        </TableCell>
                        <TableCell>{formatDate(order.createdAt)}</TableCell>
                        <TableCell>
                          <div className="space-y-2">
                            <Select
                              value={order.status}
                              onChange={(event) =>
                                updateOrderStatusMutation.mutate({
                                  id: order.id,
                                  status: event.target.value as OrderStatus,
                                })
                              }
                              disabled={
                                updateOrderStatusMutation.isPending &&
                                statusUpdatingId === order.id
                              }
                              options={Object.entries(orderStatusLabels).map(
                                ([value, label]) => ({
                                  value,
                                  label,
                                }),
                              )}
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={
                                order.paymentStatus === 'paid' ||
                                processPaymentMutation.isPending
                              }
                              onClick={() => openPaymentModal(order)}
                            >
                              {order.paymentStatus === 'paid'
                                ? 'Sudah Dibayar'
                                : 'Proses Pembayaran'}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <EmptyState message="Belum ada pesanan." />
            )}
          </div>
        )}
      </div>

      <Modal
        isOpen={isCanteenModalOpen}
        onClose={closeCanteenModal}
        title={editingCanteen ? 'Edit Kantin' : 'Tambah Kantin'}
      >
        <form className="space-y-4" onSubmit={handleSubmitCanteen}>
          <Input
            label="Nama Kantin"
            required
            value={canteenForm.name}
            onChange={(event) =>
              setCanteenForm((prev) => ({
                ...prev,
                name: event.target.value,
              }))
            }
          />
          <Textarea
            label="Deskripsi"
            value={canteenForm.description}
            onChange={(event) =>
              setCanteenForm((prev) => ({
                ...prev,
                description: event.target.value,
              }))
            }
          />
          <Input
            label="Lokasi"
            value={canteenForm.location}
            onChange={(event) =>
              setCanteenForm((prev) => ({
                ...prev,
                location: event.target.value,
              }))
            }
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Kontak"
              value={canteenForm.contactPerson}
              onChange={(event) =>
                setCanteenForm((prev) => ({
                  ...prev,
                  contactPerson: event.target.value,
                }))
              }
            />
            <Input
              label="Nomor Telepon"
              value={canteenForm.contactPhone}
              onChange={(event) =>
                setCanteenForm((prev) => ({
                  ...prev,
                  contactPhone: event.target.value,
                }))
              }
            />
          </div>
          <Input
            label="Jam Operasional"
            value={canteenForm.openingHours}
            onChange={(event) =>
              setCanteenForm((prev) => ({
                ...prev,
                openingHours: event.target.value,
              }))
            }
          />
          <Switch
            label="Kantin Aktif"
            checked={canteenForm.isActive}
            onChange={(event) =>
              setCanteenForm((prev) => ({
                ...prev,
                isActive: event.target.checked,
              }))
            }
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={closeCanteenModal}
            >
              Batal
            </Button>
            <Button
              type="submit"
              loading={
                createCanteenMutation.isPending ||
                updateCanteenMutation.isPending
              }
            >
              Simpan
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isMenuModalOpen}
        onClose={closeMenuModal}
        title={editingMenu ? 'Edit Menu' : 'Tambah Menu'}
        size="lg"
      >
        <form className="space-y-4" onSubmit={handleSubmitMenu}>
          <Select
            label="Kantin"
            required
            value={menuForm.canteenId ? String(menuForm.canteenId) : ''}
            onChange={(event) =>
              setMenuForm((prev) => ({
                ...prev,
                canteenId: Number(event.target.value),
              }))
            }
            options={canteens.map((canteen) => ({
              value: String(canteen.id),
              label: canteen.name,
            }))}
          />
          <Input
            label="Nama Menu"
            required
            value={menuForm.name}
            onChange={(event) =>
              setMenuForm((prev) => ({
                ...prev,
                name: event.target.value,
              }))
            }
          />
          <Textarea
            label="Deskripsi"
            value={menuForm.description}
            onChange={(event) =>
              setMenuForm((prev) => ({
                ...prev,
                description: event.target.value,
              }))
            }
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label="Kategori"
              required
              value={menuForm.category}
              onChange={(event) =>
                setMenuForm((prev) => ({
                  ...prev,
                  category: event.target.value as MenuCategory,
                }))
              }
              options={Object.entries(categoryLabels).map(
                ([value, label]) => ({
                  value,
                  label,
                }),
              )}
            />
            <Input
              type="number"
              label="Harga"
              required
              min={0}
              value={menuForm.price}
              onChange={(event) =>
                setMenuForm((prev) => ({
                  ...prev,
                  price: Number(event.target.value),
                }))
              }
            />
            <Input
              type="number"
              label="Stok (opsional)"
              min={0}
              value={menuForm.stock ?? ''}
              onChange={(event) =>
                setMenuForm((prev) => ({
                  ...prev,
                  stock: event.target.value
                    ? Number(event.target.value)
                    : undefined,
                }))
              }
            />
          </div>
          <Input
            label="URL Gambar"
            value={menuForm.image ?? ''}
            onChange={(event) =>
              setMenuForm((prev) => ({
                ...prev,
                image: event.target.value,
              }))
            }
          />
          <Switch
            label="Menu tersedia"
            checked={menuForm.isAvailable ?? true}
            onChange={(event) =>
              setMenuForm((prev) => ({
                ...prev,
                isAvailable: event.target.checked,
              }))
            }
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={closeMenuModal}
            >
              Batal
            </Button>
            <Button
              type="submit"
              loading={
                createMenuMutation.isPending || updateMenuMutation.isPending
              }
            >
              Simpan
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isOrderModalOpen}
        onClose={closeOrderModal}
        title="Buat Pesanan"
        size="lg"
      >
        <form className="space-y-4" onSubmit={handleSubmitOrder}>
          <Select
            label="Kantin"
            required
            value={orderForm.canteenId ? String(orderForm.canteenId) : ''}
            options={canteens.map((canteen) => ({
              value: String(canteen.id),
              label: canteen.name,
            }))}
            onChange={(event) =>
              setOrderForm((prev) => ({
                ...prev,
                canteenId: Number(event.target.value),
                menuItems: [{ menuId: undefined, quantity: 1 }],
              }))
            }
          />
          <Input
            label="ID Siswa"
            type="number"
            required
            value={orderForm.studentId ?? ''}
            onChange={(event) =>
              setOrderForm((prev) => ({
                ...prev,
                studentId: event.target.value
                  ? Number(event.target.value)
                  : undefined,
              }))
            }
          />
          <Textarea
            label="Catatan"
            value={orderForm.notes}
            onChange={(event) =>
              setOrderForm((prev) => ({
                ...prev,
                notes: event.target.value,
              }))
            }
          />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-gray-800">Menu dipesan</h4>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setOrderForm((prev) => ({
                    ...prev,
                    menuItems: [
                      ...prev.menuItems,
                      { menuId: undefined, quantity: 1 },
                    ],
                  }))
                }
              >
                + Tambah Item
              </Button>
            </div>
            {orderForm.menuItems.map((item, index) => (
              <div
                key={index}
                className="grid grid-cols-1 md:grid-cols-7 gap-3 items-end"
              >
                <div className="md:col-span-4">
                  <Select
                    label="Menu"
                    required
                    value={item.menuId ? String(item.menuId) : ''}
                    onChange={(event) =>
                      setOrderForm((prev) => {
                        const menuItems = [...prev.menuItems];
                        menuItems[index] = {
                          ...menuItems[index],
                          menuId: event.target.value
                            ? Number(event.target.value)
                            : undefined,
                        };
                        return { ...prev, menuItems };
                      })
                    }
                    options={availableOrderMenus.map((menu) => ({
                      value: String(menu.id),
                      label: `${menu.name} (${currency(Number(menu.price))})`,
                    }))}
                  />
                </div>
                <Input
                  label="Jumlah"
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(event) =>
                    setOrderForm((prev) => {
                      const menuItems = [...prev.menuItems];
                      menuItems[index] = {
                        ...menuItems[index],
                        quantity: Number(event.target.value) || 1,
                      };
                      return { ...prev, menuItems };
                    })
                  }
                />
                <Button
                  type="button"
                  variant="destructive"
                  disabled={orderForm.menuItems.length === 1}
                  onClick={() =>
                    setOrderForm((prev) => ({
                      ...prev,
                      menuItems: prev.menuItems.filter(
                        (_, itemIndex) => itemIndex !== index,
                      ),
                    }))
                  }
                >
                  Hapus
                </Button>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={closeOrderModal}
            >
              Batal
            </Button>
            <Button type="submit" loading={createOrderMutation.isPending}>
              Simpan
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isPaymentModalOpen}
        onClose={closePaymentModal}
        title={
          selectedPaymentOrder
            ? `Pembayaran Pesanan #${selectedPaymentOrder.id}`
            : 'Pembayaran Pesanan'
        }
      >
        <form className="space-y-4" onSubmit={handleSubmitPayment}>
          <Select
            label="Metode Pembayaran"
            required
            value={paymentForm.paymentMethod}
            onChange={(event) =>
              setPaymentForm((prev) => ({
                ...prev,
                paymentMethod: event.target.value as
                  | 'cash'
                  | 'card'
                  | 'transfer'
                  | 'qris',
              }))
            }
            options={paymentMethodOptions.map((option) => ({
              value: option.value,
              label: option.label,
            }))}
          />
          <Input
            type="number"
            label="Nominal Pembayaran"
            min={0}
            required
            value={paymentForm.paymentAmount}
            onChange={(event) =>
              setPaymentForm((prev) => ({
                ...prev,
                paymentAmount: Number(event.target.value),
              }))
            }
          />
          <Input
            label="Referensi Pembayaran"
            value={paymentForm.paymentReference}
            onChange={(event) =>
              setPaymentForm((prev) => ({
                ...prev,
                paymentReference: event.target.value,
              }))
            }
          />
          <Textarea
            label="Catatan"
            value={paymentForm.notes}
            onChange={(event) =>
              setPaymentForm((prev) => ({
                ...prev,
                notes: event.target.value,
              }))
            }
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={closePaymentModal}
            >
              Batal
            </Button>
            <Button
              type="submit"
              loading={processPaymentMutation.isPending}
            >
              Proses Pembayaran
            </Button>
          </div>
        </form>
      </Modal>
    </TenantLayout>
  );
}

function SummaryCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: string;
}) {
  return (
    <div className="bg-white rounded-2xl shadow border border-gray-100 p-5 flex items-center gap-4">
      <div className="text-3xl">{icon}</div>
      <div>
        <p className="text-sm uppercase tracking-wide text-gray-500">
          {label}
        </p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

function LoadingState({ message }: { message: string }) {
  return (
    <div className="py-12 text-center space-y-3 text-gray-600">
      <div className="animate-spin h-10 w-10 border-4 border-indigo-200 border-t-indigo-500 rounded-full mx-auto" />
      <p>{message}</p>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="py-12 text-center text-gray-500">
      <p>{message}</p>
    </div>
  );
}


