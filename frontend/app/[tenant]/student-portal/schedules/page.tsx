'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import StudentLayout from '@/components/layouts/StudentLayout';
import { DashboardSkeleton } from '@/components/student/LoadingSkeleton';
import EmptyState from '@/components/student/EmptyState';
import apiClient from '@/lib/api/client';
import { Calendar, Clock, MapPin, User, ChevronLeft, ChevronRight } from 'lucide-react';

interface Schedule {
  id: number;
  subject: string;
  teacher: string;
  time: string;
  room: string;
  dayOfWeek: number;
}

const daysOfWeek = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export default function StudentSchedulesPage() {
  const params = useParams();
  const tenantId = params.tenant as string;
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get student info first to get classId
        const dashboardResponse = await apiClient.get('/mobile/dashboard', {
          headers: {
            'X-Tenant-NPSN': tenantId,
          },
        });

        if (dashboardResponse.data.success && dashboardResponse.data.data) {
          const student = dashboardResponse.data.data.student;
          
          // Get today's schedules from dashboard response
          const todaySchedules = dashboardResponse.data.data.todaySchedules || [];
          
          // For full schedule, we'll use today's schedule as sample
          // In production, you might want to fetch full weekly schedule from a different endpoint
          if (todaySchedules.length > 0) {
            setSchedules(todaySchedules.map((s: any, index: number) => ({
              id: s.id || index,
              subject: s.subject || '-',
              teacher: s.teacher || '-',
              time: s.time || '-',
              room: s.room || '-',
              dayOfWeek: new Date().getDay(), // Current day
            })));
          } else {
            // Try to fetch from schedules API if available
            try {
              const response = await apiClient.get(`/tenants/${tenantId}/schedules`, {
                headers: {
                  'X-Tenant-NPSN': tenantId,
                },
              });

              if (response.data) {
                const schedulesData = Array.isArray(response.data) 
                  ? response.data 
                  : response.data.data || [];
                
                setSchedules(schedulesData.map((s: any) => ({
                  id: s.id,
                  subject: s.subject?.name || s.subject || '-',
                  teacher: s.teacher?.name || s.teacher || '-',
                  time: `${s.startTime || ''} - ${s.endTime || ''}`,
                  room: s.classRoom?.name || s.room || '-',
                  dayOfWeek: s.dayOfWeek || 0,
                })));
              }
            } catch (scheduleError) {
              console.warn('Failed to fetch full schedules:', scheduleError);
              // Use empty array if API fails
              setSchedules([]);
            }
          }
        }
      } catch (err: any) {
        console.error('Error fetching schedules:', err);
        setError(err.response?.data?.message || 'Gagal memuat data jadwal');
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, [tenantId]);

  const schedulesByDay = schedules.reduce((acc, schedule) => {
    const day = schedule.dayOfWeek;
    if (!acc[day]) acc[day] = [];
    acc[day].push(schedule);
    return acc;
  }, {} as Record<number, Schedule[]>);

  // Sort schedules by time within each day
  Object.keys(schedulesByDay).forEach(day => {
    const dayNum = parseInt(day);
    if (schedulesByDay[dayNum]) {
      schedulesByDay[dayNum].sort((a, b) => {
        const timeA = a.time.split(' - ')[0] || '';
        const timeB = b.time.split(' - ')[0] || '';
        return timeA.localeCompare(timeB);
      });
    }
  });

  const filteredSchedules = selectedDay !== null 
    ? schedulesByDay[selectedDay] || []
    : schedules;

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
      <div className="space-y-6 dark:text-gray-100">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              Jadwal Pelajaran
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">Lihat jadwal pelajaran Anda</p>
          </div>
        </div>

        {/* Day Filter */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Filter Hari</h2>
            {selectedDay !== null && (
              <button
                onClick={() => setSelectedDay(null)}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Tampilkan Semua
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedDay(null)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedDay === null
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Semua Hari
            </button>
            {daysOfWeek.map((day, index) => (
              <button
                key={index}
                onClick={() => setSelectedDay(index)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedDay === index
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>

        {/* Schedules */}
        {selectedDay !== null ? (
          // Single day view
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Jadwal {daysOfWeek[selectedDay]}
            </h2>
            {filteredSchedules.length > 0 ? (
              <div className="space-y-3">
                {filteredSchedules.map((schedule) => (
                  <div
                    key={schedule.id}
                    className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-100 dark:border-blue-800/30 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-2">
                          {schedule.subject}
                        </h3>
                        <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            <span>{schedule.teacher}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>{schedule.time}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span>{schedule.room}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Calendar}
                title={`Tidak ada jadwal untuk ${daysOfWeek[selectedDay]}`}
                description="Tidak ada jadwal pelajaran pada hari ini."
              />
            )}
          </div>
        ) : (
          // Weekly view
          <div className="space-y-4">
            {daysOfWeek.map((day, dayIndex) => {
              const daySchedules = schedulesByDay[dayIndex] || [];
              if (daySchedules.length === 0) return null;

              return (
                <div key={dayIndex} className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-slate-700">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{day}</h2>
                  <div className="space-y-3">
                    {daySchedules.map((schedule) => (
                      <div
                        key={schedule.id}
                        className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 text-lg mb-2">
                              {schedule.subject}
                            </h3>
                            <div className="space-y-1 text-sm text-gray-600">
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4" />
                                <span>{schedule.teacher}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                <span>{schedule.time}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                <span>{schedule.room}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            {schedules.length === 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-12 border border-gray-100 dark:border-slate-700">
                <EmptyState
                  icon={Calendar}
                  title="Tidak ada jadwal"
                  description="Tidak ada jadwal pelajaran yang tersedia."
                />
              </div>
            )}
          </div>
        )}
      </div>
    </StudentLayout>
  );
}

