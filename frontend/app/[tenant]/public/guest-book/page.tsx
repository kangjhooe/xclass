'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { publicPageApi } from '@/lib/api/public-page';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { UserPlus, ArrowLeft, CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import { useRecaptcha } from '@/lib/utils/recaptcha';
import { checkRateLimit, getRateLimitMessage } from '@/lib/utils/rateLimit';

export default function PublicGuestBookPage() {
  const params = useParams();
  const router = useRouter();
  const tenantId = parseInt(params.tenant as string) || (params.tenant as string);
  const [formData, setFormData] = useState({
    name: '',
    identity_number: '',
    phone: '',
    email: '',
    institution: '',
    purpose: '',
    notes: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const { getToken: getRecaptchaToken } = useRecaptcha();

  const submitMutation = useMutation({
    mutationFn: (data: any) => {
      if (typeof tenantId === 'string') {
        return publicPageApi.submitGuestBook(tenantId as any, data);
      }
      return publicPageApi.submitGuestBook(tenantId, data);
    },
    onSuccess: () => {
      setIsSubmitted(true);
      // Reset form after 3 seconds
      setTimeout(() => {
        setFormData({
          name: '',
          identity_number: '',
          phone: '',
          email: '',
          institution: '',
          purpose: '',
          notes: '',
        });
        setIsSubmitted(false);
      }, 5000);
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Gagal mengirim data. Silakan coba lagi.';
      setError(errorMessage);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate required fields
    if (!formData.name || !formData.purpose) {
      setError('Nama dan Tujuan kunjungan wajib diisi.');
      return;
    }

    // Client-side rate limiting
    const rateLimitKey = `guest-book_${params.tenant}`;
    const rateLimit = checkRateLimit(rateLimitKey, 5, 60000); // 5 submissions per minute
    if (!rateLimit.allowed) {
      setError(
        getRateLimitMessage(rateLimitKey, 5, 60000) ||
          'Terlalu banyak pengiriman. Silakan tunggu beberapa saat dan coba lagi.'
      );
      return;
    }

    try {
      // Get reCAPTCHA token
      const recaptchaToken = await getRecaptchaToken('guest_book');
      
      // Submit with reCAPTCHA token
      submitMutation.mutate({
        ...formData,
        recaptcha_token: recaptchaToken,
      });
    } catch (err: any) {
      setError('Gagal memproses. Silakan coba lagi.');
      console.error('Submit error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link
              href={`/${params.tenant}/public`}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              <span>Kembali ke Halaman Utama</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <UserPlus className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Buku Tamu</h2>
            <p className="text-gray-600">
              Silakan isi formulir di bawah ini untuk mencatat kunjungan Anda.
            </p>
          </div>

          {isSubmitted ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Terima Kasih!</h3>
              <p className="text-gray-600 mb-6">
                Data kunjungan Anda telah berhasil dicatat.
              </p>
              <div className="flex items-center justify-center text-sm text-gray-500">
                <Clock className="w-4 h-4 mr-2" />
                <span>Formulir akan direset dalam beberapa detik...</span>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b">
                  Data Pribadi
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nama Lengkap <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Masukkan nama lengkap"
                      required
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      No. Identitas (KTP/NIK)
                    </label>
                    <Input
                      type="text"
                      value={formData.identity_number}
                      onChange={(e) =>
                        setFormData({ ...formData, identity_number: e.target.value })
                      }
                      placeholder="Masukkan nomor identitas"
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      No. Telepon
                    </label>
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="08xxxxxxxxxx"
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="nama@email.com"
                      className="w-full"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Instansi/Organisasi
                    </label>
                    <Input
                      type="text"
                      value={formData.institution}
                      onChange={(e) =>
                        setFormData({ ...formData, institution: e.target.value })
                      }
                      placeholder="Nama instansi atau organisasi"
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Visit Information */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b">
                  Informasi Kunjungan
                </h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tujuan Kunjungan <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      value={formData.purpose}
                      onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                      placeholder="Contoh: Rapat koordinasi, Kunjungan kerja, dll"
                      required
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Catatan Tambahan
                    </label>
                    <Textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Tambahkan catatan jika diperlukan"
                      rows={4}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4 pt-6 border-t">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => router.push(`/${params.tenant}/public`)}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  loading={submitMutation.isPending}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                >
                  {submitMutation.isPending ? 'Mengirim...' : 'Kirim Data'}
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-blue-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Informasi</h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  Data yang Anda isi akan dicatat secara otomatis. Pastikan data yang Anda
                  masukkan sudah benar dan lengkap.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

