'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authApi, LoginPayload } from '@/lib/api/auth';
import { useAuthStore } from '@/lib/store/auth';
import { useToastStore } from '@/lib/store/toast';
import { Button } from '@/components/ui/Button';

export default function PpdbLoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const { success, error: showError } = useToastStore();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<LoginPayload>({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await authApi.login(formData);
      
      // Simpan token dan user
      localStorage.setItem('token', response.access_token);
      setAuth(response.access_token, response.user);
      
      success('Login berhasil!');
      
      // Redirect berdasarkan role
      const tenantId = response.user.instansiId || response.user.tenant_id;
      if (response.user.role === 'ppdb_applicant') {
        router.push(`/${tenantId}/ppdb/dashboard`);
      } else {
        router.push(`/${tenantId}/dashboard`);
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Email atau password salah';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white rounded-2xl shadow-xl p-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Masuk PPDB
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Masuk ke akun Anda untuk melengkapi pendaftaran
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
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
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <Link href="/ppdb/forgot-password" className="text-xs text-blue-600 hover:text-blue-500">
                  Lupa password?
                </Link>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Masukkan password"
              />
            </div>
          </div>

          <div>
            <Button
              type="submit"
              className="w-full"
              loading={isLoading}
            >
              Masuk
            </Button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Belum punya akun?{' '}
              <Link href="/ppdb/register" className="font-medium text-blue-600 hover:text-blue-500">
                Daftar di sini
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

