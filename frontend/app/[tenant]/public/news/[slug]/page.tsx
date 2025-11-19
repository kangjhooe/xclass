'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { publicApi } from '@/lib/api/public';
import Link from 'next/link';
import { 
  ArrowLeft,
  Calendar,
  Eye,
  Clock,
  Newspaper
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function PublicNewsDetailPage() {
  const params = useParams();
  const tenantId = params.tenant as string;
  const slug = params.slug as string;

  const { data: news, isLoading } = useQuery({
    queryKey: ['public-news-detail', tenantId, slug],
    queryFn: () => publicApi.getNewsBySlug(tenantId, slug),
    enabled: !!tenantId && !!slug,
  });

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

  if (!news) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Berita tidak ditemukan</p>
          <Link href={`/${tenantId}/public/news`}>
            <Button>Kembali ke Daftar Berita</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-white/60 sticky top-0 z-50 animate-slide-in-from-top">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href={`/${tenantId}/public/news`}>
            <Button variant="outline" className="flex items-center gap-2 hover:scale-105 transition-transform">
              <ArrowLeft className="w-4 h-4" />
              Kembali ke Berita
            </Button>
          </Link>
        </div>
      </header>

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Featured Image */}
        {news.featuredImage ? (
          <div className="mb-8 rounded-2xl overflow-hidden shadow-2xl animate-fade-in">
            <img 
              src={news.featuredImage} 
              alt={news.title}
              className="w-full h-96 object-cover hover:scale-105 transition-transform duration-700"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        ) : (
          <div className="mb-8 rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 h-96 flex items-center justify-center animate-fade-in">
            <Newspaper className="w-24 h-24 text-gray-400 animate-pulse" />
          </div>
        )}

        {/* Article Header */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-8 border border-gray-100 animate-fade-in">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            {news.title}
          </h1>
          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span className="font-medium">{new Date(news.publishedAt).toLocaleDateString('id-ID', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</span>
            </div>
            <div className="flex items-center gap-2 bg-purple-50 px-4 py-2 rounded-lg">
              <Eye className="w-4 h-4 text-purple-600" />
              <span className="font-medium">{news.viewCount} views</span>
            </div>
            {news.readingTime && (
              <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-lg">
                <Clock className="w-4 h-4 text-green-600" />
                <span className="font-medium">{news.readingTime} menit</span>
              </div>
            )}
          </div>
        </div>

        {/* Article Content */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 lg:p-12 border border-gray-100 animate-fade-in">
          <div 
            className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 prose-img:rounded-xl prose-img:shadow-lg"
            dangerouslySetInnerHTML={{ __html: news.content }}
          />
        </div>
      </article>

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

