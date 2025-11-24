import apiClient from './client';

export interface Teacher {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  employeeNumber?: string;
  nip?: string;
  nik?: string;
  nuptk?: string;
  gender?: string;
  birthDate?: string;
  birthPlace?: string;
  address?: string;
  education?: string;
  specialization?: string;
  isActive?: boolean;
  isMainTenant?: boolean;
  instansiId?: number;
  positionId?: number;
  position?: { id: number; name: string };
  createdAt?: string;
  updatedAt?: string;
  created_at?: string;
  updated_at?: string;
  
  // Data Pribadi Tambahan
  pageId?: string;
  npk?: string;
  motherName?: string;
  
  // Detail Alamat
  province?: string;
  cityDistrict?: string;
  subDistrict?: string;
  village?: string;
  postalCode?: string;
  
  // Data Pendidikan
  educationLevel?: string;
  studyProgramGroup?: string;
  
  // Status Kepegawaian
  employmentStatusPtk?: string;
  employmentStatus?: string;
  employmentRank?: string;
  tmtSkCpns?: string;
  tmtSkAwal?: string;
  tmtSkTerakhir?: string;
  appointingInstitution?: string;
  assignmentStatus?: string;
  baseSalary?: number;
  workLocationStatus?: string;
  satminkalType?: string;
  satminkalNpsn?: string;
  satminkalIdentity?: string;
  inpassingStatus?: string;
  tmtInpassing?: string;
  
  // Tugas dan Mengajar
  mainDutyEducator?: string;
  additionalDuty?: string;
  mainDutySchool?: string;
  mainSubject?: string;
  totalTeachingHours?: number;
  dutyType?: string;
  teachingHoursEquivalent?: number;
  teachOtherSchool?: boolean;
  otherWorkLocationType?: string;
  otherWorkLocationNpsn?: string;
  otherSchoolSubject?: string;
  otherSchoolHours?: number;
  
  // Informasi Sertifikasi
  certificationParticipationStatus?: string;
  certificationPassStatus?: string;
  certificationYear?: number;
  certifiedSubject?: string;
  nrg?: string;
  nrgSkNumber?: string;
  nrgSkDate?: string;
  certificationParticipantNumber?: string;
  certificationType?: string;
  certificationPassDate?: string;
  educatorCertificateNumber?: string;
  certificateIssueDate?: string;
  lptkName?: string;
  
  // Informasi Tunjangan
  tpgRecipientStatus?: string;
  tpgStartYear?: number;
  tpgAmount?: number;
  tfgRecipientStatus?: string;
  tfgStartYear?: number;
  tfgAmount?: number;
  
  // Penghargaan dan Pelatihan
  hasReceivedAward?: boolean;
  highestAward?: string;
  awardField?: string;
  awardLevel?: string;
  awardYear?: number;
  competencyTraining?: string;
  trainingParticipation1?: string;
  trainingYear1?: number;
  trainingParticipation2?: string;
  trainingYear2?: number;
  trainingParticipation3?: string;
  trainingYear3?: number;
  trainingParticipation4?: string;
  trainingYear4?: number;
  trainingParticipation5?: string;
  trainingYear5?: number;
  
  // Kompetensi Kepala Madrasah
  personalityCompetency?: number;
  managerialCompetency?: number;
  entrepreneurshipCompetency?: number;
  supervisionCompetency?: number;
  socialCompetency?: number;
  
  subjects?: Array<{ id: number; name: string; code?: string }>;
  classRooms?: Array<{ 
    id: number; 
    name: string; 
    level?: string;
    roomNumber?: string;
    capacity?: number;
    academicYear?: string;
    isActive?: boolean;
  }>;
  schedules?: Array<{ 
    id: number; 
    dayOfWeek: number; 
    startTime: string; 
    endTime: string;
    room?: string;
    isActive?: boolean;
    classRoom?: { id: number; name: string; level?: string };
    subject?: { id: number; name: string; code?: string };
  }>;
}

export interface TeacherCreateData {
  name: string;
  email?: string;
  phone?: string;
  employeeNumber?: string;
  nip?: string;
  nik?: string;
  nuptk?: string;
  gender?: string;
  birthDate?: string;
  birthPlace?: string;
  address?: string;
  education?: string;
  specialization?: string;
  isActive?: boolean;
  isMainTenant?: boolean;
  positionId?: number;
  
  // Data Pribadi Tambahan
  pageId?: string;
  npk?: string;
  motherName?: string;
  
  // Detail Alamat
  province?: string;
  cityDistrict?: string;
  subDistrict?: string;
  village?: string;
  postalCode?: string;
  
  // Data Pendidikan
  educationLevel?: string;
  studyProgramGroup?: string;
  
  // Status Kepegawaian
  employmentStatusPtk?: string;
  employmentStatus?: string;
  employmentRank?: string;
  tmtSkCpns?: string;
  tmtSkAwal?: string;
  tmtSkTerakhir?: string;
  appointingInstitution?: string;
  assignmentStatus?: string;
  baseSalary?: number;
  workLocationStatus?: string;
  satminkalType?: string;
  satminkalNpsn?: string;
  satminkalIdentity?: string;
  inpassingStatus?: string;
  tmtInpassing?: string;
  
