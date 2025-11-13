'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ppdbApi, PpdbApplication } from '@/lib/api/ppdb';
import { useToastStore } from '@/lib/store/toast';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/lib/utils/date';
import { CheckCircle, XCircle, Search, Download, FileText, Users, TrendingUp, TrendingDown } from 'lucide-react';

export default function AnnouncementPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { success, error: showError } = useToastStore();
  const [searchType, setSearchType] = useState<'registrationNumber' | 'nisn'>('registrationNumber');
  const [searchValue, setSearchValue] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<PpdbApplication | null>(null);
  const [tenantId, setTenantId] = useState<number | null>(null);

  const urlTenantId = searchParams.get('tenant');
  const resolvedTenantId = urlTenantId ? parseInt(urlTenantId) : null;

  const { data: statistics } = useQuery({
    queryKey: ['ppdb-announcement-statistics', resolvedTenantId],
    queryFn: () => ppdbApi.getAnnouncementStatistics(resolvedTenantId),
    enabled: resolvedTenantId !== null,
  });

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchValue.trim()) {
      showError('Masukkan nomor pendaftaran atau NISN');
      return;
    }

    setIsSearching(true);
    try {
      // Get tenantId from URL or use default
      const urlTenantId = searchParams.get('tenant');
      const resolvedTenantId = urlTenantId ? parseInt(urlTenantId) : null;

      const params: any = {};
      if (searchType === 'registrationNumber') {
        params.registrationNumber = searchValue.trim();
      } else {
        params.nisn = searchValue.trim();
      }

      const response = await ppdbApi.checkAnnouncement(resolvedTenantId || 0, params);
      setResult(response);
      setTenantId(resolvedTenantId);
      if (!response) {
        showError('Data tidak ditemukan. Pastikan nomor pendaftaran atau NISN benar.');
      }
    } catch (err: any) {
      showError(err?.response?.data?.message || 'Gagal mencari data pengumuman');
      setResult(null);
    } finally {
      setIsSearching(false);
    }
  };

  const handleDownloadCertificate = async () => {
    if (!result || !tenantId) {
      showError('Data tidak tersedia');
      return;
    }

    try {
      const blob = await ppdbApi.downloadCertificateById(tenantId, result.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Surat-Penerimaan-${result.registrationNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      success('Surat penerimaan berhasil didownload');
    } catch (err: any) {
      showError(err?.response?.data?.message || 'Gagal mendownload surat penerimaan');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
            Pengumuman Hasil Seleksi PPDB
          </h1>
          <p className="text-lg text-gray-600">
            Cek status penerimaan Anda dengan memasukkan nomor pendaftaran atau NISN
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex gap-2 mb-4">
              <button
                type="button"
                onClick={() => setSearchType('registrationNumber')}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                  searchType === 'registrationNumber'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Nomor Pendaftaran
              </button>
              <button
                type="button"
                onClick={() => setSearchType('nisn')}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                  searchType === 'nisn'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                NISN
              </button>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder={
                  searchType === 'registrationNumber'
                    ? 'Masukkan nomor pendaftaran'
                    : 'Masukkan NISN'
                }
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <Button
                type="submit"
                loading={isSearching}
                className="px-6"
              >
                <Search className="w-5 h-5 mr-2" />
                Cari
              </Button>
            </div>
          </form>
        </div>

        {/* Result */}
        {result && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center mb-6">
              {result.status === 'accepted' ? (
                <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
              ) : (
                <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
                  <XCircle className="w-12 h-12 text-red-600" />
                </div>
              )}
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {result.status === 'accepted' ? 'Selamat! Anda Diterima' : 'Maaf, Anda Tidak Diterima'}
              </h2>
              <p className="text-gray-600">
                Nomor Pendaftaran: <span className="font-mono font-semibold">{result.registrationNumber}</span>
              </p>
            </div>

            <div className="border-t pt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Nama Calon Siswa</label>
                  <p className="text-gray-900 font-medium">{result.studentName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">NISN</label>
                  <p className="text-gray-900">{result.studentNisn}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Jalur Pendaftaran</label>
                  <p className="text-gray-900">
                    {result.registrationPath === 'zonasi' ? 'Zonasi' :
                     result.registrationPath === 'affirmative' ? 'Afirmasi' :
                     result.registrationPath === 'transfer' ? 'Pindahan' :
                     result.registrationPath === 'achievement' ? 'Prestasi' :
                     result.registrationPath === 'academic' ? 'Akademik' : result.registrationPath}
                  </p>
                </div>
                {result.totalScore !== null && result.totalScore !== undefined && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Total Skor</label>
                    <p className="text-gray-900 font-semibold text-lg">{result.totalScore.toFixed(2)}</p>
                  </div>
                )}
              </div>

              {result.status === 'accepted' && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800 mb-4">
                    <strong>Selamat!</strong> Anda telah diterima sebagai calon siswa. Silakan hubungi sekolah untuk informasi lebih lanjut mengenai proses selanjutnya.
                  </p>
                  {tenantId && (
                    <Button
                      onClick={handleDownloadCertificate}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Surat Penerimaan
                    </Button>
                  )}
                </div>
              )}

              {result.status === 'rejected' && result.rejectedReason && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm font-medium text-red-800 mb-2">Alasan:</p>
                  <p className="text-sm text-red-700">{result.rejectedReason}</p>
                </div>
              )}

              <div className="mt-6 pt-6 border-t text-center">
                <Button
                  variant="outline"
                  onClick={() => {
                    setResult(null);
                    setSearchValue('');
                  }}
                >
                  Cari Lagi
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Statistics */}
        {statistics && statistics.total > 0 && (
          <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistik Hasil Seleksi</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Total Diumumkan</span>
                </div>
                <p className="text-2xl font-bold text-blue-900">{statistics.total}</p>
              </div>
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Diterima</span>
                </div>
                <p className="text-2xl font-bold text-green-900">{statistics.accepted}</p>
              </div>
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="w-5 h-5 text-red-600" />
                  <span className="text-sm font-medium text-red-800">Tidak Diterima</span>
                </div>
                <p className="text-2xl font-bold text-red-900">{statistics.rejected}</p>
              </div>
            </div>

            {Object.keys(statistics.byPath).length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Per Jalur Pendaftaran</h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {Object.entries(statistics.byPath).map(([path, count]) => (
                    <div key={path} className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-center">
                      <p className="text-xs text-gray-600 mb-1 capitalize">{path.replace(/_/g, ' ')}</p>
                      <p className="text-lg font-bold text-gray-900">{count}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Info */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <FileText className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <span>Pastikan nomor pendaftaran atau NISN yang Anda masukkan benar</span>
            </li>
            <li className="flex items-start gap-2">
              <FileText className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <span>Hasil pengumuman hanya dapat dilihat setelah proses seleksi selesai</span>
            </li>
            <li className="flex items-start gap-2">
              <FileText className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <span>Jika ada pertanyaan, silakan hubungi sekolah melalui kontak yang tersedia</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

