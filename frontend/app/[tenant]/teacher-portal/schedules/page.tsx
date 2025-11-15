'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import TeacherLayout from '@/components/layouts/TeacherLayout';
import apiClient from '@/lib/api/client';
import {
  Calendar,
  Clock,
  MapPin,
  BookOpen,
  Users,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';

interface Schedule {
  id: number;
  subject: string;
  subjectId: number;
  class: string;
  classId: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  room?: string;
  isActive: boolean;
}

const daysOfWeek = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export default function TeacherSchedulesPage() {
  const params = useParams();
  const tenantId = params.tenant as string;
  const [loading, setLoading] = useState(true);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  useEffect(() => {
    fetchSchedules();
  }, [tenantId]);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/mobile/teacher/schedules`, {
        headers: { 'X-Tenant-NPSN': tenantId },
      });
      
      if (response.data.success && response.data.data) {
        setSchedules(response.data.data.schedules || []);
      }
    } catch (error) {
      console.error('Error fetching schedules:', error);
      // Fallback to empty array
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  };

  const getSchedulesByDay = (dayOfWeek: number) => {
    return schedules.filter((s) => s.dayOfWeek === dayOfWeek && s.isActive);
  };

  const getTodaySchedules = () => {
    const today = new Date().getDay();
    return getSchedulesByDay(today);
  };

  const getWeekStart = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    return new Date(d.setDate(diff));
  };

  const weekStart = getWeekStart(currentWeek);
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + i);
    return date;
  });

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeek(newDate);
  };

  const goToToday = () => {
    setCurrentWeek(new Date());
  };

  const groupSchedulesByTime = (daySchedules: Schedule[]) => {
    return daySchedules.sort((a, b) => {
      const timeA = a.startTime.split(':').map(Number);
      const timeB = b.startTime.split(':').map(Number);
      return timeA[0] * 60 + timeA[1] - (timeB[0] * 60 + timeB[1]);
    });
  };

  if (loading) {
    return (
      <TeacherLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </TeacherLayout>
    );
  }

  const todaySchedules = getTodaySchedules();

  return (
    <TeacherLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Calendar className="w-8 h-8 text-purple-600" />
              Jadwal Mengajar
            </h1>
            <p className="text-gray-600 mt-1">Lihat jadwal mengajar Anda</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode(viewMode === 'week' ? 'month' : 'week')}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              {viewMode === 'week' ? 'Mingguan' : 'Bulanan'}
            </button>
          </div>
        </div>

        {/* Today's Schedule Quick View */}
        {todaySchedules.length > 0 && (
          <div className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold mb-2">Jadwal Hari Ini</h2>
                <p className="text-purple-100">
                  {new Date().toLocaleDateString('id-ID', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold">{todaySchedules.length}</p>
                <p className="text-purple-100 text-sm">Pertemuan</p>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              {groupSchedulesByTime(todaySchedules).slice(0, 3).map((schedule) => (
                <div
                  key={schedule.id}
                  className="bg-white/20 rounded-lg p-3 backdrop-blur-sm"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{schedule.subject}</p>
                      <p className="text-sm text-purple-100">{schedule.class}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {schedule.startTime} - {schedule.endTime}
                      </p>
                      {schedule.room && (
                        <p className="text-xs text-purple-100">{schedule.room}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Week View */}
        {viewMode === 'week' && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => navigateWeek('prev')}
                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {weekStart.toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}{' '}
                    -{' '}
                    {weekDays[6].toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </h2>
                  <button
                    onClick={() => navigateWeek('next')}
                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
                <button
                  onClick={goToToday}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Hari Ini
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 divide-x divide-gray-200">
              {weekDays.map((date, index) => {
                const daySchedules = getSchedulesByDay(index === 0 ? 0 : index);
                const isToday =
                  date.toDateString() === new Date().toDateString();
                const isSelected = selectedDay === index;

                return (
                  <div
                    key={index}
                    className={`min-h-[400px] ${
                      isToday ? 'bg-purple-50' : 'bg-white'
                    } ${isSelected ? 'ring-2 ring-purple-500' : ''}`}
                  >
                    <div
                      className={`p-3 border-b border-gray-200 ${
                        isToday ? 'bg-purple-600 text-white' : 'bg-gray-50'
                      }`}
                    >
                      <p className="text-xs font-medium uppercase">
                        {daysOfWeek[index]}
                      </p>
                      <p
                        className={`text-lg font-bold ${
                          isToday ? 'text-white' : 'text-gray-900'
                        }`}
                      >
                        {date.getDate()}
                      </p>
                    </div>
                    <div className="p-2 space-y-2">
                      {groupSchedulesByTime(daySchedules).map((schedule) => (
                        <div
                          key={schedule.id}
                          className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-3 border border-purple-100 hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => setSelectedDay(selectedDay === index ? null : index)}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900 text-sm">
                                {schedule.subject}
                              </p>
                              <p className="text-xs text-gray-600 mt-1">
                                {schedule.class}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <Clock className="w-3 h-3" />
                            <span>
                              {schedule.startTime} - {schedule.endTime}
                            </span>
                          </div>
                          {schedule.room && (
                            <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
                              <MapPin className="w-3 h-3" />
                              <span>{schedule.room}</span>
                            </div>
                          )}
                        </div>
                      ))}
                      {daySchedules.length === 0 && (
                        <p className="text-xs text-gray-400 text-center py-4">
                          Tidak ada jadwal
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* List View (All Schedules) */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">Semua Jadwal</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {schedules.length > 0 ? (
              schedules
                .filter((s) => s.isActive)
                .sort((a, b) => {
                  if (a.dayOfWeek !== b.dayOfWeek) {
                    return a.dayOfWeek - b.dayOfWeek;
                  }
                  const timeA = a.startTime.split(':').map(Number);
                  const timeB = b.startTime.split(':').map(Number);
                  return timeA[0] * 60 + timeA[1] - (timeB[0] * 60 + timeB[1]);
                })
                .map((schedule) => (
                  <div
                    key={schedule.id}
                    className="p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Calendar className="w-6 h-6 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <p className="font-semibold text-gray-900">
                              {schedule.subject}
                            </p>
                            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                              {daysOfWeek[schedule.dayOfWeek]}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Users className="w-4 h-4" />
                              <span>{schedule.class}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Clock className="w-4 h-4" />
                              <span>
                                {schedule.startTime} - {schedule.endTime}
                              </span>
                            </div>
                            {schedule.room && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <MapPin className="w-4 h-4" />
                                <span>{schedule.room}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
            ) : (
              <div className="p-12 text-center text-gray-500">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-lg">Tidak ada jadwal mengajar</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </TeacherLayout>
  );
}

