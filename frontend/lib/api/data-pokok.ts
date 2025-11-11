import apiClient from './client';

export interface DataPokok {
  id: number;
  instansiId: number;
  npsn?: string;
  name: string;
  type?: string;
  jenjang?: string;
  kurikulum?: string;
  tahunPelajaranAktif?: string;
  address?: string;
  village?: string;
  subDistrict?: string;
  district?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  phone?: string;
  email?: string;
  website?: string;
  principalName?: string;
  principalNip?: string;
  principalPhone?: string;
  principalEmail?: string;
  description?: string;
  vision?: string;
  mission?: string;
  accreditation?: string;
  accreditationDate?: string;
  licenseNumber?: string;
  licenseDate?: string;
  establishedDate?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DataPokokCreateData {
  npsn?: string;
  name: string;
  type?: string;
  jenjang?: string;
  kurikulum?: string;
  tahunPelajaranAktif?: string;
  address?: string;
  village?: string;
  subDistrict?: string;
  district?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  phone?: string;
  email?: string;
  website?: string;
  principalName?: string;
  principalNip?: string;
  principalPhone?: string;
  principalEmail?: string;
  description?: string;
  vision?: string;
  mission?: string;
  accreditation?: string;
  accreditationDate?: string;
  licenseNumber?: string;
  licenseDate?: string;
  establishedDate?: string;
  notes?: string;
}

export const dataPokokApi = {
  get: async (tenantId: number): Promise<DataPokok> => {
    const response = await apiClient.get(`/data-pokok`, {
      headers: {
        'x-tenant-id': tenantId.toString(),
      },
    });
    return response.data;
  },

  create: async (tenantId: number, data: DataPokokCreateData): Promise<DataPokok> => {
    const response = await apiClient.post(`/data-pokok`, data, {
      headers: {
        'x-tenant-id': tenantId.toString(),
      },
    });
    return response.data;
  },

  update: async (tenantId: number, data: Partial<DataPokokCreateData>): Promise<DataPokok> => {
    const response = await apiClient.patch(`/data-pokok`, data, {
      headers: {
        'x-tenant-id': tenantId.toString(),
      },
    });
    return response.data;
  },

  delete: async (tenantId: number): Promise<void> => {
    await apiClient.delete(`/data-pokok`, {
      headers: {
        'x-tenant-id': tenantId.toString(),
      },
    });
  },
};

