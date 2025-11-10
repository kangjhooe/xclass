import apiClient from './client';

export interface Material {
  id: number;
  title: string;
  description?: string;
  content?: string;
  subject_id?: number;
  subject_name?: string;
  class_id?: number;
  class_name?: string;
  file_url?: string;
  type?: 'text' | 'video' | 'document' | 'link';
  status?: 'draft' | 'published';
  created_at?: string;
  created_by?: number;
  created_by_name?: string;
}

export interface MaterialCreateData {
  title: string;
  description?: string;
  content?: string;
  subject_id?: number;
  class_id?: number;
  file_url?: string;
  type?: 'text' | 'video' | 'document' | 'link';
  status?: 'draft' | 'published';
}

export interface Assignment {
  id: number;
  title: string;
  description?: string;
  subject_id?: number;
  subject_name?: string;
  class_id?: number;
  class_name?: string;
  due_date?: string;
  max_score?: number;
  status?: 'draft' | 'published' | 'closed';
  created_at?: string;
  created_by?: number;
}

export interface AssignmentCreateData {
  title: string;
  description?: string;
  subject_id?: number;
  class_id?: number;
  due_date?: string;
  max_score?: number;
  status?: 'draft' | 'published' | 'closed';
}

export interface Submission {
  id: number;
  assignment_id: number;
  assignment_title?: string;
  student_id: number;
  student_name?: string;
  file_url?: string;
  content?: string;
  score?: number;
  status?: 'submitted' | 'graded';
  submitted_at?: string;
  graded_at?: string;
}

export interface SubmissionCreateData {
  assignment_id: number;
  student_id: number;
  file_url?: string;
  content?: string;
}

export const elearningApi = {
  // Materials
  getAllMaterials: async (tenantId: number, params?: any): Promise<{ data: Material[]; total: number }> => {
    const response = await apiClient.get(`/tenants/${tenantId}/elearning/materials`, { params });
    return response.data;
  },

  getMaterialById: async (tenantId: number, id: number): Promise<Material> => {
    const response = await apiClient.get(`/tenants/${tenantId}/elearning/materials/${id}`);
    return response.data;
  },

  createMaterial: async (tenantId: number, data: MaterialCreateData): Promise<Material> => {
    const response = await apiClient.post(`/tenants/${tenantId}/elearning/materials`, data);
    return response.data;
  },

  updateMaterial: async (tenantId: number, id: number, data: Partial<MaterialCreateData>): Promise<Material> => {
    const response = await apiClient.put(`/tenants/${tenantId}/elearning/materials/${id}`, data);
    return response.data;
  },

  deleteMaterial: async (tenantId: number, id: number): Promise<void> => {
    await apiClient.delete(`/tenants/${tenantId}/elearning/materials/${id}`);
  },

  // Assignments
  getAllAssignments: async (tenantId: number, params?: any): Promise<{ data: Assignment[]; total: number }> => {
    const response = await apiClient.get(`/tenants/${tenantId}/elearning/assignments`, { params });
    return response.data;
  },

  getAssignmentById: async (tenantId: number, id: number): Promise<Assignment> => {
    const response = await apiClient.get(`/tenants/${tenantId}/elearning/assignments/${id}`);
    return response.data;
  },

  createAssignment: async (tenantId: number, data: AssignmentCreateData): Promise<Assignment> => {
    const response = await apiClient.post(`/tenants/${tenantId}/elearning/assignments`, data);
    return response.data;
  },

  updateAssignment: async (tenantId: number, id: number, data: Partial<AssignmentCreateData>): Promise<Assignment> => {
    const response = await apiClient.put(`/tenants/${tenantId}/elearning/assignments/${id}`, data);
    return response.data;
  },

  deleteAssignment: async (tenantId: number, id: number): Promise<void> => {
    await apiClient.delete(`/tenants/${tenantId}/elearning/assignments/${id}`);
  },

  // Submissions
  getAllSubmissions: async (tenantId: number, assignmentId: number): Promise<{ data: Submission[]; total: number }> => {
    const response = await apiClient.get(`/tenants/${tenantId}/elearning/assignments/${assignmentId}/submissions`);
    return response.data;
  },

  createSubmission: async (tenantId: number, data: SubmissionCreateData): Promise<Submission> => {
    const response = await apiClient.post(`/tenants/${tenantId}/elearning/submissions`, data);
    return response.data;
  },

  gradeSubmission: async (tenantId: number, id: number, score: number): Promise<Submission> => {
    const response = await apiClient.put(`/tenants/${tenantId}/elearning/submissions/${id}/grade`, { score });
    return response.data;
  },
};

