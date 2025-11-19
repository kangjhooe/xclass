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
    if (!bytes || bytes === 0) return '0 Bytes';
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
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="text-center text-slate-200">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-blue-400"></div>
          <p className="mt-4 text-base">Memuat file download...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 py-4">
      <section className="rounded-[32px] border border-white/10 bg-white/90 p-8 text-slate-900 shadow-[0_25px_80px_rgba(15,23,42,0.25)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1 text-sm font-semibold text-blue-600">
              <DownloadIcon className="h-4 w-4" />
              Pusat Unduhan
            </p>
            <h1 className="mt-4 text-3xl font-bold">Dokumen & Formulir Resmi</h1>
            <p className="mt-2 text-slate-600">
              Akses panduan, formulir, dan informasi penting dalam satu tempat yang tertata rapi.
            </p>
          </div>
          <Link href={`/${tenantId}/public`}>
            <Button variant="outline" className="rounded-full border-slate-200 text-slate-900 hover:border-blue-200">
              <ArrowLeft className="h-4 w-4" />
              Kembali
            </Button>
          </Link>
        </div>

        <div className="mt-8 flex flex-col gap-4 md:flex-row">
          <label className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari judul atau deskripsi dokumen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-12 py-3 text-slate-900 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </label>
          {categories && categories.length > 0 && (
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <Filter className="h-5 w-5 text-slate-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full appearance-none bg-transparent text-sm font-semibold text-slate-700 focus:outline-none"
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
      </section>

      {filteredDownloads.length > 0 ? (
        <div className="grid gap-6 text-slate-900 md:grid-cols-2 lg:grid-cols-3">
          {filteredDownloads.map((download, index) => (
            <div
              key={download.id}
              className="glass-panel-light tilt-hover h-full rounded-2xl p-6"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex items-start gap-4">
                <div className="rounded-2xl bg-blue-100 p-3 text-blue-600">
                  <FileText className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{download.title}</h3>
                  {download.description && (
                    <p className="mt-2 text-sm text-slate-500 line-clamp-2">{download.description}</p>
                  )}
                  <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">
                    <span>{formatFileSize(download.fileSize)}</span>
                    <span>{download.downloadCount} unduhan</span>
                    {download.category && (
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">{download.category}</span>
                    )}
                  </div>
                </div>
              </div>
              <a
                href={download.fileUrl}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/20"
              >
                <DownloadIcon className="h-4 w-4" />
                Download
              </a>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-white">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl border border-white/20 bg-white/5">
            <DownloadIcon className="h-10 w-10 text-white/70" />
          </div>
          <p className="mt-4 text-lg text-white/80">Belum ada file pada kategori ini.</p>
        </div>
      )}
    </div>
  );
}

