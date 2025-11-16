import apiClient from './client';

export interface Employee {
  id: number;
  employee_id?: string;
  name: string;
  email?: string;
  phone?: string;
  position?: string;
  department?: string;
  hire_date?: string;
  salary?: number;
  status?: 'active' | 'inactive' | 'resigned';
  gender?: string;
  birth_date?: string;
  address?: string;
  created_at?: string;
  updated_at?: string;
}

export interface EmployeeCreateData {
  employee_id?: string;
  name: string;
  email?: string;
  phone?: string;
  position?: string;
  department?: string;
  hire_date?: string;
  salary?: number;
  status?: 'active' | 'inactive' | 'resigned';
  gender?: string;
  birth_date?: string;
  address?: string;
}

export interface Attendance {
  id: number;
  employee_id: number;
  employee_name?: string;
  date: string;
  check_in?: string;
  check_out?: string;
  status?: 'present' | 'absent' | 'late' | 'leave';
  notes?: string;
}

export interface AttendanceCreateData {
  employee_id: number;
  date: string;
  check_in?: string;
  check_out?: string;
  status?: 'present' | 'absent' | 'late' | 'leave';
  notes?: string;
}

// Position interfaces
export interface Position {
  id: number;
  instansiId: number;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PositionCreateData {
  name: string;
  description?: string;
  isActive?: boolean;
}

export interface PositionModule {
  id: number;
  positionId: number;
  moduleKey: string;
  moduleName: string;
  canView: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  description?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  position?: Position;
}

export interface PositionModuleCreateData {
  positionId: number;
  moduleKey: string;
  moduleName: string;
  canView?: boolean;
  canCreate?: boolean;
  canUpdate?: boolean;
  canDelete?: boolean;
  description?: string;
  isActive?: boolean;
}

// Available modules list
export const AVAILABLE_MODULES = [
  { key: 'counseling', name: 'Konseling' },
  { key: 'discipline', name: 'Kedisiplinan' },
  { key: 'finance', name: 'Keuangan' },
  { key: 'spp', name: 'SPP' },
  { key: 'correspondence', name: 'Persuratan' },
  { key: 'students', name: 'Siswa' },
  { key: 'attendance', name: 'Absensi' },
  { key: 'grades', name: 'Nilai' },
  { key: 'exams', name: 'Ujian' },
  { key: 'library', name: 'Perpustakaan' },
  { key: 'hr', name: 'SDM' },
  { key: 'announcement', name: 'Pengumuman' },
  { key: 'event', name: 'Acara' },
  { key: 'health', name: 'Kesehatan' },
  { key: 'transportation', name: 'Transportasi' },
  { key: 'facility', name: 'Fasilitas' },
];

export const hrApi = {
  // Employees
  getAllEmployees: async (tenantId: number, params?: any): Promise<{ data: Employee[]; total: number }> => {
    const response = await apiClient.get(`/tenants/${tenantId}/hr/employees`, { params });
    return response.data;
  },

  getEmployeeById: async (tenantId: number, id: number): Promise<Employee> => {
    const response = await apiClient.get(`/tenants/${tenantId}/hr/employees/${id}`);
    return response.data;
  },

  createEmployee: async (tenantId: number, data: EmployeeCreateData): Promise<Employee> => {
    const response = await apiClient.post(`/tenants/${tenantId}/hr/employees`, data);
    return response.data;
  },

  updateEmployee: async (tenantId: number, id: number, data: Partial<EmployeeCreateData>): Promise<Employee> => {
    const response = await apiClient.put(`/tenants/${tenantId}/hr/employees/${id}`, data);
    return response.data;
  },

  deleteEmployee: async (tenantId: number, id: number): Promise<void> => {
    await apiClient.delete(`/tenants/${tenantId}/hr/employees/${id}`);
  },

  // Attendance
  getAllAttendance: async (tenantId: number, params?: any): Promise<{ data: Attendance[]; total: number }> => {
    const response = await apiClient.get(`/tenants/${tenantId}/hr/attendance`, { params });
    return response.data;
  },

  createAttendance: async (tenantId: number, data: AttendanceCreateData): Promise<Attendance> => {
    const response = await apiClient.post(`/tenants/${tenantId}/hr/attendance`, data);
    return response.data;
  },

  updateAttendance: async (tenantId: number, id: number, data: Partial<AttendanceCreateData>): Promise<Attendance> => {
    const response = await apiClient.put(`/tenants/${tenantId}/hr/attendance/${id}`, data);
    return response.data;
  },

  deleteAttendance: async (tenantId: number, id: number): Promise<void> => {
    await apiClient.delete(`/tenants/${tenantId}/hr/attendance/${id}`);
  },

  // Positions
  getAllPositions: async (tenantId: number): Promise<Position[]> => {
    const response = await apiClient.get(`/hr/positions`, {
      headers: { 'x-tenant-id': tenantId.toString() },
    });
    return response.data;
  },

  getPositionById: async (tenantId: number, id: number): Promise<Position> => {
    const response = await apiClient.get(`/hr/positions/${id}`, {
      headers: { 'x-tenant-id': tenantId.toString() },
    });
    return response.data;
  },

  createPosition: async (tenantId: number, data: PositionCreateData): Promise<Position> => {
    const response = await apiClient.post(`/hr/positions`, data, {
      headers: { 'x-tenant-id': tenantId.toString() },
    });
    return response.data;
  },

  updatePosition: async (tenantId: number, id: number, data: Partial<PositionCreateData>): Promise<Position> => {
    const response = await apiClient.patch(`/hr/positions/${id}`, data, {
      headers: { 'x-tenant-id': tenantId.toString() },
    });
    return response.data;
  },

  deletePosition: async (tenantId: number, id: number): Promise<void> => {
    await apiClient.delete(`/hr/positions/${id}`, {
      headers: { 'x-tenant-id': tenantId.toString() },
    });
  },

  // Position Modules
  getModulesByPosition: async (tenantId: number, positionId: number): Promise<PositionModule[]> => {
    const response = await apiClient.get(`/hr/positions/${positionId}/modules`, {
      headers: { 'x-tenant-id': tenantId.toString() },
    });
    return response.data;
  },

  getAllPositionModules: async (tenantId: number, positionId?: number): Promise<PositionModule[]> => {
    const params = positionId ? { positionId } : {};
    const response = await apiClient.get(`/hr/position-modules`, {
      params,
      headers: { 'x-tenant-id': tenantId.toString() },
    });
    return response.data;
  },

  createPositionModule: async (tenantId: number, positionId: number, data: PositionModuleCreateData): Promise<PositionModule> => {
    const response = await apiClient.post(`/hr/positions/${positionId}/modules`, data, {
      headers: { 'x-tenant-id': tenantId.toString() },
    });
    return response.data;
  },

  updatePositionModule: async (tenantId: number, id: number, data: Partial<PositionModuleCreateData>): Promise<PositionModule> => {
    const response = await apiClient.patch(`/hr/position-modules/${id}`, data, {
      headers: { 'x-tenant-id': tenantId.toString() },
    });
    return response.data;
  },

  deletePositionModule: async (tenantId: number, id: number): Promise<void> => {
    await apiClient.delete(`/hr/position-modules/${id}`, {
      headers: { 'x-tenant-id': tenantId.toString() },
    });
  },
};

