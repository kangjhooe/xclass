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
                <ImageIcon className="w-6 h-6 text-blue-600" />
                <h1 className="text-xl font-bold text-gray-900">Galeri Foto</h1>
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
        {galleries && galleries.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {galleries.map((gallery) => (
              <div
                key={gallery.id}
                className="group relative aspect-square bg-gray-200 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => setSelectedImage(gallery.image)}
              >
                <img 
                  src={gallery.image} 
                  alt={gallery.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center">
                  <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                {gallery.title && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                    <p className="text-white text-sm font-medium line-clamp-1">{gallery.title}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">Tidak ada galeri foto</p>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-7xl max-h-full">
            <img 
              src={selectedImage} 
              alt="Preview"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 bg-white rounded-full p-2 hover:bg-gray-100 transition-colors"
            >
              <span className="text-2xl">×</span>
            </button>
          </div>
        </div>
      )}

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

