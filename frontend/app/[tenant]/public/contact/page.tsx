'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { publicPageApi } from '@/lib/api/public-page';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Mail, Send, CheckCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ContactPage() {
  const params = useParams();
  const router = useRouter();
  const tenantId = parseInt(params.tenant as string) || (params.tenant as string);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const submitMutation = useMutation({
    mutationFn: (data: any) => {
      if (typeof tenantId === 'string') {
        // If tenantId is NPSN, we need to convert it
        // For now, we'll use it as is and let backend handle it
        return publicPageApi.submitContactForm(tenantId as any, data);
      }
      return publicPageApi.submitContactForm(tenantId, data);
    },
    onSuccess: () => {
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      alert('Pesan berhasil dikirim! Kami akan menghubungi Anda segera.');
    },
    onError: (error: any) => {
      alert(error?.response?.data?.message || 'Gagal mengirim pesan. Silakan coba lagi.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      alert('Mohon lengkapi semua field yang wajib diisi');
      return;
    }
    submitMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href={`/${params.tenant}/public`} className="flex items-center gap-2 text-gray-700 hover:text-blue-600">
              <ArrowLeft className="w-5 h-5" />
              <span>Kembali</span>
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Hubungi Kami</h1>
            <div className="w-20"></div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <Mail className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Kirim Pesan</h2>
            <p className="text-gray-600">
              Silakan isi form di bawah ini untuk menghubungi kami. Kami akan merespons secepat mungkin.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Nama Lengkap *"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="Masukkan nama lengkap"
              />

              <Input
                label="Email *"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                placeholder="nama@email.com"
              />
            </div>

            <Input
              label="Nomor Telepon (Opsional)"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="08xxxxxxxxxx"
            />

            <Input
              label="Subjek *"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              required
              placeholder="Subjek pesan"
            />

            <Textarea
              label="Pesan *"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              required
              rows={6}
              placeholder="Tulis pesan Anda di sini..."
            />

            <div className="flex justify-end gap-4">
              <Link href={`/${params.tenant}/public`}>
                <Button type="button" variant="outline">
                  Batal
                </Button>
              </Link>
              <Button type="submit" loading={submitMutation.isPending} className="flex items-center gap-2">
                <Send className="w-4 h-4" />
                Kirim Pesan
              </Button>
            </div>
          </form>
        </div>

        {/* Info Section */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi Kontak</h3>
          <p className="text-gray-600">
            Anda juga dapat menghubungi kami melalui email atau telepon yang tertera di halaman profil sekolah.
          </p>
        </div>
      </div>
    </div>
  );
}

