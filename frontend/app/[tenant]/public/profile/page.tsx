'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { publicApi } from '@/lib/api/public';
import Link from 'next/link';
import { 
  GraduationCap, 
  MapPin, 
  Phone, 
  Mail, 
  Globe,
  ArrowLeft,
  Award,
  Target,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function PublicProfilePage() {
  const params = useParams();
  const tenantId = params.tenant as string;

  const { data: profile, isLoading } = useQuery({
    queryKey: ['public-profile', tenantId],
    queryFn: () => publicApi.getProfile(tenantId),
    enabled: !!tenantId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat profil...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="text-center text-slate-200">
          <p className="text-base">Profil tidak ditemukan</p>
          <Link href={`/${tenantId}/public`}>
            <Button className="mt-4 rounded-full bg-white/90 text-slate-900 hover:bg-white">
              Kembali ke Beranda
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 py-4">
      <div className="rounded-[32px] border border-white/10 bg-white/90 p-8 text-slate-900 shadow-[0_30px_90px_rgba(15,23,42,0.35)]">
        <div className="flex flex-col gap-6 md:flex-row md:items-start">
          {profile.logo && (
            <div className="flex-shrink-0">
              <img src={profile.logo} alt="Logo Sekolah" className="h-32 w-32 rounded-2xl object-contain shadow-lg" />
            </div>
          )}
          <div className="flex-1 text-center md:text-left">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-sm font-semibold text-blue-600">
              <GraduationCap className="h-4 w-4" />
              Profil Sekolah
            </div>
            <h1 className="text-4xl font-bold text-slate-900">Tentang Kami</h1>
            {profile.description && <p className="mt-4 text-lg text-slate-600">{profile.description}</p>}
          </div>
          <Link href={`/${tenantId}/public`}>
            <Button variant="outline" className="rounded-full border-slate-200 text-slate-900 hover:border-blue-200">
              <ArrowLeft className="h-4 w-4" />
              Kembali
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {profile.address && (
          <div className="glass-panel-light rounded-2xl p-6 text-slate-900">
            <div className="flex items-start gap-4">
              <span className="rounded-2xl bg-blue-100 p-3 text-blue-600">
                <MapPin className="h-6 w-6" />
              </span>
              <div>
                <h3 className="text-lg font-semibold">Alamat</h3>
                <p className="text-slate-600">{profile.address}</p>
              </div>
            </div>
          </div>
        )}

        {profile.phone && (
          <div className="glass-panel-light rounded-2xl p-6 text-slate-900">
            <div className="flex items-start gap-4">
              <span className="rounded-2xl bg-emerald-100 p-3 text-emerald-600">
                <Phone className="h-6 w-6" />
              </span>
              <div>
                <h3 className="text-lg font-semibold">Telepon</h3>
                <a href={`tel:${profile.phone}`} className="text-blue-600 underline-offset-4 hover:underline">
                  {profile.phone}
                </a>
              </div>
            </div>
          </div>
        )}

        {profile.email && (
          <div className="glass-panel-light rounded-2xl p-6 text-slate-900">
            <div className="flex items-start gap-4">
              <span className="rounded-2xl bg-purple-100 p-3 text-purple-600">
                <Mail className="h-6 w-6" />
              </span>
              <div>
                <h3 className="text-lg font-semibold">Email</h3>
                <a href={`mailto:${profile.email}`} className="text-blue-600 underline-offset-4 hover:underline">
                  {profile.email}
                </a>
              </div>
            </div>
          </div>
        )}

        {profile.website && (
          <div className="glass-panel-light rounded-2xl p-6 text-slate-900">
            <div className="flex items-start gap-4">
              <span className="rounded-2xl bg-orange-100 p-3 text-orange-600">
                <Globe className="h-6 w-6" />
              </span>
              <div>
                <h3 className="text-lg font-semibold">Website</h3>
                <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline-offset-4 hover:underline">
                  {profile.website}
                </a>
              </div>
            </div>
          </div>
        )}
      </div>

      {profile.vision && (
        <div className="glass-panel-light rounded-[28px] p-8 text-slate-900">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-2xl bg-blue-100 p-3 text-blue-600">
              <Eye className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-bold">Visi</h2>
          </div>
          <p className="text-lg text-slate-600 whitespace-pre-line">{profile.vision}</p>
        </div>
      )}

      {profile.mission && (
        <div className="glass-panel-light rounded-[28px] p-8 text-slate-900">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-600">
              <Target className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-bold">Misi</h2>
          </div>
          <div className="text-lg text-slate-600 whitespace-pre-line">{profile.mission}</div>
        </div>
      )}
    </div>
  );
}


