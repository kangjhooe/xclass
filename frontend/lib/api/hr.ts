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
};

