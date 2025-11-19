'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { publicApi } from '@/lib/api/public';
import Link from 'next/link';
import { 
  Image as ImageIcon, 
  ArrowLeft,
  ZoomIn
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function PublicGalleryPage() {
  const params = useParams();
  const tenantId = params.tenant as string;
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const { data: galleries, isLoading } = useQuery({
    queryKey: ['public-galleries', tenantId],
    queryFn: () => publicApi.getGalleries(tenantId),
    enabled: !!tenantId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat galeri...</p>
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
                  <ImageIcon className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-900">Galeri Foto</h1>
              </div>
            </div>
            <nav className="hidden md:flex items-center gap-4">
              <Link href={`/${tenantId}/public`} className="text-gray-700 hover:text-blue-600 font-medium transition-colors hover:scale-105">
                Beranda
              </Link>
              <Link href={`/${tenantId}/public/profile`} className="text-gray-700 hover:text-blue-600 font-medium transition-colors hover:scale-105">
                Profil
              </Link>
              <Link href={`/${tenantId}/public/news`} className="text-gray-700 hover:text-blue-600 font-medium transition-colors hover:scale-105">
                Berita
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
        {galleries && galleries.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {galleries.map((gallery, index) => (
              <div
                key={gallery.id}
                className="group relative aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => setSelectedImage(gallery.image)}
              >
                <img 
                  src={gallery.image} 
                  alt={gallery.title || 'Galeri foto'}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23ddd" width="400" height="400"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="20" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3ENo Image%3C/text%3E%3C/svg%3E';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                  <div className="transform scale-0 group-hover:scale-100 transition-transform duration-500">
                    <ZoomIn className="w-12 h-12 text-white drop-shadow-2xl" />
                  </div>
                </div>
                {gallery.title && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                    <p className="text-white text-sm font-semibold line-clamp-2">{gallery.title}</p>
                    {gallery.description && (
                      <p className="text-white/80 text-xs mt-1 line-clamp-1">{gallery.description}</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 animate-fade-in">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full mb-6 animate-pulse">
              <ImageIcon className="w-12 h-12 text-gray-400" />
            </div>
            <p className="text-gray-600 text-lg font-medium">Tidak ada galeri foto</p>
            <p className="text-gray-500 text-sm mt-2">Galeri akan muncul di sini setelah foto ditambahkan</p>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-7xl max-h-full animate-scale-in">
            <img 
              src={selectedImage} 
              alt="Preview"
              className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23ddd" width="400" height="400"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="20" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3EImage Not Found%3C/text%3E%3C/svg%3E';
              }}
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-3 hover:bg-white hover:scale-110 transition-all duration-300 shadow-xl"
            >
              <span className="text-2xl font-bold text-gray-800">×</span>
            </button>
          </div>
        </div>
      )}

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

