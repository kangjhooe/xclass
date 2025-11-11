import apiClient from './client';

export type LandOwnershipStatus = 'milik_sendiri' | 'sewa' | 'hibah' | 'lainnya';

export interface Land {
  id: number;
  instansiId: number;
  name: string;
  areaM2: number;
  ownershipStatus: LandOwnershipStatus;
  ownershipDocumentPath?: string | null;
  address?: string | null;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface LandPayload {
  name: string;
  areaM2: number;
  ownershipStatus: LandOwnershipStatus;
  ownershipDocumentPath?: string | null;
  address?: string | null;
  notes?: string | null;
}

export interface LandListResponse {
  data: Land[];
}

export interface Building {
  id: number;
  instansiId: number;
  landId: number;
  name: string;
  floorCount: number;
  lengthM: number;
  widthM: number;
  builtYear: number;
  notes?: string | null;
  land?: Land;
  createdAt?: string;
  updatedAt?: string;
}

export interface BuildingPayload {
  landId: number;
  name: string;
  floorCount: number;
  lengthM: number;
  widthM: number;
  builtYear: number;
  notes?: string | null;
}

export interface Room {
  id: number;
  instansiId: number;
  buildingId: number;
  name: string;
  usageType: RoomUsageType;
  areaM2: number;
  condition: RoomCondition;
  floorNumber: number;
  capacity?: number | null;
  notes?: string | null;
  building?: Building;
  createdAt?: string;
  updatedAt?: string;
}

export type RoomUsageType =
  | 'ruang_kelas'
  | 'kantor'
  | 'laboratorium'
  | 'perpustakaan'
  | 'gudang'
  | 'aula'
  | 'lainnya';

export type RoomCondition =
  | 'baik'
  | 'rusak_ringan'
  | 'rusak_sedang'
  | 'rusak_berat'
  | 'rusak_total';

export interface RoomPayload {
  buildingId: number;
  name: string;
  usageType: RoomUsageType;
  areaM2: number;
  condition: RoomCondition;
  floorNumber: number;
  capacity?: number | null;
  notes?: string | null;
}

const withTenantHeader = (tenantId: number) => ({
  headers: { 'x-tenant-id': tenantId.toString() },
});

export const infrastructureApi = {
  lands: {
    getAll: async (tenantId: number, params?: { search?: string; ownershipStatus?: LandOwnershipStatus }) => {
      const response = await apiClient.get<Land[]>(`/lands`, {
        ...withTenantHeader(tenantId),
        params,
      });
      return response.data;
    },
    getById: async (tenantId: number, id: number) => {
      const response = await apiClient.get<Land>(`/lands/${id}`, withTenantHeader(tenantId));
      return response.data;
    },
    create: async (tenantId: number, payload: LandPayload) => {
      const response = await apiClient.post<Land>(`/lands`, payload, withTenantHeader(tenantId));
      return response.data;
    },
    update: async (tenantId: number, id: number, payload: Partial<LandPayload>) => {
      const response = await apiClient.patch<Land>(`/lands/${id}`, payload, withTenantHeader(tenantId));
      return response.data;
    },
    delete: async (tenantId: number, id: number) => {
      await apiClient.delete(`/lands/${id}`, withTenantHeader(tenantId));
    },
  },
  buildings: {
    getAll: async (tenantId: number, params?: { landId?: number }) => {
      const response = await apiClient.get<Building[]>(`/buildings`, {
        ...withTenantHeader(tenantId),
        params,
      });
      return response.data;
    },
    getById: async (tenantId: number, id: number) => {
      const response = await apiClient.get<Building>(`/buildings/${id}`, withTenantHeader(tenantId));
      return response.data;
    },
    create: async (tenantId: number, payload: BuildingPayload) => {
      const response = await apiClient.post<Building>(`/buildings`, payload, withTenantHeader(tenantId));
      return response.data;
    },
    update: async (tenantId: number, id: number, payload: Partial<BuildingPayload>) => {
      const response = await apiClient.patch<Building>(`/buildings/${id}`, payload, withTenantHeader(tenantId));
      return response.data;
    },
    delete: async (tenantId: number, id: number) => {
      await apiClient.delete(`/buildings/${id}`, withTenantHeader(tenantId));
    },
  },
  rooms: {
    getAll: async (
      tenantId: number,
      params?: { buildingId?: number; usageType?: RoomUsageType; condition?: RoomCondition },
    ) => {
      const response = await apiClient.get<Room[]>(`/rooms`, {
        ...withTenantHeader(tenantId),
        params,
      });
      return response.data;
    },
    getById: async (tenantId: number, id: number) => {
      const response = await apiClient.get<Room>(`/rooms/${id}`, withTenantHeader(tenantId));
      return response.data;
    },
    create: async (tenantId: number, payload: RoomPayload) => {
      const response = await apiClient.post<Room>(`/rooms`, payload, withTenantHeader(tenantId));
      return response.data;
    },
    update: async (tenantId: number, id: number, payload: Partial<RoomPayload>) => {
      const response = await apiClient.patch<Room>(`/rooms/${id}`, payload, withTenantHeader(tenantId));
      return response.data;
    },
    delete: async (tenantId: number, id: number) => {
      await apiClient.delete(`/rooms/${id}`, withTenantHeader(tenantId));
    },
  },
};


