import apiClient from './client';

export interface Student {
  id: number;
  npsn?: string;
  nisn?: string;
  studentNumber?: string;
  name: string;
  email?: string;
  phone?: string;
  gender?: string;
  birthPlace?: string;
  birthDate?: string;
  address?: string;
  classId?: number;
  classRoom?: {
    id: number;
    name: string;
  };
  isActive?: boolean;
  nik?: string;
  nationality?: string;
  ethnicity?: string;
  language?: string;
  bloodType?: string;
  religion?: string;
  // Alamat lengkap
  rt?: string;
  rw?: string;
  village?: string;
  subDistrict?: string;
  district?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  // Data orangtua
  fatherName?: string;
  fatherNik?: string;
  fatherPhone?: string;
  fatherEmail?: string;
  motherName?: string;
  motherNik?: string;
  motherPhone?: string;
  motherEmail?: string;
  // Data wali
  parentName?: string;
  parentPhone?: string;
  parentEmail?: string;
  guardianName?: string;
  guardianNik?: string;
  guardianPhone?: string;
  guardianEmail?: string;
  // Data akademik
  studentStatus?: string;
  academicLevel?: string;
  currentGrade?: string;
  academicYear?: string;
  enrollmentDate?: string;
  // Timestamps
  createdAt?: string;
  updatedAt?: string;
  // Backward compatibility
  nis?: string;
  birth_place?: string;
  birth_date?: string;
  class_id?: number;
  class_name?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

export interface StudentCreateData {
  npsn?: string;
  nisn?: string;
  studentNumber?: string;
  name: string;
  email?: string;
  phone?: string;
  gender?: string;
  birthPlace?: string;
  birthDate?: string;
  address?: string;
  classId?: number;
  isActive?: boolean;
  nik?: string;
  nationality?: string;
  ethnicity?: string;
  language?: string;
  bloodType?: string;
  religion?: string;
  // Alamat lengkap
  rt?: string;
  rw?: string;
  village?: string;
  subDistrict?: string;
  district?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  // Data orangtua
  fatherName?: string;
  fatherNik?: string;
  fatherPhone?: string;
  fatherEmail?: string;
  motherName?: string;
  motherNik?: string;
  motherPhone?: string;
  motherEmail?: string;
  // Data wali
  parentName?: string;
  parentPhone?: string;
  parentEmail?: string;
  guardianName?: string;
  guardianNik?: string;
  guardianPhone?: string;
  guardianEmail?: string;
  // Data akademik
  studentStatus?: string;
  academicLevel?: string;
  currentGrade?: string;
  academicYear?: string;
  enrollmentDate?: string;
  // Backward compatibility
  nis?: string;
  birth_place?: string;
  birth_date?: string;
  class_id?: number;
  status?: string;
}

export interface StudentListParams {
  search?: string;
  classId?: number | string;
  status?: string;
  gender?: string;
  page?: number;
  limit?: number;
  academicYear?: string;
}

export const studentsApi = {
  getAll: async (
    tenantId: number,
    params?: StudentListParams,
  ): Promise<{ data: Student[]; total: number }> => {
    const response = await apiClient.get(`/tenants/${tenantId}/students`, { params });
    return response.data;
  },

  getById: async (tenantId: number, id: number): Promise<Student> => {
    const response = await apiClient.get(`/tenants/${tenantId}/students/${id}`);
    return response.data;
  },

  create: async (tenantId: number, data: StudentCreateData): Promise<Student> => {
    const response = await apiClient.post(`/tenants/${tenantId}/students`, data);
    return response.data;
  },

  update: async (tenantId: number, id: number, data: Partial<StudentCreateData>): Promise<Student> => {
    const response = await apiClient.put(`/tenants/${tenantId}/students/${id}`, data);
    return response.data;
  },

  delete: async (tenantId: number, id: number): Promise<void> => {
    await apiClient.delete(`/tenants/${tenantId}/students/${id}`);
  },
};

