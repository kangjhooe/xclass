'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import TeacherLayout from '@/components/layouts/TeacherLayout';
import apiClient from '@/lib/api/client';
import {
  Activity,
  Search,
  Filter,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Download,
  Save,
  Users,
  BookOpen,
} from 'lucide-react';

interface Class {
  id: number;
  name: string;
  level?: string;
}

interface Schedule {
  id: number;
  subject: string;
  class: string;
  time: string;
  dayOfWeek: number;
}

interface Student {
  id: number;
  name: string;
  studentNumber?: string;
}

type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

interface Attendance {
  studentId: number;
  studentName: string;
  status: AttendanceStatus;
  note?: string;
}

export default function TeacherAttendancePage() {
  const params = useParams();
  const tenantId = params.tenant as string;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [classes, setClasses] = useState<Class[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendances, setAttendances] = useState<Record<number, Attendance>>({});
  
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [selectedSchedule, setSelectedSchedule] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchClasses();
  }, [tenantId]);

  useEffect(() => {
    if (selectedClass) {
      fetchSchedules();
    }
  }, [selectedClass, tenantId]);

  useEffect(() => {
    if (selectedClass && selectedSchedule) {
      fetchStudents();
      fetchAttendance();
    }
  }, [selectedClass, selectedSchedule, selectedDate, tenantId]);

  const fetchClasses = async () => {
    try {
      const response = await apiClient.get(`/tenants/${tenantId}/classes`, {
        headers: { 'X-Tenant-NPSN': tenantId },
      });
      setClasses(response.data.data || []);
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSchedules = async () => {
    if (!selectedClass) return;
    try {
      const response = await apiClient.get(`/tenants/${tenantId}/schedules`, {
        params: { classId: selectedClass },
        headers: { 'X-Tenant-NPSN': tenantId },
      });
      setSchedules(response.data.data || []);
    } catch (error) {
      console.error('Error fetching schedules:', error);
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
      
      // Initialize attendances
      const initialAttendances: Record<number, Attendance> = {};
      studentsData.forEach((student: Student) => {
        initialAttendances[student.id] = {
          studentId: student.id,
          studentName: student.name,
          status: 'present',
        };
      });
      setAttendances(initialAttendances);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendance = async () => {
    if (!selectedClass || !selectedSchedule) return;
    try {
      const response = await apiClient.get(`/tenants/${tenantId}/attendance`, {
        params: {
          classId: selectedClass,
          scheduleId: selectedSchedule,
          date: selectedDate,
        },
        headers: { 'X-Tenant-NPSN': tenantId },
      });
      
      const attendanceData = response.data.data || [];
      const attendanceMap: Record<number, Attendance> = { ...attendances };
      
      attendanceData.forEach((att: any) => {
        if (attendanceMap[att.studentId]) {
          attendanceMap[att.studentId] = {
            ...attendanceMap[att.studentId],
            status: att.status || 'present',
            note: att.note,
          };
        }
      });
      
      setAttendances(attendanceMap);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
  };

  const handleStatusChange = (studentId: number, status: AttendanceStatus) => {
    setAttendances((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
      },
    }));
  };

  const handleNoteChange = (studentId: number, note: string) => {
    setAttendances((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        note,
      },
    }));
  };

  const handleSave = async () => {
    if (!selectedClass || !selectedSchedule) {
      alert('Pilih kelas dan jadwal terlebih dahulu');
      return;
    }

    setSaving(true);
    try {
      const attendanceToSave = Object.values(attendances).map((att) => ({
        studentId: att.studentId,
        scheduleId: selectedSchedule,
        classId: selectedClass,
        date: selectedDate,
        status: att.status,
        note: att.note || '',
      }));

      await apiClient.post(
        `/tenants/${tenantId}/attendance/bulk`,
        { attendances: attendanceToSave },
        { headers: { 'X-Tenant-NPSN': tenantId } }
      );

      alert('Absensi berhasil disimpan!');
    } catch (error: any) {
      console.error('Error saving attendance:', error);
      alert('Gagal menyimpan absensi: ' + (error.response?.data?.message || error.message));
    } finally {
      setSaving(false);
    }
  };

  const handleQuickMark = (status: AttendanceStatus) => {
    const updatedAttendances: Record<number, Attendance> = {};
    Object.keys(attendances).forEach((key) => {
      const studentId = parseInt(key);
      updatedAttendances[studentId] = {
        ...attendances[studentId],
        status,
      };
    });
    setAttendances(updatedAttendances);
  };

  const getStatusIcon = (status: AttendanceStatus) => {
    switch (status) {
      case 'present':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'absent':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'late':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'excused':
        return <AlertCircle className="w-5 h-5 text-blue-600" />;
      default:
        return <CheckCircle2 className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusLabel = (status: AttendanceStatus) => {
    switch (status) {
      case 'present':
        return 'Hadir';
      case 'absent':
        return 'Tidak Hadir';
      case 'late':
        return 'Terlambat';
      case 'excused':
        return 'Izin';
      default:
        return 'Hadir';
    }
  };

  const filteredStudents = students.filter((student) =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.studentNumber?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const attendanceStats = {
    present: Object.values(attendances).filter((a) => a.status === 'present').length,
    absent: Object.values(attendances).filter((a) => a.status === 'absent').length,
    late: Object.values(attendances).filter((a) => a.status === 'late').length,
    excused: Object.values(attendances).filter((a) => a.status === 'excused').length,
  };

  const selectedClassName = classes.find((c) => c.id === selectedClass)?.name || 'Pilih Kelas';
  const selectedScheduleName = schedules.find((s) => s.id === selectedSchedule)?.subject || 'Pilih Jadwal';

  return (
    <TeacherLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Activity className="w-8 h-8 text-green-600" />
              Absensi Siswa
            </h1>
            <p className="text-gray-600 mt-1">Catat kehadiran siswa untuk setiap pertemuan</p>
          </div>
          <Link
            href={`/${tenantId}/teacher-portal/attendance/report`}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            <Download className="w-5 h-5" />
            Rekap Absensi
          </Link>
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
                  setSelectedSchedule(null);
                  setStudents([]);
                  setAttendances({});
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                <Calendar className="w-4 h-4 inline mr-1" />
                Jadwal
              </label>
              <select
                value={selectedSchedule || ''}
                onChange={(e) => {
                  setSelectedSchedule(e.target.value ? parseInt(e.target.value) : null);
                  setAttendances({});
                }}
                disabled={!selectedClass}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100"
              >
                <option value="">Pilih Jadwal</option>
                {schedules.map((schedule) => (
                  <option key={schedule.id} value={schedule.id}>
                    {schedule.subject} - {schedule.time}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Tanggal
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={handleSave}
                disabled={saving || !selectedClass || !selectedSchedule}
                className="w-full bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Simpan Absensi
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Stats & Quick Actions */}
        {selectedClass && selectedSchedule && students.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="bg-green-50 rounded-xl p-4 border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">Hadir</p>
                  <p className="text-2xl font-bold text-green-700">{attendanceStats.present}</p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <div className="bg-red-50 rounded-xl p-4 border border-red-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-600 font-medium">Tidak Hadir</p>
                  <p className="text-2xl font-bold text-red-700">{attendanceStats.absent}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
            </div>
            <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-600 font-medium">Terlambat</p>
                  <p className="text-2xl font-bold text-yellow-700">{attendanceStats.late}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Izin</p>
                  <p className="text-2xl font-bold text-blue-700">{attendanceStats.excused}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Total</p>
                  <p className="text-2xl font-bold text-gray-700">{students.length}</p>
                </div>
                <Users className="w-8 h-8 text-gray-600" />
              </div>
            </div>
          </div>
        )}

        {/* Quick Mark Buttons */}
        {selectedClass && selectedSchedule && students.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-4">
            <p className="text-sm font-medium text-gray-700 mb-3">Quick Mark:</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleQuickMark('present')}
                className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                Semua Hadir
              </button>
              <button
                onClick={() => handleQuickMark('absent')}
                className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                Semua Tidak Hadir
              </button>
              <button
                onClick={() => handleQuickMark('late')}
                className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors flex items-center gap-2"
              >
                <Clock className="w-4 h-4" />
                Semua Terlambat
              </button>
            </div>
          </div>
        )}

        {/* Search */}
        {selectedClass && selectedSchedule && (
          <div className="bg-white rounded-xl shadow-md p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Cari siswa..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
        )}

        {/* Attendance List */}
        {selectedClass && selectedSchedule && !loading ? (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {selectedClassName} - {selectedScheduleName}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {new Date(selectedDate).toLocaleDateString('id-ID', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <div className="text-sm text-gray-600">
                  Total: {filteredStudents.length} siswa
                </div>
              </div>
            </div>

            <div className="divide-y divide-gray-200">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student, index) => {
                  const attendance = attendances[student.id] || {
                    studentId: student.id,
                    studentName: student.name,
                    status: 'present' as AttendanceStatus,
                  };

                  return (
                    <div
                      key={student.id}
                      className="p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{student.name}</p>
                            <p className="text-sm text-gray-500">
                              NIS: {student.studentNumber || '-'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleStatusChange(student.id, 'present')}
                              className={`p-2 rounded-lg transition-colors ${
                                attendance.status === 'present'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-gray-100 text-gray-400 hover:bg-green-50'
                              }`}
                              title="Hadir"
                            >
                              <CheckCircle2 className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleStatusChange(student.id, 'absent')}
                              className={`p-2 rounded-lg transition-colors ${
                                attendance.status === 'absent'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-gray-100 text-gray-400 hover:bg-red-50'
                              }`}
                              title="Tidak Hadir"
                            >
                              <XCircle className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleStatusChange(student.id, 'late')}
                              className={`p-2 rounded-lg transition-colors ${
                                attendance.status === 'late'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-gray-100 text-gray-400 hover:bg-yellow-50'
                              }`}
                              title="Terlambat"
                            >
                              <Clock className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleStatusChange(student.id, 'excused')}
                              className={`p-2 rounded-lg transition-colors ${
                                attendance.status === 'excused'
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-gray-100 text-gray-400 hover:bg-blue-50'
                              }`}
                              title="Izin"
                            >
                              <AlertCircle className="w-5 h-5" />
                            </button>
                          </div>

                          <div className="w-32">
                            <input
                              type="text"
                              placeholder="Catatan..."
                              value={attendance.note || ''}
                              onChange={(e) => handleNoteChange(student.id, e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                          </div>

                          <div className="w-24 text-right">
                            <span className="text-sm font-medium text-gray-700">
                              {getStatusLabel(attendance.status)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center text-gray-500">
                  Tidak ada siswa ditemukan
                </div>
              )}
            </div>
          </div>
        ) : selectedClass && selectedSchedule && loading ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat data siswa...</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">Pilih kelas dan jadwal untuk mulai absensi</p>
          </div>
        )}
      </div>
    </TeacherLayout>
  );
}

