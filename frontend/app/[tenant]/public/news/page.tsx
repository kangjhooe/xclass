'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { publicApi } from '@/lib/api/public';
import Link from 'next/link';
import { 
  Newspaper, 
  ArrowLeft,
  Calendar,
  Eye,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function PublicNewsPage() {
  const params = useParams();
  const tenantId = params.tenant as string;
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const itemsPerPage = 12;

  const { data, isLoading, error } = useQuery({
    queryKey: ['public-news', tenantId, currentPage],
    queryFn: () => publicApi.getNews(tenantId, { 
      page: currentPage, 
      limit: itemsPerPage 
    }),
    enabled: !!tenantId,
  });

  const filteredNews = data?.data?.filter(news => 
    !searchQuery || 
    news.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    news.excerpt?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat berita...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Gagal memuat berita</p>
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
            <div className="flex items-center gap-3">
              <Link href={`/${tenantId}/public`}>
                <Button variant="outline" className="flex items-center gap-2 hover:scale-105 transition-transform">
                  <ArrowLeft className="w-4 h-4" />
                  Kembali
                </Button>
              </Link>
              <div className="flex items-center gap-2 animate-fade-in">
                <div className="bg-gradient-to-br from-blue-500 to-purple-500 p-2 rounded-xl shadow-lg">
                  <Newspaper className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-900">Berita</h1>
              </div>
            </div>
            <nav className="hidden md:flex items-center gap-4">
              <Link href={`/${tenantId}/public`} className="text-gray-700 hover:text-blue-600 font-medium transition-colors hover:scale-105">
                Beranda
              </Link>
              <Link href={`/${tenantId}/public/profile`} className="text-gray-700 hover:text-blue-600 font-medium transition-colors hover:scale-105">
                Profil
              </Link>
              <Link href={`/${tenantId}/public/gallery`} className="text-gray-700 hover:text-blue-600 font-medium transition-colors hover:scale-105">
                Galeri
              </Link>
              <Link href={`/${tenantId}/public/download`} className="text-gray-700 hover:text-blue-600 font-medium transition-colors hover:scale-105">
                Download
              </Link>
              <Link href={`/${tenantId}/public/ppdb`} className="text-gray-700 hover:text-blue-600 font-medium transition-colors hover:scale-105">
                PPDB
              </Link>
              <Link href={`/${tenantId}/public/contact`} className="text-gray-700 hover:text-blue-600 font-medium transition-colors hover:scale-105">
                Kontak
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search */}
        <div className="mb-8 animate-fade-in">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Cari berita..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm hover:shadow-md"
            />
          </div>
        </div>

        {/* News Grid */}
        {filteredNews.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {filteredNews.map((news, index) => (
                <Link key={news.id} href={`/${tenantId}/public/news/${news.slug}`}>
                  <div 
                    className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-500 cursor-pointer h-full flex flex-col group hover:-translate-y-2 animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {news.featuredImage && (
                      <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden relative">
                        <img 
                          src={news.featuredImage} 
                          alt={news.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      </div>
                    )}
                    <div className="p-6 flex-1 flex flex-col">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {news.title}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-3 mb-4 flex-1">
                        {news.excerpt || news.content.substring(0, 150) + '...'}
                      </p>
                      <div className="flex items-center justify-between text-sm text-gray-500 mt-auto pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-blue-500" />
                          <span>{new Date(news.publishedAt).toLocaleDateString('id-ID')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Eye className="w-4 h-4 text-purple-500" />
                          <span>{news.viewCount}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {data && data.totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 animate-fade-in">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="hover:scale-105 transition-transform disabled:opacity-50"
                >
                  Sebelumnya
                </Button>
                <span className="text-sm text-gray-600 font-medium px-4 py-2 bg-white rounded-lg shadow-sm">
                  Halaman {currentPage} dari {data.totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(p => Math.min(data.totalPages, p + 1))}
                  disabled={currentPage === data.totalPages}
                  className="hover:scale-105 transition-transform disabled:opacity-50"
                >
                  Selanjutnya
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20 animate-fade-in">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full mb-6 animate-pulse">
              <Newspaper className="w-12 h-12 text-gray-400" />
            </div>
            <p className="text-gray-600 text-lg font-medium">Tidak ada berita ditemukan</p>
            <p className="text-gray-500 text-sm mt-2">Coba gunakan kata kunci lain untuk pencarian</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white py-10 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">
            © {new Date().getFullYear()} Website Sekolah. Semua hak dilindungi.
          </p>
        </div>
      </footer>
    </div>
  );
}

