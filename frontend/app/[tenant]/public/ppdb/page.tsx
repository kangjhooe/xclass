'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ppdbApi } from '@/lib/api/ppdb';
import { useAuthStore } from '@/lib/store/auth';
import { Button } from '@/components/ui/Button';
import { 
  Users, 
  CheckCircle, 
  Clock, 
  FileText, 
  Calendar, 
  MapPin, 
  LogIn,
  UserPlus,
  ArrowRight,
  BookOpen,
  Award,
  GraduationCap
} from 'lucide-react';
import { formatDate } from '@/lib/utils/date';
import Link from 'next/link';

interface PublicPpdbInfo {
  totalRegistrations: number;
  acceptedCount: number;
  pendingCount: number;
  registeredCount: number;
  availableSchedules: Array<{
    id: number;
    scheduleDate: string;
    startTime: string;
    endTime: string;
    location: string;
    maxParticipants: number;
    currentParticipants: number;
    notes: string;
  }>;
  byPath: Record<string, number>;
}

const pathLabels: Record<string, string> = {
  zonasi: 'Zonasi',
  affirmative: 'Afirmasi',
  transfer: 'Pindah Tugas',
  achievement: 'Prestasi',
  academic: 'Prestasi Akademik',
};

export default function PublicPpdbPage() {
  const params = useParams();
  const router = useRouter();
  const tenantId = params.tenant as string;
  const { user, isAuthenticated } = useAuthStore();
  const [ppdbInfo, setPpdbInfo] = useState<PublicPpdbInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['public-ppdb-info', tenantId],
    queryFn: async () => {
      try {
        // tenantId can be NPSN (string) or numeric ID
        return await ppdbApi.getPublicInfo(tenantId);
      } catch (err: any) {
        throw new Error(err?.response?.data?.message || 'Gagal memuat informasi PPDB');
      }
    },
    enabled: !!tenantId,
    retry: 2,
  });

  useEffect(() => {
    if (data) {
      setPpdbInfo(data);
      setLoading(false);
    }
    if (isLoading) {
      setLoading(true);
    }
  }, [data, isLoading]);

  const handleGoToDashboard = () => {
    if (isAuthenticated && user) {
      router.push(`/${tenantId}/ppdb/dashboard`);
    } else {
      router.push(`/ppdb/login`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat informasi PPDB...</p>
        </div>
      </div>
    );
  }

  if (error || !ppdbInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Gagal Memuat Data</h2>
          <p className="text-gray-600 mb-4">
            {error || 'Tidak dapat memuat informasi PPDB. Silakan coba lagi nanti.'}
          </p>
          <Button onClick={() => window.location.reload()}>Coba Lagi</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-white/60 sticky top-0 z-50 animate-slide-in-from-top">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 animate-fade-in">
              <div className="bg-gradient-to-br from-blue-500 to-purple-500 p-2 rounded-xl shadow-lg">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">PPDB</h1>
                <p className="text-sm text-gray-600">Penerimaan Peserta Didik Baru</p>
              </div>
            </div>
            <div className="flex gap-2">
              {isAuthenticated ? (
                <Button
                  onClick={handleGoToDashboard}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:scale-105 transition-transform"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Dashboard Saya
                </Button>
              ) : (
                <>
                  <Link href={`/ppdb/login`}>
                    <Button variant="outline" className="border-gray-300 hover:scale-105 transition-transform">
                      <LogIn className="w-4 h-4 mr-2" />
                      Masuk
                    </Button>
                  </Link>
                  <Link href={`/ppdb/register`}>
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:scale-105 transition-transform">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Daftar
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Selamat Datang di PPDB
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Bergabunglah dengan keluarga besar sekolah kami. Daftarkan diri Anda sekarang dan raih kesempatan untuk mendapatkan pendidikan terbaik.
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Total Pendaftar', value: ppdbInfo.totalRegistrations, icon: Users, textColor: 'text-blue-600', bgColor: 'bg-blue-100', iconColor: 'text-blue-600', delay: 0 },
            { label: 'Diterima', value: ppdbInfo.acceptedCount, icon: CheckCircle, textColor: 'text-green-600', bgColor: 'bg-green-100', iconColor: 'text-green-600', delay: 0.1 },
            { label: 'Tertunda', value: ppdbInfo.pendingCount, icon: Clock, textColor: 'text-yellow-600', bgColor: 'bg-yellow-100', iconColor: 'text-yellow-600', delay: 0.2 },
            { label: 'Terdaftar', value: ppdbInfo.registeredCount, icon: FileText, textColor: 'text-purple-600', bgColor: 'bg-purple-100', iconColor: 'text-purple-600', delay: 0.3 },
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 animate-fade-in"
                style={{ animationDelay: `${stat.delay}s` }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                    <p className={`text-3xl font-bold ${stat.textColor}`}>{stat.value}</p>
                  </div>
                  <div className={`${stat.bgColor} p-3 rounded-xl shadow-md`}>
                    <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Registration Paths */}
        {Object.keys(ppdbInfo.byPath).length > 0 && (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-12 border border-gray-100 animate-fade-in">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <div className="bg-gradient-to-br from-blue-500 to-purple-500 p-2 rounded-xl">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              Jalur Pendaftaran
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(ppdbInfo.byPath).map(([path, count], index) => (
                <div
                  key={path}
                  className="border-2 border-gray-200 rounded-xl p-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-gradient-to-br from-white to-gray-50 animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900 text-lg">{pathLabels[path] || path}</p>
                      <p className="text-sm text-gray-600 mt-1">{count} pendaftar</p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-500 to-purple-500 p-2 rounded-lg shadow-md">
                      <Award className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Available Schedules */}
        {ppdbInfo.availableSchedules.length > 0 && (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-12 border border-gray-100 animate-fade-in">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <div className="bg-gradient-to-br from-blue-500 to-purple-500 p-2 rounded-xl">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              Jadwal Wawancara Tersedia
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ppdbInfo.availableSchedules.map((schedule, index) => (
                <div
                  key={schedule.id}
                  className="border-2 border-gray-200 rounded-xl p-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-gradient-to-br from-white to-gray-50 animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-start gap-3">
                    <div className="bg-gradient-to-br from-blue-500 to-purple-500 p-2 rounded-lg shadow-md">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">
                        {formatDate(new Date(schedule.scheduleDate))}
                      </p>
                      <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                        <Clock className="w-4 h-4 text-blue-500" />
                        {schedule.startTime} - {schedule.endTime}
                      </p>
                      {schedule.location && (
                        <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                          <MapPin className="w-4 h-4 text-rose-500" />
                          {schedule.location}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                        <Users className="w-4 h-4 text-emerald-500" />
                        {schedule.currentParticipants}/{schedule.maxParticipants} peserta
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl shadow-2xl p-10 text-center text-white relative overflow-hidden animate-fade-in">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-white/20 to-transparent"></div>
          <div className="relative z-10">
            <h3 className="text-3xl lg:text-4xl font-bold mb-4">Siap untuk Bergabung?</h3>
            <p className="text-lg mb-8 opacity-90">
              Daftarkan diri Anda sekarang dan ikuti proses seleksi PPDB
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              {isAuthenticated ? (
                <Button
                  onClick={handleGoToDashboard}
                  className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 text-lg shadow-xl hover:scale-105 transition-transform"
                >
                  Buka Dashboard
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              ) : (
                <>
                  <Link href={`/ppdb/register`}>
                    <Button className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 text-lg shadow-xl hover:scale-105 transition-transform">
                      <UserPlus className="w-5 h-5 mr-2" />
                      Daftar Sekarang
                    </Button>
                  </Link>
                  <Link href={`/ppdb/login`}>
                    <Button variant="outline" className="border-2 border-white text-white hover:bg-white/20 px-8 py-3 text-lg hover:scale-105 transition-transform">
                      <LogIn className="w-5 h-5 mr-2" />
                      Masuk ke Akun
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white py-10 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">
            © {new Date().getFullYear()} PPDB. Semua hak dilindungi.
          </p>
        </div>
      </footer>
    </div>
  );
}

