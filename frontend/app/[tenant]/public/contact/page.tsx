'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { publicApi } from '@/lib/api/public';
import Link from 'next/link';
import { 
  Mail, 
  ArrowLeft,
  Phone,
  MapPin,
  Globe,
  Send,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useToastStore } from '@/lib/store/toast';

export default function PublicContactPage() {
  const params = useParams();
  const tenantId = params.tenant as string;
  const { success, error: showError } = useToastStore();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ['public-profile', tenantId],
    queryFn: () => publicApi.getProfile(tenantId),
    enabled: !!tenantId,
  });

  const submitMutation = useMutation({
    mutationFn: (data: typeof formData) => publicApi.submitContact(tenantId, data),
    onSuccess: () => {
      success('Pesan berhasil dikirim! Kami akan menghubungi Anda segera.');
      setIsSubmitted(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
      });
      setTimeout(() => setIsSubmitted(false), 5000);
    },
    onError: (err: any) => {
      showError(err?.response?.data?.message || 'Gagal mengirim pesan. Silakan coba lagi.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      showError('Harap lengkapi semua field yang wajib diisi.');
      return;
    }
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      showError('Format email tidak valid.');
      return;
    }
    submitMutation.mutate(formData);
  };

  return (
    <div className="grid gap-10 py-4 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-6 rounded-[32px] border border-white/10 bg-white/90 p-8 text-slate-900 shadow-[0_30px_90px_rgba(15,23,42,0.25)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1 text-sm font-semibold text-blue-600">
              <Mail className="h-4 w-4" />
              Kontak Sekolah
            </p>
            <h2 className="mt-4 text-3xl font-bold text-slate-900">Hubungi Kami</h2>
            <p className="mt-2 text-slate-600">
              Kami siap membantu menjawab pertanyaan Anda melalui berbagai kanal komunikasi.
            </p>
          </div>
          <Link href={`/${tenantId}/public`}>
            <Button variant="outline" className="rounded-full border-slate-200 text-slate-900 hover:border-blue-200">
              <ArrowLeft className="h-4 w-4" />
              Kembali
            </Button>
          </Link>
        </div>

        {profile && (
          <div className="space-y-5">
            {profile.address && (
              <div className="glass-panel-light rounded-2xl p-5">
                <div className="flex items-start gap-4">
                  <span className="rounded-2xl bg-blue-100 p-3 text-blue-600">
                    <MapPin className="h-6 w-6" />
                  </span>
                  <div>
                    <p className="text-sm uppercase tracking-wide text-slate-500">Alamat</p>
                    <p className="text-lg font-semibold text-slate-900">{profile.address}</p>
                  </div>
                </div>
              </div>
            )}

            {profile.phone && (
              <div className="glass-panel-light rounded-2xl p-5">
                <div className="flex items-start gap-4">
                  <span className="rounded-2xl bg-emerald-100 p-3 text-emerald-600">
                    <Phone className="h-6 w-6" />
                  </span>
                  <div>
                    <p className="text-sm uppercase tracking-wide text-slate-500">Telepon</p>
                    <a href={`tel:${profile.phone}`} className="text-lg font-semibold text-blue-600 hover:underline">
                      {profile.phone}
                    </a>
                  </div>
                </div>
              </div>
            )}

            {profile.email && (
              <div className="glass-panel-light rounded-2xl p-5">
                <div className="flex items-start gap-4">
                  <span className="rounded-2xl bg-purple-100 p-3 text-purple-600">
                    <Mail className="h-6 w-6" />
                  </span>
                  <div>
                    <p className="text-sm uppercase tracking-wide text-slate-500">Email</p>
                    <a href={`mailto:${profile.email}`} className="text-lg font-semibold text-blue-600 hover:underline">
                      {profile.email}
                    </a>
                  </div>
                </div>
              </div>
            )}

            {profile.website && (
              <div className="glass-panel-light rounded-2xl p-5">
                <div className="flex items-start gap-4">
                  <span className="rounded-2xl bg-orange-100 p-3 text-orange-600">
                    <Globe className="h-6 w-6" />
                  </span>
                  <div>
                    <p className="text-sm uppercase tracking-wide text-slate-500">Website</p>
                    <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-lg font-semibold text-blue-600 hover:underline">
                      {profile.website}
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="glass-panel rounded-[32px] border border-white/20 bg-white/5 p-8 text-white">
        <h2 className="text-2xl font-bold">Kirim Pesan</h2>
        <p className="mt-2 text-sm text-slate-200">Lengkapi formulir berikut dan tim kami akan segera menghubungi Anda.</p>

        {isSubmitted && (
          <div className="mt-6 flex items-center gap-2 rounded-2xl border border-emerald-300/30 bg-emerald-500/10 p-4 text-sm text-emerald-200">
            <CheckCircle className="h-5 w-5" />
            Pesan berhasil dikirim!
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-200">
              Nama <span className="text-rose-300">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder:text-white/50 focus:border-blue-300 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-200">
              Email <span className="text-rose-300">*</span>
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder:text-white/50 focus:border-blue-300 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-200">Telepon</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder:text-white/50 focus:border-blue-300 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-200">
              Subjek <span className="text-rose-300">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder:text-white/50 focus:border-blue-300 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-200">
              Pesan <span className="text-rose-300">*</span>
            </label>
            <textarea
              required
              rows={5}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder:text-white/50 focus:border-blue-300 focus:outline-none"
            />
          </div>

          <Button
            type="submit"
            disabled={submitMutation.isPending}
            className="w-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 py-3 text-white shadow-lg shadow-blue-500/30"
          >
            {submitMutation.isPending ? (
              'Mengirim...'
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Kirim Pesan
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
