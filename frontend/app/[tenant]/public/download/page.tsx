'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { publicApi } from '@/lib/api/public';
import Link from 'next/link';
import { 
  Download as DownloadIcon, 
  ArrowLeft,
  FileText,
  Filter,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';

export default function PublicDownloadPage() {
  const params = useParams();
  const tenantId = params.tenant as string;
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: downloads, isLoading: downloadsLoading } = useQuery({
    queryKey: ['public-downloads', tenantId, selectedCategory],
    queryFn: () => publicApi.getDownloads(tenantId, selectedCategory || undefined),
    enabled: !!tenantId,
  });

  const { data: categories } = useQuery({
    queryKey: ['public-download-categories', tenantId],
    queryFn: () => publicApi.getDownloadCategories(tenantId),
    enabled: !!tenantId,
  });

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const filteredDownloads = downloads?.filter(download =>
    download.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    download.description?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  if (downloadsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat file download...</p>
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
              <div className="flex items-center gap-2">
                <DownloadIcon className="w-6 h-6 text-blue-600" />
                <h1 className="text-xl font-bold text-gray-900">Download</h1>
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
        {/* Filters */}
        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Cari file..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          {categories && categories.length > 0 && (
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Semua Kategori</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Downloads List */}
        {filteredDownloads.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDownloads.map((download) => (
              <div
                key={download.id}
                className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-1 line-clamp-2">
                      {download.title}
                    </h3>
                    {download.description && (
                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                        {download.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>{formatFileSize(download.fileSize)}</span>
                      <span>{download.downloadCount} downloads</span>
                    </div>
                  </div>
                </div>
                <a
                  href={download.fileUrl}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <DownloadIcon className="w-4 h-4" />
                  Download
                </a>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <DownloadIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">Tidak ada file download</p>
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

