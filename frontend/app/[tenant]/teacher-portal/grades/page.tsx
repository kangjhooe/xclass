'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import TeacherLayout from '@/components/layouts/TeacherLayout';
import apiClient from '@/lib/api/client';
import {
  TrendingUp,
  Search,
  Filter,
  Download,
  Upload,
  Save,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  Users,
  Calendar,
  FileSpreadsheet,
} from 'lucide-react';
import Link from 'next/link';

interface Class {
  id: number;
  name: string;
  level?: string;
}

interface Subject {
  id: number;
  name: string;
  code?: string;
}

interface Student {
  id: number;
  name: string;
  studentNumber?: string;
}

interface Grade {
  studentId: number;
  studentName: string;
  dailyScore?: number;
  midtermScore?: number;
  finalScore?: number;
  averageScore?: number;
}

export default function TeacherGradesPage() {
  const params = useParams();
  const tenantId = params.tenant as string;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [grades, setGrades] = useState<Record<number, Grade>>({});
  
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null);
  const [gradeType, setGradeType] = useState<'daily' | 'midterm' | 'final'>('daily');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchClasses();
    fetchSubjects();
  }, [tenantId]);

  useEffect(() => {
    if (selectedClass && selectedSubject) {
      fetchStudents();
      fetchGrades();
    }
  }, [selectedClass, selectedSubject, gradeType, tenantId]);

  const fetchClasses = async () => {
    try {
      const response = await apiClient.get(`/tenants/${tenantId}/classes`, {
        headers: { 'X-Tenant-NPSN': tenantId },
      });
      setClasses(response.data.data || []);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await apiClient.get(`/tenants/${tenantId}/subjects`, {
        headers: { 'X-Tenant-NPSN': tenantId },
      });
      setSubjects(response.data.data || []);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    if (!selectedClass) return;
    try {
      setLoading(true);
      const response = await apiClient.get(`/tenants/${tenantId}/classes/${selectedClass}/students`, {
        headers: { 'X-Tenant-NPSN': tenantId },
      });
      const studentsData = response.data.data || [];
      setStudents(studentsData);
      
      // Initialize grades
      const initialGrades: Record<number, Grade> = {};
      studentsData.forEach((student: Student) => {
        initialGrades[student.id] = {
          studentId: student.id,
          studentName: student.name,
        };
      });
      setGrades(initialGrades);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGrades = async () => {
    if (!selectedClass || !selectedSubject) return;
    try {
      const response = await apiClient.get(
        `/tenants/${tenantId}/grades`,
        {
          params: {
            classId: selectedClass,
            subjectId: selectedSubject,
            type: gradeType,
          },
          headers: { 'X-Tenant-NPSN': tenantId },
        }
      );
      
      const gradesData = response.data.data || [];
      const gradesMap: Record<number, Grade> = { ...grades };
      
      gradesData.forEach((grade: any) => {
        if (gradesMap[grade.studentId]) {
          if (gradeType === 'daily') {
            gradesMap[grade.studentId].dailyScore = grade.score;
          } else if (gradeType === 'midterm') {
            gradesMap[grade.studentId].midtermScore = grade.score;
          } else if (gradeType === 'final') {
            gradesMap[grade.studentId].finalScore = grade.score;
          }
        }
      });
      
      setGrades(gradesMap);
    } catch (error) {
      console.error('Error fetching grades:', error);
    }
  };

  const handleGradeChange = (studentId: number, value: string) => {
    const numValue = value === '' ? undefined : parseFloat(value);
    if (numValue !== undefined && (numValue < 0 || numValue > 100)) {
      return; // Invalid range
    }

    setGrades((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        ...(gradeType === 'daily' && { dailyScore: numValue }),
        ...(gradeType === 'midterm' && { midtermScore: numValue }),
        ...(gradeType === 'final' && { finalScore: numValue }),
      },
    }));
  };

  const calculateAverage = (studentId: number): number | undefined => {
    const grade = grades[studentId];
    if (!grade) return undefined;

    const daily = grade.dailyScore || 0;
    const midterm = grade.midtermScore || 0;
    const final = grade.finalScore || 0;

    // Simple average calculation (can be customized based on weight)
    if (daily > 0 && midterm > 0 && final > 0) {
      return Math.round((daily * 0.3 + midterm * 0.3 + final * 0.4) * 100) / 100;
    }
    return undefined;
  };

  const handleSave = async () => {
    if (!selectedClass || !selectedSubject) {
      alert('Pilih kelas dan mata pelajaran terlebih dahulu');
      return;
    }

    setSaving(true);
    try {
      const gradesToSave = Object.values(grades)
        .filter((g) => {
          if (gradeType === 'daily') return g.dailyScore !== undefined;
          if (gradeType === 'midterm') return g.midtermScore !== undefined;
          if (gradeType === 'final') return g.finalScore !== undefined;
          return false;
        })
        .map((g) => ({
          studentId: g.studentId,
          subjectId: selectedSubject,
          classId: selectedClass,
          type: gradeType,
          score: gradeType === 'daily' ? g.dailyScore : gradeType === 'midterm' ? g.midtermScore : g.finalScore,
        }));

      await apiClient.post(
        `/tenants/${tenantId}/grades/bulk`,
        { grades: gradesToSave },
        { headers: { 'X-Tenant-NPSN': tenantId } }
      );

      alert('Nilai berhasil disimpan!');
    } catch (error: any) {
      console.error('Error saving grades:', error);
      alert('Gagal menyimpan nilai: ' + (error.response?.data?.message || error.message));
    } finally {
      setSaving(false);
    }
  };

  const filteredStudents = students.filter((student) =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.studentNumber?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedClassName = classes.find((c) => c.id === selectedClass)?.name || 'Pilih Kelas';
  const selectedSubjectName = subjects.find((s) => s.id === selectedSubject)?.name || 'Pilih Mata Pelajaran';

  return (
    <TeacherLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-blue-600" />
              Input Nilai Siswa
            </h1>
            <p className="text-gray-600 mt-1">Input dan kelola nilai siswa untuk mata pelajaran yang Anda ampu</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/${tenantId}/teacher-portal/grades/import`}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Upload className="w-5 h-5" />
              Import Excel
            </Link>
            <Link
              href={`/${tenantId}/teacher-portal/grades/export`}
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <FileSpreadsheet className="w-5 h-5" />
              Ekspor Nilai
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <BookOpen className="w-4 h-4 inline mr-1" />
                Kelas
              </label>
              <select
                value={selectedClass || ''}
                onChange={(e) => {
                  setSelectedClass(e.target.value ? parseInt(e.target.value) : null);
                  setStudents([]);
                  setGrades({});
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Pilih Kelas</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <BookOpen className="w-4 h-4 inline mr-1" />
                Mata Pelajaran
              </label>
              <select
                value={selectedSubject || ''}
                onChange={(e) => {
                  setSelectedSubject(e.target.value ? parseInt(e.target.value) : null);
                  setGrades({});
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Pilih Mata Pelajaran</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Filter className="w-4 h-4 inline mr-1" />
                Jenis Nilai
              </label>
              <select
                value={gradeType}
                onChange={(e) => setGradeType(e.target.value as 'daily' | 'midterm' | 'final')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="daily">Nilai Harian</option>
                <option value="midterm">UTS</option>
                <option value="final">UAS</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleSave}
                disabled={saving || !selectedClass || !selectedSubject}
                className="w-full bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Simpan Nilai
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Search */}
        {selectedClass && selectedSubject && (
          <div className="bg-white rounded-xl shadow-md p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Cari siswa..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        )}

        {/* Grades Table */}
        {selectedClass && selectedSubject && !loading ? (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {selectedClassName} - {selectedSubjectName}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {gradeType === 'daily' ? 'Nilai Harian' : gradeType === 'midterm' ? 'UTS' : 'UAS'}
                  </p>
                </div>
                <div className="text-sm text-gray-600">
                  Total: {filteredStudents.length} siswa
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      No
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      NIS
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nama Siswa
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nilai Harian
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      UTS
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      UAS
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rata-rata
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((student, index) => {
                      const grade = grades[student.id] || {
                        studentId: student.id,
                        studentName: student.name,
                      };
                      const average = calculateAverage(student.id);

                      return (
                        <tr key={student.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {index + 1}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {student.studentNumber || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {student.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="0.01"
                              value={grade.dailyScore || ''}
                              onChange={(e) => handleGradeChange(student.id, e.target.value)}
                              className="w-20 px-2 py-1 border border-gray-300 rounded text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="0-100"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="0.01"
                              value={grade.midtermScore || ''}
                              onChange={(e) => {
                                const prevGradeType = gradeType;
                                setGradeType('midterm');
                                handleGradeChange(student.id, e.target.value);
                                setTimeout(() => setGradeType(prevGradeType), 100);
                              }}
                              className="w-20 px-2 py-1 border border-gray-300 rounded text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="0-100"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="0.01"
                              value={grade.finalScore || ''}
                              onChange={(e) => {
                                const prevGradeType = gradeType;
                                setGradeType('final');
                                handleGradeChange(student.id, e.target.value);
                                setTimeout(() => setGradeType(prevGradeType), 100);
                              }}
                              className="w-20 px-2 py-1 border border-gray-300 rounded text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="0-100"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span
                              className={`text-sm font-semibold ${
                                average !== undefined
                                  ? average >= 75
                                    ? 'text-green-600'
                                    : average >= 60
                                    ? 'text-yellow-600'
                                    : 'text-red-600'
                                  : 'text-gray-400'
                              }`}
                            >
                              {average !== undefined ? average.toFixed(2) : '-'}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                        Tidak ada siswa ditemukan
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : selectedClass && selectedSubject && loading ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat data siswa...</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">Pilih kelas dan mata pelajaran untuk mulai input nilai</p>
          </div>
        )}
      </div>
    </TeacherLayout>
  );
}

