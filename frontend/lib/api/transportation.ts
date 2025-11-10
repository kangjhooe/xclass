import apiClient from './client';

export interface Vehicle {
  id: number;
  vehicle_number: string;
  vehicle_type?: string;
  brand?: string;
  model?: string;
  year?: number;
  capacity?: number;
  driver_id?: number;
  driver_name?: string;
  status?: 'active' | 'maintenance' | 'inactive';
  created_at?: string;
  updated_at?: string;
}

export interface VehicleCreateData {
  vehicle_number: string;
  vehicle_type?: string;
  brand?: string;
  model?: string;
  year?: number;
  capacity?: number;
  driver_id?: number;
  status?: 'active' | 'maintenance' | 'inactive';
}

export interface Route {
  id: number;
  route_name: string;
  start_location?: string;
  end_location?: string;
  distance?: number;
  estimated_time?: number;
  vehicle_id?: number;
  vehicle_number?: string;
  status?: 'active' | 'inactive';
  created_at?: string;
}

export interface RouteCreateData {
  route_name: string;
  start_location?: string;
  end_location?: string;
  distance?: number;
  estimated_time?: number;
  vehicle_id?: number;
  status?: 'active' | 'inactive';
}

export const transportationApi = {
  // Vehicles
  getAllVehicles: async (tenantId: number, params?: any): Promise<{ data: Vehicle[]; total: number }> => {
    const response = await apiClient.get(`/tenants/${tenantId}/transportation/vehicles`, { params });
    return response.data;
  },

  getVehicleById: async (tenantId: number, id: number): Promise<Vehicle> => {
    const response = await apiClient.get(`/tenants/${tenantId}/transportation/vehicles/${id}`);
    return response.data;
  },

  createVehicle: async (tenantId: number, data: VehicleCreateData): Promise<Vehicle> => {
    const response = await apiClient.post(`/tenants/${tenantId}/transportation/vehicles`, data);
    return response.data;
  },

  updateVehicle: async (tenantId: number, id: number, data: Partial<VehicleCreateData>): Promise<Vehicle> => {
    const response = await apiClient.put(`/tenants/${tenantId}/transportation/vehicles/${id}`, data);
    return response.data;
  },

  deleteVehicle: async (tenantId: number, id: number): Promise<void> => {
    await apiClient.delete(`/tenants/${tenantId}/transportation/vehicles/${id}`);
  },

  // Routes
  getAllRoutes: async (tenantId: number, params?: any): Promise<{ data: Route[]; total: number }> => {
    const response = await apiClient.get(`/tenants/${tenantId}/transportation/routes`, { params });
    return response.data;
  },

  getRouteById: async (tenantId: number, id: number): Promise<Route> => {
    const response = await apiClient.get(`/tenants/${tenantId}/transportation/routes/${id}`);
    return response.data;
  },

  createRoute: async (tenantId: number, data: RouteCreateData): Promise<Route> => {
    const response = await apiClient.post(`/tenants/${tenantId}/transportation/routes`, data);
    return response.data;
  },

  updateRoute: async (tenantId: number, id: number, data: Partial<RouteCreateData>): Promise<Route> => {
    const response = await apiClient.put(`/tenants/${tenantId}/transportation/routes/${id}`, data);
    return response.data;
  },

  deleteRoute: async (tenantId: number, id: number): Promise<void> => {
    await apiClient.delete(`/tenants/${tenantId}/transportation/routes/${id}`);
  },
};

