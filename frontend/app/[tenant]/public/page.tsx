'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { publicApi } from '@/lib/api/public';
import { ppdbApi } from '@/lib/api/ppdb';
import Link from 'next/link';
import { 
  Newspaper, 
  Image as ImageIcon, 
  Download, 
  Mail, 
  Users, 
  GraduationCap,
  BookOpen,
  Award,
  Calendar,
  ArrowRight,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function PublicHomePage() {
  const params = useParams();
  const tenantId = params.tenant as string;

  const { data: homeStats, isLoading: statsLoading } = useQuery({
    queryKey: ['public-home', tenantId],
    queryFn: () => publicApi.getHome(tenantId),
    enabled: !!tenantId,
  });

  const { data: featuredNews } = useQuery({
    queryKey: ['public-featured-news', tenantId],
    queryFn: () => publicApi.getFeaturedNews(tenantId, 3),
    enabled: !!tenantId,
  });

  const { data: latestNews } = useQuery({
    queryKey: ['public-latest-news', tenantId],
    queryFn: () => publicApi.getLatestNews(tenantId, 6),
    enabled: !!tenantId,
  });

  const { data: galleries } = useQuery({
    queryKey: ['public-galleries', tenantId],
    queryFn: () => publicApi.getGalleries(tenantId),
    enabled: !!tenantId,
  });

  const { data: ppdbInfo } = useQuery({
    queryKey: ['public-ppdb-info', tenantId],
    queryFn: () => ppdbApi.getPublicInfo(tenantId),
    enabled: !!tenantId,
  });

  if (statsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat halaman...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <GraduationCap className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Website Sekolah</h1>
              </div>
            </div>
            <nav className="hidden md:flex items-center gap-4">
              <Link href={`/${tenantId}/public`} className="text-gray-700 hover:text-blue-600 font-medium">
                Beranda
              </Link>
              <Link href={`/${tenantId}/public/profile`} className="text-gray-700 hover:text-blue-600 font-medium">
                Profil
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

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Selamat Datang
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Sekolah yang berkomitmen memberikan pendidikan terbaik untuk masa depan yang cerah
          </p>
        </div>

        {/* Statistics */}
        {homeStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 text-center">
              <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-gray-900">{homeStats.studentCount}</p>
              <p className="text-sm text-gray-600 mt-1">Siswa</p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 text-center">
              <BookOpen className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-gray-900">{homeStats.teacherCount}</p>
              <p className="text-sm text-gray-600 mt-1">Guru</p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 text-center">
              <Newspaper className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-gray-900">{homeStats.newsCount}</p>
              <p className="text-sm text-gray-600 mt-1">Berita</p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 text-center">
              <Calendar className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-gray-900">{homeStats.yearCount}</p>
              <p className="text-sm text-gray-600 mt-1">Tahun Ajaran</p>
            </div>
          </div>
        )}

        {/* Featured News */}
        {featuredNews && featuredNews.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Newspaper className="w-6 h-6 text-blue-600" />
                Berita Utama
              </h2>
              <Link href={`/${tenantId}/public/news`}>
                <Button variant="outline" className="flex items-center gap-2">
                  Lihat Semua
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredNews.map((news) => (
                <Link key={news.id} href={`/${tenantId}/public/news/${news.slug}`}>
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow cursor-pointer">
                    {news.featuredImage && (
                      <div className="h-48 bg-gray-200 overflow-hidden">
                        <img 
                          src={news.featuredImage} 
                          alt={news.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                        {news.title}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                        {news.excerpt || news.content.substring(0, 150)}
                      </p>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>{new Date(news.publishedAt).toLocaleDateString('id-ID')}</span>
                        <span>{news.viewCount} views</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Latest News */}
        {latestNews && latestNews.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Newspaper className="w-6 h-6 text-blue-600" />
                Berita Terbaru
              </h2>
              <Link href={`/${tenantId}/public/news`}>
                <Button variant="outline" className="flex items-center gap-2">
                  Lihat Semua
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {latestNews.map((news) => (
                <Link key={news.id} href={`/${tenantId}/public/news/${news.slug}`}>
                  <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow cursor-pointer">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                      {news.title}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                      {news.excerpt || news.content.substring(0, 100)}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{new Date(news.publishedAt).toLocaleDateString('id-ID')}</span>
                      <span>{news.viewCount} views</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Gallery Preview */}
        {galleries && galleries.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <ImageIcon className="w-6 h-6 text-blue-600" />
                Galeri Foto
              </h2>
              <Link href={`/${tenantId}/public/gallery`}>
                <Button variant="outline" className="flex items-center gap-2">
                  Lihat Semua
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {galleries.slice(0, 8).map((gallery) => (
                <Link key={gallery.id} href={`/${tenantId}/public/gallery/${gallery.id}`}>
                  <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden hover:opacity-90 transition-opacity cursor-pointer">
                    <img 
                      src={gallery.image} 
                      alt={gallery.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link href={`/${tenantId}/public/profile`}>
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow cursor-pointer text-center">
              <Award className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Profil Sekolah</h3>
              <p className="text-sm text-gray-600">Pelajari lebih lanjut tentang sekolah kami</p>
            </div>
          </Link>
          <Link href={`/${tenantId}/public/ppdb`}>
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow cursor-pointer text-center">
              <GraduationCap className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">PPDB</h3>
              <p className="text-sm text-gray-600">Daftar sebagai siswa baru</p>
            </div>
          </Link>
          <Link href={`/${tenantId}/public/download`}>
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow cursor-pointer text-center">
              <Download className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Download</h3>
              <p className="text-sm text-gray-600">Unduh formulir dan dokumen</p>
            </div>
          </Link>
          <Link href={`/${tenantId}/public/contact`}>
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow cursor-pointer text-center">
              <Mail className="w-12 h-12 text-orange-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Kontak</h3>
              <p className="text-sm text-gray-600">Hubungi kami</p>
            </div>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">
            © {new Date().getFullYear()} Website Sekolah. Semua hak dilindungi.
          </p>
        </div>
      </footer>
    </div>
  );
}


