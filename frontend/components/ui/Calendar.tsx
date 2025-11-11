'use client';

import { useState, useMemo, useCallback } from 'react';
import { cn } from '@/lib/utils/cn';
import { Button } from './Button';

export interface CalendarEvent {
  id: string | number;
  title: string;
  date: Date | string;
  startTime?: string;
  endTime?: string;
  color?: string;
  description?: string;
  type?: 'event' | 'schedule' | 'deadline' | 'holiday' | 'custom';
  metadata?: Record<string, any>;
}

export interface CalendarProps {
  events?: CalendarEvent[];
  onDateClick?: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
  view?: 'month' | 'week' | 'day';
  defaultDate?: Date;
  className?: string;
  showNavigation?: boolean;
  locale?: string;
  firstDayOfWeek?: 0 | 1; // 0 = Sunday, 1 = Monday
  minDate?: Date;
  maxDate?: Date;
  highlightToday?: boolean;
}

const DAYS_OF_WEEK = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export function Calendar({
  events = [],
  onDateClick,
  onEventClick,
  view = 'month',
  defaultDate = new Date(),
  className,
  showNavigation = true,
  locale = 'id-ID',
  firstDayOfWeek = 1, // Monday
  minDate,
  maxDate,
  highlightToday = true,
}: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(defaultDate);
  const [currentView, setCurrentView] = useState<'month' | 'week' | 'day'>(view);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const normalizeEventDate = useCallback((date: Date | string): Date => {
    if (typeof date === 'string') {
      return new Date(date);
    }
    return date;
  }, []);

  const isSameDay = useCallback((date1: Date, date2: Date): boolean => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }, []);

  const isToday = useCallback((date: Date): boolean => {
    return isSameDay(date, today);
  }, [isSameDay, today]);

  const getEventsForDate = useCallback((date: Date): CalendarEvent[] => {
    return events.filter((event) => {
      const eventDate = normalizeEventDate(event.date);
      return isSameDay(eventDate, date);
    });
  }, [events, normalizeEventDate, isSameDay]);

  const navigateMonth = useCallback((direction: 'prev' | 'next') => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  }, []);

  const navigateWeek = useCallback((direction: 'prev' | 'next') => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      const days = direction === 'prev' ? -7 : 7;
      newDate.setDate(prev.getDate() + days);
      return newDate;
    });
  }, []);

  const navigateDay = useCallback((direction: 'prev' | 'next') => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      const days = direction === 'prev' ? -1 : 1;
      newDate.setDate(prev.getDate() + days);
      return newDate;
    });
  }, []);

  const goToToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  const monthDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // Adjust first day based on firstDayOfWeek
    let startDay = firstDay.getDay() - firstDayOfWeek;
    if (startDay < 0) startDay += 7;
    
    const days: (Date | null)[] = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  }, [currentDate, firstDayOfWeek]);

  const weekDays = useMemo(() => {
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : firstDayOfWeek);
    startOfWeek.setDate(diff);
    
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      days.push(date);
    }
    
    return days;
  }, [currentDate, firstDayOfWeek]);

  const dayEvents = useMemo(() => {
    return getEventsForDate(currentDate);
  }, [currentDate, getEventsForDate]);

  const weekDaysOfWeek = useMemo(() => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const dayIndex = (i + firstDayOfWeek) % 7;
      days.push(DAYS_OF_WEEK[dayIndex]);
    }
    return days;
  }, [firstDayOfWeek]);

  const renderMonthView = () => (
    <div className="grid grid-cols-7 gap-1">
      {/* Day headers */}
      {weekDaysOfWeek.map((day, index) => (
        <div
          key={index}
          className="p-2 text-center text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 rounded"
        >
          {day}
        </div>
      ))}
      
      {/* Calendar days */}
      {monthDays.map((date, index) => {
        if (!date) {
          return <div key={`empty-${index}`} className="aspect-square" />;
        }
        
        const dayEvents = getEventsForDate(date);
        const isCurrentMonth = date.getMonth() === currentDate.getMonth();
        const isDateToday = highlightToday && isToday(date);
        const isDisabled = 
          (minDate && date < minDate) || 
          (maxDate && date > maxDate);
        
        return (
          <div
            key={date.toISOString()}
            onClick={() => !isDisabled && onDateClick?.(date)}
            className={cn(
              'aspect-square p-1 border border-gray-200 dark:border-gray-700 rounded-lg',
              'hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer',
              !isCurrentMonth && 'opacity-40',
              isDateToday && 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20',
              isDisabled && 'opacity-30 cursor-not-allowed',
              isCurrentMonth && !isDisabled && 'bg-white dark:bg-gray-900'
            )}
          >
            <div className="flex flex-col h-full">
              <div className={cn(
                'text-sm font-medium mb-1',
                isDateToday && 'text-blue-600 dark:text-blue-400 font-bold',
                !isDateToday && isCurrentMonth && 'text-gray-900 dark:text-gray-100',
                !isCurrentMonth && 'text-gray-400'
              )}>
                {date.getDate()}
              </div>
              <div className="flex-1 overflow-hidden space-y-0.5">
                {dayEvents.slice(0, 3).map((event) => (
                  <div
                    key={event.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick?.(event);
                    }}
                    className={cn(
                      'text-xs px-1 py-0.5 rounded truncate cursor-pointer',
                      'hover:opacity-80 transition-opacity',
                      event.color || 'bg-blue-500 text-white'
                    )}
                    style={event.color ? { backgroundColor: event.color } : undefined}
                    title={event.title}
                  >
                    {event.title}
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 px-1">
                    +{dayEvents.length - 3} lagi
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderWeekView = () => (
    <div className="space-y-2">
      {/* Day headers */}
      <div className="grid grid-cols-7 gap-2">
        {weekDaysOfWeek.map((day, index) => (
          <div
            key={index}
            className="p-2 text-center text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 rounded"
          >
            {day}
          </div>
        ))}
      </div>
      
      {/* Week days */}
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((date) => {
          const dayEvents = getEventsForDate(date);
          const isDateToday = highlightToday && isToday(date);
          
          return (
            <div
              key={date.toISOString()}
              className={cn(
                'min-h-[200px] p-2 border border-gray-200 dark:border-gray-700 rounded-lg',
                isDateToday && 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20',
                !isDateToday && 'bg-white dark:bg-gray-900'
              )}
            >
              <div className="mb-2">
                <div className={cn(
                  'text-lg font-semibold',
                  isDateToday && 'text-blue-600 dark:text-blue-400',
                  !isDateToday && 'text-gray-900 dark:text-gray-100'
                )}>
                  {date.getDate()}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {MONTHS[date.getMonth()]}
                </div>
              </div>
              <div className="space-y-1">
                {dayEvents.map((event) => (
                  <div
                    key={event.id}
                    onClick={() => onEventClick?.(event)}
                    className={cn(
                      'text-xs p-2 rounded cursor-pointer hover:opacity-80 transition-opacity',
                      event.color || 'bg-blue-500 text-white'
                    )}
                    style={event.color ? { backgroundColor: event.color } : undefined}
                  >
                    <div className="font-medium truncate">{event.title}</div>
                    {event.startTime && (
                      <div className="text-xs opacity-90 mt-0.5">
                        {event.startTime}
                        {event.endTime && ` - ${event.endTime}`}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderDayView = () => {
    const dayEvents = getEventsForDate(currentDate);
    const isDateToday = highlightToday && isToday(currentDate);
    
    return (
      <div className="space-y-4">
        {/* Day header */}
        <div className={cn(
          'p-4 rounded-lg border',
          isDateToday && 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
          !isDateToday && 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700'
        )}>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {currentDate.getDate()} {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {DAYS_OF_WEEK[currentDate.getDay()]}
          </div>
        </div>
        
        {/* Events */}
        <div className="space-y-2">
          {dayEvents.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Tidak ada event pada hari ini
            </div>
          ) : (
            dayEvents.map((event) => (
              <div
                key={event.id}
                onClick={() => onEventClick?.(event)}
                className={cn(
                  'p-4 rounded-lg border cursor-pointer hover:shadow-md transition-shadow',
                  'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700'
                )}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      'w-1 h-full rounded',
                      event.color || 'bg-blue-500'
                    )}
                    style={event.color ? { backgroundColor: event.color } : undefined}
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 dark:text-gray-100">
                      {event.title}
                    </div>
                    {(event.startTime || event.endTime) && (
                      <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {event.startTime}
                        {event.endTime && ` - ${event.endTime}`}
                      </div>
                    )}
                    {event.description && (
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                        {event.description}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={cn('bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4', className)}>
      {/* Navigation */}
      {showNavigation && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (currentView === 'month') navigateMonth('prev');
                else if (currentView === 'week') navigateWeek('prev');
                else navigateDay('prev');
              }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={goToToday}
            >
              Hari Ini
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (currentView === 'month') navigateMonth('next');
                else if (currentView === 'week') navigateWeek('next');
                else navigateDay('next');
              }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
          </div>
          
          <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {currentView === 'month' && (
              `${MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`
            )}
            {currentView === 'week' && (
              `Minggu ${weekDays[0].getDate()} - ${weekDays[6].getDate()} ${MONTHS[currentDate.getMonth()]}`
            )}
            {currentView === 'day' && (
              `${currentDate.getDate()} ${MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`
            )}
          </div>
          
          <div className="flex items-center gap-1 border border-gray-200 dark:border-gray-700 rounded-lg p-1">
            {(['month', 'week', 'day'] as const).map((viewOption) => (
              <button
                key={viewOption}
                onClick={() => setCurrentView(viewOption)}
                className={cn(
                  'px-3 py-1 text-sm font-medium rounded transition-colors',
                  currentView === viewOption
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                )}
              >
                {viewOption === 'month' ? 'Bulan' : viewOption === 'week' ? 'Minggu' : 'Hari'}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Calendar View */}
      <div>
        {currentView === 'month' && renderMonthView()}
        {currentView === 'week' && renderWeekView()}
        {currentView === 'day' && renderDayView()}
      </div>
    </div>
  );
}

