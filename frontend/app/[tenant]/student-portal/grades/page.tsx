'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import StudentLayout from '@/components/layouts/StudentLayout';
import { DashboardSkeleton } from '@/components/student/LoadingSkeleton';
import EmptyState from '@/components/student/EmptyState';
import apiClient from '@/lib/api/client';
import { LineChartComponent, BarChartComponent, PieChartComponent } from '@/components/ui/Charts';
import Pagination from '@/components/student/Pagination';
import { TrendingUp, BookOpen, Filter, Download, BarChart3, Search, FileSpreadsheet, FileText } from 'lucide-react';
import { formatDate } from '@/lib/utils/date';

interface Grade {
  id: number;
  subject: string | null;
  teacher: string | null;
  score: number;
  type: string;
  date: string;
}

export default function StudentGradesPage() {
  const params = useParams();
  const tenantId = params.tenant as string;
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [subjects, setSubjects] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isExporting, setIsExporting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await apiClient.get('/mobile/grades', {
          headers: {
            'X-Tenant-NPSN': tenantId,
          },
        });

        if (response.data.success && response.data.data) {
          const gradesData = response.data.data;
          setGrades(Array.isArray(gradesData) ? gradesData : []);

          // Extract unique subjects
          const uniqueSubjects = Array.from(
            new Set(gradesData.map((g: Grade) => g.subject).filter(Boolean))
          ) as string[];
          setSubjects(uniqueSubjects);
        } else {
          setError('Gagal memuat data nilai');
        }
      } catch (err: any) {
        console.error('Error fetching grades:', err);
        setError(err.response?.data?.message || 'Gagal memuat data nilai');
      } finally {
        setLoading(false);
      }
    };

    fetchGrades();
  }, [tenantId]);

  const filteredGrades = useMemo(() => {
    let filtered = filterSubject === 'all' 
      ? grades 
      : grades.filter(g => g.subject === filterSubject);
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(g => 
        g.subject?.toLowerCase().includes(query) ||
        g.teacher?.toLowerCase().includes(query) ||
        g.type?.toLowerCase().includes(query) ||
        g.score.toString().includes(query)
      );
    }
    
    return filtered;
  }, [grades, filterSubject, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredGrades.length / itemsPerPage);
  const paginatedGrades = filteredGrades.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to page 1 when filter/search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filterSubject, searchQuery]);

  // Prepare chart data
  const gradeTrendData = useMemo(() => {
    // Group by date and calculate average
    const grouped = grades.reduce((acc, grade) => {
      const date = grade.date;
      if (!acc[date]) {
        acc[date] = { scores: [], count: 0 };
      }
      acc[date].scores.push(grade.score);
      acc[date].count++;
      return acc;
    }, {} as Record<string, { scores: number[]; count: number }>);

    return Object.entries(grouped)
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .slice(-10) // Last 10 dates
      .map(([date, data]) => ({
        name: date,
        nilai: Number((data.scores.reduce((sum, s) => sum + s, 0) / data.scores.length).toFixed(1)),
      }));
  }, [grades]);

  const subjectComparisonData = useMemo(() => {
    const grouped = grades.reduce((acc, grade) => {
      const subject = grade.subject || 'Lainnya';
      if (!acc[subject]) {
        acc[subject] = { scores: [], count: 0 };
      }
      acc[subject].scores.push(grade.score);
      acc[subject].count++;
      return acc;
    }, {} as Record<string, { scores: number[]; count: number }>);

    return Object.entries(grouped)
      .map(([subject, data]) => ({
        name: subject.length > 15 ? subject.substring(0, 15) + '...' : subject,
        'Rata-rata': Number((data.scores.reduce((sum, s) => sum + s, 0) / data.scores.length).toFixed(1)),
      }))
      .sort((a, b) => b['Rata-rata'] - a['Rata-rata'])
      .slice(0, 8); // Top 8 subjects
  }, [grades]);

  const assessmentTypeData = useMemo(() => {
    const grouped = grades.reduce((acc, grade) => {
      const type = grade.type || 'Lainnya';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(grouped).map(([name, value]) => ({
      name: name.length > 20 ? name.substring(0, 20) + '...' : name,
      value,
    }));
  }, [grades]);

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600 bg-green-50';
    if (score >= 70) return 'text-blue-600 bg-blue-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 85) return 'Sangat Baik';
    if (score >= 70) return 'Baik';
    if (score >= 60) return 'Cukup';
    return 'Perlu Perbaikan';
  };

  const handleExport = async (format: 'csv' | 'excel') => {
    setIsExporting(true);
    try {
      const headers = ['Mata Pelajaran', 'Jenis Penilaian', 'Guru', 'Nilai', 'Tanggal'];
      const rows = filteredGrades.map(g => [
        g.subject || '-',
        g.type,
        g.teacher || '-',
        g.score.toString(),
        g.date,
      ]);

      if (format === 'csv') {
        const csvContent = [
          headers.join(','),
          ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `nilai_siswa_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        // For Excel, we'll use a simple CSV format that Excel can open
        const csvContent = [
          headers.join(','),
          ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob(['\ufeff' + csvContent], { type: 'application/vnd.ms-excel' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `nilai_siswa_${new Date().toISOString().split('T')[0]}.xls`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }

      // Show success message (using browser notification since this is a download action)
      if (typeof window !== 'undefined') {
        window.alert(`Data berhasil diekspor ke ${format.toUpperCase()}`);
      }
    } catch (err) {
      console.error('Export error:', err);
      if (typeof window !== 'undefined') {
        window.alert('Gagal mengekspor data');
      }
    } finally {
      setIsExporting(false);
    }
  };

  // Calculate statistics
  const averageScore = grades.length > 0
    ? (grades.reduce((sum, g) => sum + g.score, 0) / grades.length).toFixed(1)
    : 0;

  const highestScore = grades.length > 0
    ? Math.max(...grades.map(g => g.score))
    : 0;

  const lowestScore = grades.length > 0
    ? Math.min(...grades.map(g => g.score))
    : 0;

  if (loading) {
    return (
      <StudentLayout>
        <DashboardSkeleton />
      </StudentLayout>
    );
  }

  if (error) {
    return (
      <StudentLayout>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              Nilai Siswa
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">Lihat semua nilai dan performa akademik Anda</p>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm mb-1">Rata-rata Nilai</p>
                <p className="text-3xl font-bold">{averageScore}</p>
              </div>
              <TrendingUp className="w-12 h-12 text-blue-200 opacity-50" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm mb-1">Nilai Tertinggi</p>
                <p className="text-3xl font-bold">{highestScore}</p>
              </div>
              <TrendingUp className="w-12 h-12 text-green-200 opacity-50" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm mb-1">Nilai Terendah</p>
                <p className="text-3xl font-bold">{lowestScore}</p>
              </div>
              <TrendingUp className="w-12 h-12 text-orange-200 opacity-50" />
            </div>
          </div>
        </div>

        {/* Charts Section */}
        {grades.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Line Chart - Grade Trend */}
            {gradeTrendData.length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-slate-700">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Perkembangan Nilai</h2>
                </div>
                <p className="text-sm text-gray-600 mb-4">Rata-rata nilai per waktu (10 penilaian terakhir)</p>
                <LineChartComponent
                  data={gradeTrendData}
                  dataKey="nilai"
                  lines={[{ key: 'nilai', name: 'Rata-rata Nilai', color: '#3b82f6' }]}
                  height={250}
                />
              </div>
            )}

            {/* Bar Chart - Subject Comparison */}
            {subjectComparisonData.length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-slate-700">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Perbandingan per Mata Pelajaran</h2>
                </div>
                <p className="text-sm text-gray-600 mb-4">Rata-rata nilai per mata pelajaran</p>
                <BarChartComponent
                  data={subjectComparisonData}
                  dataKey="Rata-rata"
                  bars={[{ key: 'Rata-rata', name: 'Rata-rata Nilai', color: '#10b981' }]}
                  height={250}
                />
              </div>
            )}

            {/* Pie Chart - Assessment Type Distribution */}
            {assessmentTypeData.length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 lg:col-span-2 border border-gray-100 dark:border-slate-700">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Distribusi Jenis Penilaian</h2>
                </div>
                <p className="text-sm text-gray-600 mb-4">Jumlah penilaian per jenis</p>
                <div className="max-w-2xl mx-auto">
                  <PieChartComponent
                    data={assessmentTypeData}
                    dataKey="value"
                    height={300}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Search and Filter */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-slate-700">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Cari nilai (mata pelajaran, guru, jenis penilaian)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
            {/* Export Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => handleExport('csv')}
                disabled={isExporting || filteredGrades.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <FileSpreadsheet className="w-4 h-4" />
                {isExporting ? 'Mengekspor...' : 'Export CSV'}
              </button>
              <button
                onClick={() => handleExport('excel')}
                disabled={isExporting || filteredGrades.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <FileText className="w-4 h-4" />
                {isExporting ? 'Mengekspor...' : 'Export Excel'}
              </button>
            </div>
          </div>
          
          {/* Filter Subject */}
          <div className="flex items-center gap-2 mb-2">
            <Filter className="w-5 h-5 text-gray-600" />
            <h3 className="text-sm font-medium text-gray-700">Filter Mata Pelajaran:</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterSubject('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                filterSubject === 'all'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Semua
            </button>
            {subjects.map((subject) => (
              <button
                key={subject}
                onClick={() => setFilterSubject(subject)}
                className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                  filterSubject === subject
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {subject}
              </button>
            ))}
          </div>
          {searchQuery && (
            <p className="text-sm text-gray-600 mt-2">
              Menampilkan {filteredGrades.length} dari {grades.length} nilai
            </p>
          )}
        </div>

        {/* Grades Table */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden border border-gray-100 dark:border-slate-700">
          <div className="p-6 border-b border-gray-200 dark:border-slate-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              Daftar Nilai {filteredGrades.length > 0 && `(${filteredGrades.length})`}
            </h2>
          </div>

          {filteredGrades.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-slate-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Mata Pelajaran
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Jenis Penilaian
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Guru
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Nilai
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Tanggal
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                    {paginatedGrades.map((grade) => (
                      <tr key={grade.id} className="hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {grade.subject || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600 dark:text-gray-300">{grade.type}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600 dark:text-gray-300">{grade.teacher || '-'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getScoreColor(grade.score)}`}>
                              {grade.score}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {getScoreBadge(grade.score)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600 dark:text-gray-300">{grade.date}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {totalPages > 1 && (
                <div className="p-6 border-t border-gray-200 dark:border-slate-700">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="p-12">
              <EmptyState
                icon={BookOpen}
                title="Tidak ada nilai"
                description={filterSubject === 'all' 
                  ? "Belum ada nilai yang tercatat untuk Anda."
                  : `Tidak ada nilai untuk mata pelajaran ${filterSubject}.`}
              />
            </div>
          )}
        </div>

        {/* Summary by Subject */}
        {subjects.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-slate-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Rata-rata per Mata Pelajaran</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subjects.map((subject) => {
                const subjectGrades = grades.filter(g => g.subject === subject);
                const subjectAverage = subjectGrades.length > 0
                  ? (subjectGrades.reduce((sum, g) => sum + g.score, 0) / subjectGrades.length).toFixed(1)
                  : 0;
                
                return (
                  <div
                    key={subject}
                    className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-100 dark:border-blue-800/30"
                  >
                    <p className="font-semibold text-gray-900 dark:text-white mb-1">{subject}</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{subjectAverage}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subjectGrades.length} nilai</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </StudentLayout>
  );
}

