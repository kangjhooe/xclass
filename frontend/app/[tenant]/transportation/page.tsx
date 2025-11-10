'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import TenantLayout from '@/components/layouts/TenantLayout';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { transportationApi, Vehicle, VehicleCreateData, Route, RouteCreateData } from '@/lib/api/transportation';
import { formatDate } from '@/lib/utils/date';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function TransportationPage() {
  const params = useParams();
  const tenantId = parseInt(params.tenant as string);
  const [activeTab, setActiveTab] = useState<'vehicles' | 'routes'>('vehicles');
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [isRouteModalOpen, setIsRouteModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [vehicleFormData, setVehicleFormData] = useState<VehicleCreateData>({
    vehicle_number: '',
    vehicle_type: '',
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    capacity: 0,
    driver_id: undefined,
    status: 'active',
  });
  const [routeFormData, setRouteFormData] = useState<RouteCreateData>({
    route_name: '',
    start_location: '',
    end_location: '',
    distance: 0,
    estimated_time: 0,
    vehicle_id: undefined,
    status: 'active',
  });

  const queryClient = useQueryClient();

  const { data: vehiclesData, isLoading: vehiclesLoading } = useQuery({
    queryKey: ['transportation-vehicles', tenantId],
    queryFn: () => transportationApi.getAllVehicles(tenantId),
    enabled: activeTab === 'vehicles',
  });

  const { data: routesData, isLoading: routesLoading } = useQuery({
    queryKey: ['transportation-routes', tenantId],
    queryFn: () => transportationApi.getAllRoutes(tenantId),
    enabled: activeTab === 'routes',
  });

  const createVehicleMutation = useMutation({
    mutationFn: (data: VehicleCreateData) => transportationApi.createVehicle(tenantId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transportation-vehicles', tenantId] });
      setIsVehicleModalOpen(false);
      resetVehicleForm();
    },
  });

  const updateVehicleMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<VehicleCreateData> }) =>
      transportationApi.updateVehicle(tenantId, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transportation-vehicles', tenantId] });
      setIsVehicleModalOpen(false);
      setSelectedVehicle(null);
      resetVehicleForm();
    },
  });

  const deleteVehicleMutation = useMutation({
    mutationFn: (id: number) => transportationApi.deleteVehicle(tenantId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transportation-vehicles', tenantId] });
    },
  });

  const createRouteMutation = useMutation({
    mutationFn: (data: RouteCreateData) => transportationApi.createRoute(tenantId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transportation-routes', tenantId] });
      setIsRouteModalOpen(false);
      resetRouteForm();
    },
  });

  const updateRouteMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<RouteCreateData> }) =>
      transportationApi.updateRoute(tenantId, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transportation-routes', tenantId] });
      setIsRouteModalOpen(false);
      setSelectedRoute(null);
      resetRouteForm();
    },
  });

  const deleteRouteMutation = useMutation({
    mutationFn: (id: number) => transportationApi.deleteRoute(tenantId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transportation-routes', tenantId] });
    },
  });

  const resetVehicleForm = () => {
    setVehicleFormData({
      vehicle_number: '',
      vehicle_type: '',
      brand: '',
      model: '',
      year: new Date().getFullYear(),
      capacity: 0,
      driver_id: undefined,
      status: 'active',
    });
    setSelectedVehicle(null);
  };

  const resetRouteForm = () => {
    setRouteFormData({
      route_name: '',
      start_location: '',
      end_location: '',
      distance: 0,
      estimated_time: 0,
      vehicle_id: undefined,
      status: 'active',
    });
    setSelectedRoute(null);
  };

  const handleEditVehicle = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setVehicleFormData({
      vehicle_number: vehicle.vehicle_number,
      vehicle_type: vehicle.vehicle_type || '',
      brand: vehicle.brand || '',
      model: vehicle.model || '',
      year: vehicle.year || new Date().getFullYear(),
      capacity: vehicle.capacity || 0,
      driver_id: vehicle.driver_id,
      status: vehicle.status || 'active',
    });
    setIsVehicleModalOpen(true);
  };

  const handleEditRoute = (route: Route) => {
    setSelectedRoute(route);
    setRouteFormData({
      route_name: route.route_name,
      start_location: route.start_location || '',
      end_location: route.end_location || '',
      distance: route.distance || 0,
      estimated_time: route.estimated_time || 0,
      vehicle_id: route.vehicle_id,
      status: route.status || 'active',
    });
    setIsRouteModalOpen(true);
  };

  const totalVehicles = vehiclesData?.data?.length || 0;
  const activeVehicles = vehiclesData?.data?.filter((v) => v.status === 'active').length || 0;
  const totalRoutes = routesData?.data?.length || 0;

  return (
    <TenantLayout>
      <div className="p-6 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 min-h-screen">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Transportasi
              </h1>
              <p className="text-gray-600">Manajemen kendaraan dan rute</p>
            </div>
            {activeTab === 'vehicles' ? (
              <Button
                onClick={() => {
                  resetVehicleForm();
                  setIsVehicleModalOpen(true);
                }}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Tambah Kendaraan
              </Button>
            ) : (
              <Button
                onClick={() => {
                  resetRouteForm();
                  setIsRouteModalOpen(true);
                }}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Tambah Rute
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Kendaraan</p>
                <p className="text-3xl font-bold text-blue-600">{totalVehicles}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Kendaraan Aktif</p>
                <p className="text-3xl font-bold text-green-600">{activeVehicles}</p>
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
                <p className="text-sm text-gray-600 mb-1">Total Rute</p>
                <p className="text-3xl font-bold text-purple-600">{totalRoutes}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('vehicles')}
              className={`flex-1 px-6 py-4 text-center font-semibold transition-all duration-200 ${
                activeTab === 'vehicles'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white border-b-2 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Kendaraan
            </button>
            <button
              onClick={() => setActiveTab('routes')}
              className={`flex-1 px-6 py-4 text-center font-semibold transition-all duration-200 ${
                activeTab === 'routes'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white border-b-2 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Rute
            </button>
          </div>
        </div>

        {activeTab === 'vehicles' ? (
          <>
            {vehiclesLoading ? (
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
                        <TableHead className="font-semibold text-gray-700">No. Kendaraan</TableHead>
                        <TableHead className="font-semibold text-gray-700">Tipe</TableHead>
                        <TableHead className="font-semibold text-gray-700">Merek</TableHead>
                        <TableHead className="font-semibold text-gray-700">Model</TableHead>
                        <TableHead className="font-semibold text-gray-700">Kapasitas</TableHead>
                        <TableHead className="font-semibold text-gray-700">Pengemudi</TableHead>
                        <TableHead className="font-semibold text-gray-700">Status</TableHead>
                        <TableHead className="font-semibold text-gray-700">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {vehiclesData?.data?.map((vehicle) => (
                        <TableRow key={vehicle.id} className="hover:bg-blue-50/50 transition-colors">
                          <TableCell className="font-medium text-gray-800">{vehicle.vehicle_number}</TableCell>
                          <TableCell>{vehicle.vehicle_type || '-'}</TableCell>
                          <TableCell>{vehicle.brand || '-'}</TableCell>
                          <TableCell>{vehicle.model || '-'}</TableCell>
                          <TableCell>{vehicle.capacity || '-'}</TableCell>
                          <TableCell>{vehicle.driver_name || '-'}</TableCell>
                          <TableCell>
                            <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                              vehicle.status === 'active' 
                                ? 'bg-green-500 text-white' 
                                : vehicle.status === 'maintenance'
                                ? 'bg-yellow-500 text-white'
                                : 'bg-gray-500 text-white'
                            }`}>
                              {vehicle.status === 'active' ? 'Aktif' :
                               vehicle.status === 'maintenance' ? 'Perawatan' :
                               vehicle.status === 'inactive' ? 'Tidak Aktif' : '-'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditVehicle(vehicle)}
                                className="hover:bg-blue-50 hover:border-blue-300 transition-colors"
                              >
                                Edit
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => {
                                  if (confirm('Apakah Anda yakin ingin menghapus kendaraan ini?')) {
                                    deleteVehicleMutation.mutate(vehicle.id);
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
                      {vehiclesData?.data?.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-12">
                            <div className="flex flex-col items-center">
                              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                </svg>
                              </div>
                              <p className="text-gray-500 font-medium">Belum ada data kendaraan</p>
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
              isOpen={isVehicleModalOpen}
              onClose={() => {
                setIsVehicleModalOpen(false);
                resetVehicleForm();
              }}
              title={selectedVehicle ? 'Edit Kendaraan' : 'Tambah Kendaraan'}
              size="lg"
            >
              <form onSubmit={(e) => {
                e.preventDefault();
                if (selectedVehicle) {
                  updateVehicleMutation.mutate({ id: selectedVehicle.id, data: vehicleFormData });
                } else {
                  createVehicleMutation.mutate(vehicleFormData);
                }
              }} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      No. Kendaraan <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={vehicleFormData.vehicle_number}
                      onChange={(e) => setVehicleFormData({ ...vehicleFormData, vehicle_number: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipe</label>
                    <input
                      type="text"
                      value={vehicleFormData.vehicle_type}
                      onChange={(e) => setVehicleFormData({ ...vehicleFormData, vehicle_type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Contoh: Bus, Mobil, dll"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Merek</label>
                    <input
                      type="text"
                      value={vehicleFormData.brand}
                      onChange={(e) => setVehicleFormData({ ...vehicleFormData, brand: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                    <input
                      type="text"
                      value={vehicleFormData.model}
                      onChange={(e) => setVehicleFormData({ ...vehicleFormData, model: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tahun</label>
                    <input
                      type="number"
                      value={vehicleFormData.year}
                      onChange={(e) => setVehicleFormData({ ...vehicleFormData, year: parseInt(e.target.value) || new Date().getFullYear() })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="1900"
                      max={new Date().getFullYear() + 1}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kapasitas</label>
                    <input
                      type="number"
                      value={vehicleFormData.capacity}
                      onChange={(e) => setVehicleFormData({ ...vehicleFormData, capacity: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={vehicleFormData.status}
                      onChange={(e) => setVehicleFormData({ ...vehicleFormData, status: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="active">Aktif</option>
                      <option value="maintenance">Perawatan</option>
                      <option value="inactive">Tidak Aktif</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setIsVehicleModalOpen(false);
                      resetVehicleForm();
                    }}
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    loading={createVehicleMutation.isPending || updateVehicleMutation.isPending}
                  >
                    {selectedVehicle ? 'Update' : 'Simpan'}
                  </Button>
                </div>
              </form>
            </Modal>
          </>
        ) : (
          <>
            {routesLoading ? (
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
                        <TableHead className="font-semibold text-gray-700">Nama Rute</TableHead>
                        <TableHead className="font-semibold text-gray-700">Dari</TableHead>
                        <TableHead className="font-semibold text-gray-700">Ke</TableHead>
                        <TableHead className="font-semibold text-gray-700">Jarak (km)</TableHead>
                        <TableHead className="font-semibold text-gray-700">Waktu (menit)</TableHead>
                        <TableHead className="font-semibold text-gray-700">Kendaraan</TableHead>
                        <TableHead className="font-semibold text-gray-700">Status</TableHead>
                        <TableHead className="font-semibold text-gray-700">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {routesData?.data?.map((route) => (
                        <TableRow key={route.id} className="hover:bg-blue-50/50 transition-colors">
                          <TableCell className="font-medium text-gray-800">{route.route_name}</TableCell>
                          <TableCell>{route.start_location || '-'}</TableCell>
                          <TableCell>{route.end_location || '-'}</TableCell>
                          <TableCell>{route.distance || '-'}</TableCell>
                          <TableCell>{route.estimated_time || '-'}</TableCell>
                          <TableCell>{route.vehicle_number || '-'}</TableCell>
                          <TableCell>
                            <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                              route.status === 'active' 
                                ? 'bg-green-500 text-white' 
                                : 'bg-gray-500 text-white'
                            }`}>
                              {route.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditRoute(route)}
                                className="hover:bg-blue-50 hover:border-blue-300 transition-colors"
                              >
                                Edit
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => {
                                  if (confirm('Apakah Anda yakin ingin menghapus rute ini?')) {
                                    deleteRouteMutation.mutate(route.id);
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
                      {routesData?.data?.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-12">
                            <div className="flex flex-col items-center">
                              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                </svg>
                              </div>
                              <p className="text-gray-500 font-medium">Belum ada data rute</p>
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
              isOpen={isRouteModalOpen}
              onClose={() => {
                setIsRouteModalOpen(false);
                resetRouteForm();
              }}
              title={selectedRoute ? 'Edit Rute' : 'Tambah Rute'}
              size="lg"
            >
              <form onSubmit={(e) => {
                e.preventDefault();
                if (selectedRoute) {
                  updateRouteMutation.mutate({ id: selectedRoute.id, data: routeFormData });
                } else {
                  createRouteMutation.mutate(routeFormData);
                }
              }} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nama Rute <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={routeFormData.route_name}
                      onChange={(e) => setRouteFormData({ ...routeFormData, route_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dari</label>
                    <input
                      type="text"
                      value={routeFormData.start_location}
                      onChange={(e) => setRouteFormData({ ...routeFormData, start_location: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ke</label>
                    <input
                      type="text"
                      value={routeFormData.end_location}
                      onChange={(e) => setRouteFormData({ ...routeFormData, end_location: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Jarak (km)</label>
                    <input
                      type="number"
                      value={routeFormData.distance}
                      onChange={(e) => setRouteFormData({ ...routeFormData, distance: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Waktu Estimasi (menit)</label>
                    <input
                      type="number"
                      value={routeFormData.estimated_time}
                      onChange={(e) => setRouteFormData({ ...routeFormData, estimated_time: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kendaraan</label>
                    <select
                      value={routeFormData.vehicle_id}
                      onChange={(e) => setRouteFormData({ ...routeFormData, vehicle_id: e.target.value ? parseInt(e.target.value) : undefined })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Pilih Kendaraan</option>
                      {vehiclesData?.data?.map((vehicle) => (
                        <option key={vehicle.id} value={vehicle.id}>
                          {vehicle.vehicle_number} - {vehicle.vehicle_type}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={routeFormData.status}
                      onChange={(e) => setRouteFormData({ ...routeFormData, status: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="active">Aktif</option>
                      <option value="inactive">Tidak Aktif</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setIsRouteModalOpen(false);
                      resetRouteForm();
                    }}
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    loading={createRouteMutation.isPending || updateRouteMutation.isPending}
                  >
                    {selectedRoute ? 'Update' : 'Simpan'}
                  </Button>
                </div>
              </form>
            </Modal>
          </>
        )}
      </div>
    </TenantLayout>
  );
}
