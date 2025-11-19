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
  employeeId: number;
  employee?: Employee;
  employee_name?: string;
  attendanceDate: string;
  checkInTime?: string;
  checkOutTime?: string;
  status?: 'present' | 'absent' | 'late' | 'excused';
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AttendanceCreateData {
  employeeId: number;
  attendanceDate: string;
  checkInTime?: string;
  checkOutTime?: string;
  status?: 'present' | 'absent' | 'late' | 'excused';
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

// Payroll interfaces
export interface PayrollItem {
  id?: number;
  name: string;
  amount: number;
  type: 'allowance' | 'deduction';
}

export interface Payroll {
  id: number;
  employeeId: number;
  employee?: Employee;
  employeeType: 'employee' | 'teacher' | 'staff';
  payrollDate: string;
  basicSalary: number;
  totalAllowances: number;
  totalDeductions: number;
  netSalary: number;
  status: 'pending' | 'approved' | 'paid' | 'cancelled';
  notes?: string;
  items?: PayrollItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface PayrollCreateData {
  employeeId: number;
  employeeType: 'employee' | 'teacher' | 'staff';
  payrollDate: string;
  basicSalary: number;
  allowances?: PayrollItem[];
  deductions?: PayrollItem[];
  notes?: string;
}

// Department interfaces
export interface Department {
  id: number;
  instansiId: number;
  name: string;
  description?: string;
  headId?: number;
  isActive: boolean;
  employees?: Employee[];
  createdAt?: string;
  updatedAt?: string;
}

export interface DepartmentCreateData {
  name: string;
  description?: string;
  headId?: number;
  isActive?: boolean;
}

// Performance Review interfaces
export interface PerformanceReview {
  id: number;
  employeeId: number;
  employee?: Employee;
  reviewDate: string;
  reviewPeriod: string;
  rating: number;
  strengths: string;
  weaknesses?: string;
  goals?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PerformanceReviewCreateData {
  employeeId: number;
  reviewDate: string;
  reviewPeriod: string;
  rating: number;
  strengths: string;
  weaknesses?: string;
  goals?: string;
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
    const response = await apiClient.patch(`/tenants/${tenantId}/hr/employees/${id}`, data);
    return response.data;
  },

  deleteEmployee: async (tenantId: number, id: number): Promise<void> => {
    await apiClient.delete(`/tenants/${tenantId}/hr/employees/${id}`);
  },

  // Attendance
  getAllAttendance: async (tenantId: number, params?: any): Promise<Attendance[]> => {
    const response = await apiClient.get(`/hr/attendance`, {
      params,
      headers: { 'x-tenant-id': tenantId.toString() },
    });
    return response.data;
  },

  createAttendance: async (tenantId: number, data: AttendanceCreateData): Promise<Attendance> => {
    const response = await apiClient.post(`/hr/attendance`, data, {
      headers: { 'x-tenant-id': tenantId.toString() },
    });
    return response.data;
  },

  updateAttendance: async (tenantId: number, id: number, data: Partial<AttendanceCreateData>): Promise<Attendance> => {
    const response = await apiClient.patch(`/hr/attendance/${id}`, data, {
      headers: { 'x-tenant-id': tenantId.toString() },
    });
    return response.data;
  },

  deleteAttendance: async (tenantId: number, id: number): Promise<void> => {
    await apiClient.delete(`/hr/attendance/${id}`, {
      headers: { 'x-tenant-id': tenantId.toString() },
    });
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

  // Payroll
  getAllPayrolls: async (tenantId: number, params?: any): Promise<Payroll[]> => {
    const response = await apiClient.get(`/hr/payrolls`, {
      params,
      headers: { 'x-tenant-id': tenantId.toString() },
    });
    return response.data;
  },

  getPayrollById: async (tenantId: number, id: number): Promise<Payroll> => {
    const response = await apiClient.get(`/hr/payrolls/${id}`, {
      headers: { 'x-tenant-id': tenantId.toString() },
    });
    return response.data;
  },

  createPayroll: async (tenantId: number, data: PayrollCreateData): Promise<Payroll> => {
    const response = await apiClient.post(`/hr/payrolls`, data, {
      headers: { 'x-tenant-id': tenantId.toString() },
    });
    return response.data;
  },

  updatePayroll: async (tenantId: number, id: number, data: Partial<PayrollCreateData>): Promise<Payroll> => {
    const response = await apiClient.patch(`/hr/payrolls/${id}`, data, {
      headers: { 'x-tenant-id': tenantId.toString() },
    });
    return response.data;
  },

  deletePayroll: async (tenantId: number, id: number): Promise<void> => {
    await apiClient.delete(`/hr/payrolls/${id}`, {
      headers: { 'x-tenant-id': tenantId.toString() },
    });
  },

  // Departments
  getAllDepartments: async (tenantId: number): Promise<Department[]> => {
    const response = await apiClient.get(`/hr/departments`, {
      headers: { 'x-tenant-id': tenantId.toString() },
    });
    return response.data;
  },

  getDepartmentById: async (tenantId: number, id: number): Promise<Department> => {
    const response = await apiClient.get(`/hr/departments/${id}`, {
      headers: { 'x-tenant-id': tenantId.toString() },
    });
    return response.data;
  },

  createDepartment: async (tenantId: number, data: DepartmentCreateData): Promise<Department> => {
    const response = await apiClient.post(`/hr/departments`, data, {
      headers: { 'x-tenant-id': tenantId.toString() },
    });
    return response.data;
  },

  updateDepartment: async (tenantId: number, id: number, data: Partial<DepartmentCreateData>): Promise<Department> => {
    const response = await apiClient.patch(`/hr/departments/${id}`, data, {
      headers: { 'x-tenant-id': tenantId.toString() },
    });
    return response.data;
  },

  deleteDepartment: async (tenantId: number, id: number): Promise<void> => {
    await apiClient.delete(`/hr/departments/${id}`, {
      headers: { 'x-tenant-id': tenantId.toString() },
    });
  },

  // Performance Reviews
  getAllPerformanceReviews: async (tenantId: number, params?: any): Promise<PerformanceReview[]> => {
    const response = await apiClient.get(`/hr/performance-reviews`, {
      params,
      headers: { 'x-tenant-id': tenantId.toString() },
    });
    return response.data;
  },

  getPerformanceReviewById: async (tenantId: number, id: number): Promise<PerformanceReview> => {
    const response = await apiClient.get(`/hr/performance-reviews/${id}`, {
      headers: { 'x-tenant-id': tenantId.toString() },
    });
    return response.data;
  },

  createPerformanceReview: async (tenantId: number, data: PerformanceReviewCreateData): Promise<PerformanceReview> => {
    const response = await apiClient.post(`/hr/performance-reviews`, data, {
      headers: { 'x-tenant-id': tenantId.toString() },
    });
    return response.data;
  },

  updatePerformanceReview: async (tenantId: number, id: number, data: Partial<PerformanceReviewCreateData>): Promise<PerformanceReview> => {
    const response = await apiClient.patch(`/hr/performance-reviews/${id}`, data, {
      headers: { 'x-tenant-id': tenantId.toString() },
    });
    return response.data;
  },

  deletePerformanceReview: async (tenantId: number, id: number): Promise<void> => {
    await apiClient.delete(`/hr/performance-reviews/${id}`, {
      headers: { 'x-tenant-id': tenantId.toString() },
    });
  },
};

