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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Profil tidak ditemukan</p>
          <Link href={`/${tenantId}/public`}>
            <Button className="mt-4">Kembali ke Beranda</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href={`/${tenantId}/public`}>
                <Button variant="outline" className="flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Kembali
                </Button>
              </Link>
            </div>
            <nav className="hidden md:flex items-center gap-4">
              <Link href={`/${tenantId}/public`} className="text-gray-700 hover:text-blue-600 font-medium">
                Beranda
              </Link>
              <Link href={`/${tenantId}/public/news`} className="text-gray-700 hover:text-blue-600 font-medium">
                Berita
              </Link>
              <Link href={`/${tenantId}/public/gallery`} className="text-gray-700 hover:text-blue-600 font-medium">
                Galeri
              </Link>
              <Link href={`/${tenantId}/public/download`} className="text-gray-700 hover:text-blue-600 font-medium">
                Download
              </Link>
              <Link href={`/${tenantId}/public/ppdb`} className="text-gray-700 hover:text-blue-600 font-medium">
                PPDB
              </Link>
              <Link href={`/${tenantId}/public/contact`} className="text-gray-700 hover:text-blue-600 font-medium">
                Kontak
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-gray-100">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {profile.logo && (
              <div className="flex-shrink-0">
                <img 
                  src={profile.logo} 
                  alt="Logo Sekolah"
                  className="w-32 h-32 object-contain rounded-lg"
                />
              </div>
            )}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Profil Sekolah</h1>
              {profile.description && (
                <p className="text-lg text-gray-600 leading-relaxed">
                  {profile.description}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {profile.address && (
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-start gap-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <MapPin className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Alamat</h3>
                  <p className="text-gray-600">{profile.address}</p>
                </div>
              </div>
            </div>
          )}

          {profile.phone && (
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-start gap-4">
                <div className="bg-green-100 p-3 rounded-lg">
                  <Phone className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Telepon</h3>
                  <p className="text-gray-600">{profile.phone}</p>
                </div>
              </div>
            </div>
          )}

          {profile.email && (
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-start gap-4">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <Mail className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Email</h3>
                  <p className="text-gray-600">{profile.email}</p>
                </div>
              </div>
            </div>
          )}

          {profile.website && (
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-start gap-4">
                <div className="bg-orange-100 p-3 rounded-lg">
                  <Globe className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Website</h3>
                  <a 
                    href={profile.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {profile.website}
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Vision */}
        {profile.vision && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Eye className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Visi</h2>
            </div>
            <p className="text-lg text-gray-700 leading-relaxed whitespace-pre-line">
              {profile.vision}
            </p>
          </div>
        )}

        {/* Mission */}
        {profile.mission && (
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-green-100 p-2 rounded-lg">
                <Target className="w-6 h-6 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Misi</h2>
            </div>
            <div className="text-lg text-gray-700 leading-relaxed whitespace-pre-line">
              {profile.mission}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">
            © {new Date().getFullYear()} Website Sekolah. Semua hak dilindungi.
          </p>
        </div>
      </footer>
    </div>
  );
}


