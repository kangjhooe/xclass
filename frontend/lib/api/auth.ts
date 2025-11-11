import apiClient from './client';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  npsn: string;
  name: string;
  jenisInstansi: string;
  jenjang: string;
  status: string;
  email: string;
  password: string;
  password_confirmation: string;
  picName: string;
  picWhatsapp: string;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: string;
  instansiId?: number;
  tenant_id?: number;
  [key: string]: any;
}

export interface LoginResponse {
  access_token: string;
  user: AuthUser;
}

export interface RegisterResponse {
  access_token: string;
  user: AuthUser;
  tenant: {
    id: number;
    npsn?: string;
    name?: string;
  };
}

export const authApi = {
  async login(payload: LoginPayload): Promise<LoginResponse> {
    const response = await apiClient.post('/auth/login', payload);
    return response.data;
  },

  async register(payload: RegisterPayload): Promise<RegisterResponse> {
    const response = await apiClient.post('/auth/register', payload);
    return response.data;
  },

  async getProfile() {
    const response = await apiClient.get('/auth/profile');
    return response.data;
  },
};
