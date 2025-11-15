import apiClient from './client';

export interface Province {
  code: string;
  name: string;
}

export interface Regency {
  code: string;
  name: string;
  provinceCode: string;
}

export interface District {
  code: string;
  name: string;
  regencyCode: string;
}

export interface Village {
  code: string;
  name: string;
  districtCode: string;
}

export const wilayahIndonesiaApi = {
  getProvinces: async (): Promise<Province[]> => {
    const response = await apiClient.get('/wilayah-indonesia/provinces');
    return response.data.data;
  },

  getRegencies: async (provinceCode: string): Promise<Regency[]> => {
    if (!provinceCode) return [];
    const response = await apiClient.get('/wilayah-indonesia/regencies', {
      params: { provinceCode },
    });
    return response.data.data;
  },

  getDistricts: async (regencyCode: string): Promise<District[]> => {
    if (!regencyCode) return [];
    const response = await apiClient.get('/wilayah-indonesia/districts', {
      params: { regencyCode },
    });
    return response.data.data;
  },

  getVillages: async (districtCode: string): Promise<Village[]> => {
    if (!districtCode) return [];
    const response = await apiClient.get('/wilayah-indonesia/villages', {
      params: { districtCode },
    });
    return response.data.data;
  },
};

