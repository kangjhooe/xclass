'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { publicApi } from '@/lib/api/public';
import Link from 'next/link';
import { 
  ArrowLeft,
  Calendar,
  Eye,
  Clock
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
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href={`/${tenantId}/public/news`}>
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Kembali ke Berita
            </Button>
          </Link>
        </div>
      </header>

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Featured Image */}
        {news.featuredImage && (
          <div className="mb-8 rounded-xl overflow-hidden shadow-lg">
            <img 
              src={news.featuredImage} 
              alt={news.title}
              className="w-full h-96 object-cover"
            />
          </div>
        )}

        {/* Article Header */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-gray-100">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {news.title}
          </h1>
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{new Date(news.publishedAt).toLocaleDateString('id-ID', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              <span>{news.viewCount} views</span>
            </div>
            {news.readingTime && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{news.readingTime} menit</span>
              </div>
            )}
          </div>
        </div>

        {/* Article Content */}
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
          <div 
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: news.content }}
          />
        </div>
      </article>

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

