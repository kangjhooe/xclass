'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authApi, ForgotPasswordPayload } from '@/lib/api/auth';
import { useToastStore } from '@/lib/store/toast';
import { Button } from '@/components/ui/Button';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { success, error: showError } = useToastStore();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [showResetForm, setShowResetForm] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await authApi.forgotPassword({ email });
      success(response.message || 'Instruksi reset password telah dikirim.');
      
      // Jika ada resetToken (development mode), tampilkan form reset
      if (response.resetToken) {
        setResetToken(response.resetToken);
        setShowResetForm(true);
      } else {
        // Production mode - redirect ke login
        setTimeout(() => {
          router.push('/ppdb/login');
        }, 2000);
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Gagal mengirim instruksi reset password';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Password dan konfirmasi password tidak cocok');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password minimal 8 karakter');
      return;
    }

    setIsLoading(true);

    try {
      await authApi.resetPassword({
        email,
        newPassword,
        confirmPassword,
        resetToken: resetToken || undefined,
      });
      
      success('Password berhasil direset. Silakan login dengan password baru.');
      setTimeout(() => {
        router.push('/ppdb/login');
      }, 2000);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Gagal mereset password';
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
            {showResetForm ? 'Reset Password' : 'Lupa Password'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {showResetForm 
              ? 'Masukkan password baru Anda' 
              : 'Masukkan email Anda untuk mendapatkan instruksi reset password'}
          </p>
        </div>

        {!showResetForm ? (
          <form className="mt-8 space-y-6" onSubmit={handleForgotPassword}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Masukkan email"
              />
            </div>

            <div>
              <Button
                type="submit"
                className="w-full"
                loading={isLoading}
              >
                Kirim Instruksi Reset
              </Button>
            </div>

            <div className="text-center">
              <Link href="/ppdb/login" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                Kembali ke halaman login
              </Link>
            </div>
          </form>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleResetPassword}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                Password Baru
              </label>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                autoComplete="new-password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Minimal 8 karakter"
                minLength={8}
              />
              {newPassword && newPassword.length < 8 && (
                <p className="mt-1 text-xs text-yellow-600">Password minimal 8 karakter</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Konfirmasi Password Baru
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Ulangi password baru"
              />
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="mt-1 text-xs text-red-600">Password tidak cocok</p>
              )}
            </div>

            <div>
              <Button
                type="submit"
                className="w-full"
                loading={isLoading}
              >
                Reset Password
              </Button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setShowResetForm(false);
                  setResetToken('');
                  setNewPassword('');
                  setConfirmPassword('');
                }}
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                Kembali
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

