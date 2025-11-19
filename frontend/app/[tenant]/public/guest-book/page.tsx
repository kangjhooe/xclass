'use client';

import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { publicPageApi } from '@/lib/api/public-page';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import {
  UserPlus,
  ArrowLeft,
  CheckCircle,
  Clock,
  Camera,
  RefreshCw,
  Trash2,
  Image as ImageIcon,
} from 'lucide-react';
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
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { getToken: getRecaptchaToken } = useRecaptcha();
  const MAX_PHOTO_SIZE = 5 * 1024 * 1024; // 5MB

  useEffect(() => {
    return () => {
      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('Format foto tidak valid. Gunakan file gambar (JPG/PNG/HEIC).');
      event.target.value = '';
      return;
    }

    if (file.size > MAX_PHOTO_SIZE) {
      setError('Ukuran foto terlalu besar. Maksimal 5MB.');
      event.target.value = '';
      return;
    }

    setError('');
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }
    const previewUrl = URL.createObjectURL(file);
    setPhotoPreview(previewUrl);
    setPhotoFile(file);
  };

  const triggerCameraCapture = () => {
    setError('');
    fileInputRef.current?.click();
  };

  const clearPhoto = () => {
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }
    setPhotoPreview(null);
    setPhotoFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const submitMutation = useMutation({
    mutationFn: (data: FormData) => {
      if (typeof tenantId === 'string') {
        return publicPageApi.submitGuestBook(tenantId as any, data);
      }
      return publicPageApi.submitGuestBook(tenantId, data);
    },
    onSuccess: () => {
      setIsSubmitted(true);
      clearPhoto();
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
        clearPhoto();
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
      
      const payload = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          payload.append(key, value);
        }
      });

      if (recaptchaToken) {
        payload.append('recaptcha_token', recaptchaToken);
      }

      if (photoFile) {
        const filename = photoFile.name || `guest-book-photo-${Date.now()}.jpg`;
        payload.append('photo', photoFile, filename);
      }

      // Submit with form data (supports file upload)
      submitMutation.mutate(payload);
    } catch (err: any) {
      setError('Gagal memproses. Silakan coba lagi.');
      console.error('Submit error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-white/60 sticky top-0 z-50 animate-slide-in-from-top">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link
              href={`/${params.tenant}/public`}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors hover:scale-105"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              <span>Kembali ke Halaman Utama</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 lg:p-10 border border-gray-100 animate-fade-in">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full mb-4 shadow-lg animate-pulse">
              <UserPlus className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Buku Tamu
            </h2>
            <p className="text-gray-600 text-lg">
              Silakan isi formulir di bawah ini untuk mencatat kunjungan Anda.
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          {isSubmitted ? (
            <div className="text-center py-12 animate-fade-in">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full mb-6 shadow-xl animate-scale-in">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">Terima Kasih!</h3>
              <p className="text-gray-600 mb-6 text-lg">
                Data kunjungan Anda telah berhasil dicatat.
              </p>
              <div className="flex items-center justify-center text-sm text-gray-500 bg-gray-50 rounded-lg p-3 inline-flex">
                <Clock className="w-4 h-4 mr-2 animate-pulse" />
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

              {/* Photo Capture */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b">
                  Dokumentasi Kunjungan (Opsional)
                </h3>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handlePhotoChange}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                      Gunakan kamera perangkat untuk mengambil foto diri atau kartu identitas sebagai bukti
                      kunjungan. Foto hanya akan digunakan oleh petugas keamanan.
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={triggerCameraCapture}
                      className="w-full md:w-auto border-dashed border-2 border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100"
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      {photoFile ? 'Ambil Ulang Foto' : 'Ambil Foto dari Kamera'}
                    </Button>
                    {photoFile && (
                      <div className="flex flex-wrap gap-3">
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={triggerCameraCapture}
                          className="bg-white border border-gray-300 text-gray-700"
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Ambil Lagi
                        </Button>
                        <Button
                          type="button"
                          variant="danger"
                          size="sm"
                          onClick={clearPhoto}
                          className="bg-red-50 text-red-600 hover:bg-red-100"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Hapus Foto
                        </Button>
                      </div>
                    )}
                    <p className="text-xs text-gray-500">
                      Format yang didukung: JPG, JPEG, PNG. Ukuran maksimal {Math.round(MAX_PHOTO_SIZE / (1024 * 1024))}MB.
                    </p>
                  </div>
                  <div className="border-2 border-dashed border-gray-200 rounded-2xl p-4 bg-gray-50 flex items-center justify-center min-h-[220px]">
                    {photoPreview ? (
                      <img
                        src={photoPreview}
                        alt="Foto tamu"
                        className="max-h-56 w-auto rounded-xl shadow-lg object-contain"
                      />
                    ) : (
                      <div className="text-center text-gray-500 space-y-3">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white shadow">
                          <ImageIcon className="w-7 h-7" />
                        </div>
                        <p className="text-sm font-medium">Belum ada foto terlampir</p>
                        <p className="text-xs">Tekan tombol di samping untuk mengambil foto dari kamera</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4 pt-6 border-t">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => router.push(`/${params.tenant}/public`)}
                  className="hover:scale-105 transition-transform"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  loading={submitMutation.isPending}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                >
                  {submitMutation.isPending ? 'Mengirim...' : 'Kirim Data'}
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-6 shadow-lg animate-fade-in">
          <div className="flex items-start">
            <div className="flex-shrink-0 bg-gradient-to-br from-blue-500 to-purple-500 p-2 rounded-lg">
              <svg
                className="h-5 w-5 text-white"
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
              <h3 className="text-sm font-bold text-blue-800 mb-1">Informasi</h3>
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