  // Tugas dan Mengajar
  mainDutyEducator?: string;
  additionalDuty?: string;
  mainDutySchool?: string;
  mainSubject?: string;
  totalTeachingHours?: number;
  dutyType?: string;
  teachingHoursEquivalent?: number;
  teachOtherSchool?: boolean;
  otherWorkLocationType?: string;
  otherWorkLocationNpsn?: string;
  otherSchoolSubject?: string;
  otherSchoolHours?: number;
  
  // Informasi Sertifikasi
  certificationParticipationStatus?: string;
  certificationPassStatus?: string;
  certificationYear?: number;
  certifiedSubject?: string;
  nrg?: string;
  nrgSkNumber?: string;
  nrgSkDate?: string;
  certificationParticipantNumber?: string;
  certificationType?: string;
  certificationPassDate?: string;
  educatorCertificateNumber?: string;
  certificateIssueDate?: string;
  lptkName?: string;
  
  // Informasi Tunjangan
  tpgRecipientStatus?: string;
  tpgStartYear?: number;
  tpgAmount?: number;
  tfgRecipientStatus?: string;
  tfgStartYear?: number;
  tfgAmount?: number;
  
  // Penghargaan dan Pelatihan
  hasReceivedAward?: boolean;
  highestAward?: string;
  awardField?: string;
  awardLevel?: string;
  awardYear?: number;
  competencyTraining?: string;
  trainingParticipation1?: string;
  trainingYear1?: number;
  trainingParticipation2?: string;
  trainingYear2?: number;
  trainingParticipation3?: string;
  trainingYear3?: number;
  trainingParticipation4?: string;
  trainingYear4?: number;
  trainingParticipation5?: string;
  trainingYear5?: number;
  
  // Kompetensi Kepala Madrasah
  personalityCompetency?: number;
  managerialCompetency?: number;
  entrepreneurshipCompetency?: number;
  supervisionCompetency?: number;
  socialCompetency?: number;
}

export const teachersApi = {
  getAll: async (
    tenantId: number,
    params?: {
      search?: string;
      page?: number;
      limit?: number;
      isActive?: boolean;
      gender?: string;
    },
  ): Promise<{ data: Teacher[]; total: number; page?: number; limit?: number; totalPages?: number }> => {
    const response = await apiClient.get(`/tenants/${tenantId}/teachers`, { params });
    return response.data;
  },

  getById: async (tenantId: number, id: number): Promise<Teacher> => {
    const response = await apiClient.get(`/tenants/${tenantId}/teachers/${id}`);
    return response.data;
  },

  create: async (tenantId: number, data: TeacherCreateData): Promise<Teacher> => {
    const response = await apiClient.post(`/tenants/${tenantId}/teachers`, data);
    return response.data;
  },

  update: async (tenantId: number, id: number, data: Partial<TeacherCreateData>): Promise<Teacher> => {
    const response = await apiClient.patch(`/tenants/${tenantId}/teachers/${id}`, data);
    return response.data;
  },

  delete: async (tenantId: number, id: number): Promise<void> => {
    await apiClient.delete(`/tenants/${tenantId}/teachers/${id}`);
  },

  // Export methods
  exportExcel: async (tenantId: number, search?: string): Promise<void> => {
    const params = search ? { search } : {};
    const response = await apiClient.get(`/tenants/${tenantId}/teachers/export/excel`, {
      params,
      responseType: 'blob',
    });

    // Create download link
    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url_blob = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url_blob;
    link.download = `teachers_${new Date().toISOString().split('T')[0]}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url_blob);
  },

  exportPDF: async (tenantId: number, search?: string): Promise<void> => {
    const params = search ? { search } : {};
    const response = await apiClient.get(`/tenants/${tenantId}/teachers/export/pdf`, {
      params,
      responseType: 'blob',
    });

    // Create download link
    const blob = new Blob([response.data], {
      type: 'application/pdf',
    });
    const url_blob = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url_blob;
    link.download = `teachers_${new Date().toISOString().split('T')[0]}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url_blob);
  },

  // Import methods
  importExcel: async (tenantId: number, file: File, sheetIndex?: number, startRow?: number): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);

    const params: Record<string, string> = {};
    if (sheetIndex !== undefined) {
      params.sheetIndex = String(sheetIndex);
    }
    if (startRow !== undefined) {
      params.startRow = String(startRow);
    }

    const response = await apiClient.post(`/tenants/${tenantId}/teachers/import/excel`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      params,
    });

    return response.data;
  },

  updateSubjects: async (tenantId: number, id: number, subjectIds: number[]): Promise<Teacher> => {
    const response = await apiClient.patch(`/tenants/${tenantId}/teachers/${id}/subjects`, { subjectIds });
    return response.data;
  },
};
