'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi, RegisterPpdbPayload } from '@/lib/api/auth';
import { useToastStore } from '@/lib/store/toast';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function PpdbRegisterPage() {
  const router = useRouter();
  const { success, error: showError } = useToastStore();
  const { setAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<RegisterPpdbPayload>({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    npsn: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    try {
      const response = await authApi.registerPpdb(formData);
      
      // Simpan token dan user ke auth store
      localStorage.setItem('token', response.access_token);
      setAuth(response.access_token, response.user);
      
      success('Registrasi berhasil! Silakan lengkapi data pendaftaran Anda.');
      
      // Redirect ke dashboard pendaftar
      const tenantId = response.tenant?.id || response.user.instansiId;
      if (tenantId) {
        router.push(`/${tenantId}/ppdb/dashboard`);
      } else {
        showError('Terjadi kesalahan. Silakan login ulang.');
        router.push('/ppdb/login');
      }
    } catch (err: any) {
      const errorData = err?.response?.data;
      
      if (errorData?.errors) {
        const backendErrors: Record<string, string> = {};
        Object.keys(errorData.errors).forEach((key) => {
          backendErrors[key] = Array.isArray(errorData.errors[key])
            ? errorData.errors[key][0]
            : errorData.errors[key];
        });
        setErrors(backendErrors);
      } else {
        showError(errorData?.message || 'Registrasi gagal. Silakan coba lagi.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white rounded-2xl shadow-xl p-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Daftar PPDB
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Buat akun untuk mendaftar sebagai calon siswa baru
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
              <div>
                <label htmlFor="npsn" className="block text-sm font-medium text-gray-700">
                  NPSN Sekolah Tujuan <span className="text-red-500">*</span>
                </label>
                <input
                  id="npsn"
                  name="npsn"
                  type="text"
                  required
                  value={formData.npsn}
                  onChange={(e) => setFormData({ ...formData, npsn: e.target.value })}
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Masukkan NPSN sekolah (8 digit)"
                  pattern="[0-9]{8}"
                  maxLength={8}
                />
                {errors.npsn && (
                  <p className="mt-1 text-sm text-red-600">{errors.npsn}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">NPSN adalah 8 digit nomor identitas sekolah</p>
              </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Nama Lengkap <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Masukkan nama lengkap"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Masukkan email"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password <span className="text-red-500">*</span>
              </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Minimal 8 karakter"
                  minLength={8}
                />
                {formData.password && formData.password.length < 8 && (
                  <p className="mt-1 text-xs text-yellow-600">Password minimal 8 karakter</p>
                )}
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            <div>
              <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700">
                Konfirmasi Password <span className="text-red-500">*</span>
              </label>
                <input
                  id="password_confirmation"
                  name="password_confirmation"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.password_confirmation}
                  onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Ulangi password"
                />
                {formData.password_confirmation && formData.password !== formData.password_confirmation && (
                  <p className="mt-1 text-xs text-red-600">Password tidak cocok</p>
                )}
                {errors.password_confirmation && (
                  <p className="mt-1 text-sm text-red-600">{errors.password_confirmation}</p>
                )}
            </div>
          </div>

          <div>
            <Button
              type="submit"
              className="w-full"
              loading={isLoading}
            >
              Daftar
            </Button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Sudah punya akun?{' '}
              <Link href="/ppdb/login" className="font-medium text-blue-600 hover:text-blue-500">
                Masuk di sini
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

