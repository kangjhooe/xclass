import apiClient from './client';

export enum DeviceType {
  FINGERPRINT = 'fingerprint',
  FACE_RECOGNITION = 'face_recognition',
  CARD_READER = 'card_reader',
}

export enum DeviceStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  MAINTENANCE = 'maintenance',
  ERROR = 'error',
}

export enum BiometricType {
  FINGERPRINT = 'fingerprint',
  FACE = 'face',
  CARD = 'card',
}

export interface BiometricDevice {
  id: number;
  instansiId: number;
  name: string;
  deviceId: string;
  type: DeviceType;
  status: DeviceStatus;
  location?: string;
  config?: Record<string, any>;
  ipAddress?: string;
  port?: number;
  apiUrl?: string;
  apiKey?: string;
  lastSyncAt?: string;
  lastError?: string;
  isActive: boolean;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BiometricEnrollment {
  id: number;
  instansiId: number;
  studentId: number;
  deviceId: number;
  biometricId: string;
  status: string;
  biometricData?: Record<string, any>;
  enrolledAt?: string;
  student?: {
    id: number;
    name: string;
    nisn?: string;
  };
}

export interface BiometricAttendance {
  id: number;
  instansiId: number;
  deviceId: number;
  studentId: number;
  biometricId: string;
  type: BiometricType;
  timestamp: string;
  date: string;
  time: string;
  syncStatus: string;
  rawData?: Record<string, any>;
  student?: {
    id: number;
    name: string;
  };
}

export interface SyncStatistics {
  total: number;
  synced: number;
  pending: number;
  failed: number;
  byType: Record<string, number>;
}

export const biometricApi = {
  // Devices
  createDevice: async (
    tenantId: number,
    data: {
      name: string;
      deviceId: string;
      type: DeviceType;
      location?: string;
      config?: Record<string, any>;
      ipAddress?: string;
      port?: number;
      apiUrl?: string;
      apiKey?: string;
      description?: string;
    },
  ): Promise<{ data: BiometricDevice }> => {
    const response = await apiClient.post(`/attendance/biometric/devices`, data, {
      headers: {
        'x-tenant-id': tenantId.toString(),
      },
    });
    return response.data;
  },

  getDevices: async (tenantId: number, isActive?: boolean): Promise<{ data: BiometricDevice[] }> => {
    const response = await apiClient.get(`/attendance/biometric/devices`, {
      params: { isActive },
      headers: {
        'x-tenant-id': tenantId.toString(),
      },
    });
    return response.data;
  },

  getDevice: async (tenantId: number, id: number): Promise<{ data: BiometricDevice }> => {
    const response = await apiClient.get(`/attendance/biometric/devices/${id}`, {
      headers: {
        'x-tenant-id': tenantId.toString(),
      },
    });
    return response.data;
  },

  updateDevice: async (
    tenantId: number,
    id: number,
    data: Partial<BiometricDevice>,
  ): Promise<{ data: BiometricDevice }> => {
    const response = await apiClient.put(`/attendance/biometric/devices/${id}`, data, {
      headers: {
        'x-tenant-id': tenantId.toString(),
      },
    });
    return response.data;
  },

  deleteDevice: async (tenantId: number, id: number): Promise<void> => {
    await apiClient.delete(`/attendance/biometric/devices/${id}`, {
      headers: {
        'x-tenant-id': tenantId.toString(),
      },
    });
  },

  // Enrollments
  enrollStudent: async (
    tenantId: number,
    deviceId: number,
    data: {
      studentId: number;
      biometricId: string;
      biometricData?: Record<string, any>;
    },
  ): Promise<{ data: BiometricEnrollment }> => {
    const response = await apiClient.post(`/attendance/biometric/devices/${deviceId}/enroll`, data, {
      headers: {
        'x-tenant-id': tenantId.toString(),
      },
    });
    return response.data;
  },

  getEnrollments: async (
    tenantId: number,
    deviceId: number,
  ): Promise<{ data: BiometricEnrollment[] }> => {
    const response = await apiClient.get(`/attendance/biometric/devices/${deviceId}/enrollments`, {
      headers: {
        'x-tenant-id': tenantId.toString(),
      },
    });
    return response.data;
  },

  deleteEnrollment: async (tenantId: number, id: number): Promise<void> => {
    await apiClient.delete(`/attendance/biometric/enrollments/${id}`, {
      headers: {
        'x-tenant-id': tenantId.toString(),
      },
    });
  },

  // Sync
  syncAttendance: async (
    tenantId: number,
    deviceId: number,
    data: {
      attendanceData: Array<{
        biometricId: string;
        timestamp: string | Date;
        type?: BiometricType;
        rawData?: Record<string, any>;
      }>;
    },
  ): Promise<{ synced: number; failed: number; errors: string[] }> => {
    const response = await apiClient.post(`/attendance/biometric/devices/${deviceId}/sync`, data, {
      headers: {
        'x-tenant-id': tenantId.toString(),
      },
    });
    return response.data;
  },

  getPendingSyncs: async (
    tenantId: number,
    deviceId: number,
  ): Promise<{ data: BiometricAttendance[] }> => {
    const response = await apiClient.get(`/attendance/biometric/devices/${deviceId}/sync/pending`, {
      headers: {
        'x-tenant-id': tenantId.toString(),
      },
    });
    return response.data;
  },

  getStatistics: async (
    tenantId: number,
    deviceId: number,
    startDate?: string,
    endDate?: string,
  ): Promise<{ data: SyncStatistics }> => {
    const response = await apiClient.get(`/attendance/biometric/devices/${deviceId}/statistics`, {
      params: { startDate, endDate },
      headers: {
        'x-tenant-id': tenantId.toString(),
      },
    });
    return response.data;
  },
};

