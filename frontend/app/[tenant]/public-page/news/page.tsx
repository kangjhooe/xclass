'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { publicPageAdminApi } from '@/lib/api/public';
import { useTenantId } from '@/lib/hooks/useTenant';
import { useToastStore } from '@/lib/store/toast';
import TenantLayout from '@/components/layouts/TenantLayout';
import { Button } from '@/components/ui/Button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Modal } from '@/components/ui/Modal';
import { SearchInput } from '@/components/ui/SearchInput';
import { 
  Newspaper, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  EyeOff,
  Calendar
} from 'lucide-react';
import { formatDate } from '@/lib/utils/date';
import Link from 'next/link';

export default function PublicNewsManagementPage() {
  const params = useParams();
  const router = useRouter();
  const tenantId = useTenantId();
  const { success, error: showError } = useToastStore();
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: number | null }>({
    isOpen: false,
    id: null,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['admin-news', tenantId, currentPage, statusFilter],
    queryFn: () => publicPageAdminApi.getNews(tenantId!, {
      page: currentPage,
      limit: 10,
      status: statusFilter || undefined,
    }),
    enabled: !!tenantId,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => publicPageAdminApi.deleteNews(tenantId!, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-news', tenantId] });
      success('Berita berhasil dihapus');
      setDeleteModal({ isOpen: false, id: null });
    },
    onError: (err: any) => {
      showError(err?.response?.data?.message || 'Gagal menghapus berita');
    },
  });

  const filteredNews = data?.data?.filter(news =>
    !searchQuery ||
    news.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    news.excerpt?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleDelete = (id: number) => {
    setDeleteModal({ isOpen: true, id });
  };

  const confirmDelete = () => {
    if (deleteModal.id) {
      deleteMutation.mutate(deleteModal.id);
    }
  };

  return (
    <TenantLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Newspaper className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              Kelola Berita
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Kelola berita untuk website publik
            </p>
          </div>
          <Button
            onClick={() => router.push(`/${params.tenant}/public-page/news/create`)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Tambah Berita
          </Button>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-slate-700">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <SearchInput
                onSearch={setSearchQuery}
                placeholder="Cari berita..."
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
            >
              <option value="">Semua Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Memuat data...</p>
            </div>
          ) : filteredNews.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Judul</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Featured</TableHead>
                    <TableHead>Views</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredNews.map((news) => (
                    <TableRow key={news.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          {news.featuredImage && (
                            <img
                              src={news.featuredImage}
                              alt={news.title}
                              className="w-16 h-16 object-cover rounded"
                            />
                          )}
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {news.title}
                            </p>
                            {news.excerpt && (
                              <p className="text-sm text-gray-500 line-clamp-1">
                                {news.excerpt}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            news.status === 'published'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                          }`}
                        >
                          {news.status === 'published' ? 'Published' : 'Draft'}
                        </span>
                      </TableCell>
                      <TableCell>
                        {news.isFeatured ? (
                          <Eye className="w-5 h-5 text-blue-600" />
                        ) : (
                          <EyeOff className="w-5 h-5 text-gray-400" />
                        )}
                      </TableCell>
                      <TableCell>{news.viewCount || 0}</TableCell>
                      <TableCell>
                        {news.publishedAt
                          ? formatDate(new Date(news.publishedAt))
                          : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/${params.tenant}/public/news/${news.slug}`} target="_blank">
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/${params.tenant}/public-page/news/${news.id}/edit`)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDelete(news.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {data && data.totalPages > 1 && (
                <div className="p-4 border-t border-gray-200 dark:border-slate-700 flex items-center justify-between">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Halaman {currentPage} dari {data.totalPages} ({data.total} berita)
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      Sebelumnya
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.min(data.totalPages, p + 1))}
                      disabled={currentPage === data.totalPages}
                    >
                      Selanjutnya
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="p-12 text-center">
              <Newspaper className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                Tidak ada berita ditemukan
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null })}
        title="Hapus Berita"
      >
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Apakah Anda yakin ingin menghapus berita ini? Tindakan ini tidak dapat dibatalkan.
        </p>
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => setDeleteModal({ isOpen: false, id: null })}
          >
            Batal
          </Button>
          <Button
            variant="danger"
            onClick={confirmDelete}
            loading={deleteMutation.isPending}
          >
            Hapus
          </Button>
        </div>
      </Modal>
    </TenantLayout>
  );
}

