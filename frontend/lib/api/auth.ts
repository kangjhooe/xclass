import apiClient from './client';

export interface LoginPayload {
  email?: string;
  nik?: string; // Untuk siswa atau guru
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

export interface RegisterPpdbPayload {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  npsn: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  email: string;
  newPassword: string;
  confirmPassword: string;
  resetToken?: string;
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

  async registerPpdb(payload: RegisterPpdbPayload): Promise<RegisterResponse> {
    const response = await apiClient.post('/auth/register-ppdb', payload);
    return response.data;
  },

  async getProfile() {
    const response = await apiClient.get('/auth/profile');
    return response.data;
  },

  async forgotPassword(payload: ForgotPasswordPayload) {
    const response = await apiClient.post('/auth/forgot-password', payload);
    return response.data;
  },

  async resetPassword(payload: ResetPasswordPayload) {
    const response = await apiClient.post('/auth/reset-password', payload);
    return response.data;
  },
};
