'use client';

import { useState, Suspense } from 'react';
import TenantLayout from '@/components/layouts/TenantLayout';
import { LazyAnalyticsDashboard } from './lazy';
import { useStudentAnalytics, useAttendanceAnalytics, useGradesAnalytics } from '@/lib/hooks/useAnalytics';
import { useTenantId } from '@/lib/hooks/useTenant';
import { useToastStore } from '@/lib/store/toast';
import { SkeletonPage } from '@/components/ui/Skeleton';

export default function AnalyticsPage() {
  const tenantId = useTenantId();
  const resolvedTenantId = tenantId ?? undefined;
  const { success, error } = useToastStore();
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    end: new Date(),
  });

  const { data: studentsData, isLoading: studentsLoading } = useStudentAnalytics(resolvedTenantId, {
    dateRange,
  });

  const { data: attendanceData, isLoading: attendanceLoading } = useAttendanceAnalytics(resolvedTenantId, {
    dateRange,
  });

  const { data: gradesData, isLoading: gradesLoading } = useGradesAnalytics(resolvedTenantId, {
    dateRange,
  });

  const handleExport = () => {
    // TODO: Implement export functionality
    success('Fitur ekspor akan segera tersedia');
  };

  return (
    <TenantLayout>
      <div className="space-y-8">
        {/* Students Analytics */}
        <Suspense fallback={<SkeletonPage />}>
          <LazyAnalyticsDashboard
            title="Analytics Siswa"
            data={studentsData || { metrics: [] }}
            isLoading={studentsLoading}
            dateRange={dateRange}
            onDateRangeChange={(start, end) => setDateRange({ start, end })}
            onExport={handleExport}
          />
        </Suspense>

        {/* Attendance Analytics */}
        <Suspense fallback={<SkeletonPage />}>
          <LazyAnalyticsDashboard
            title="Analytics Kehadiran"
            data={attendanceData || { metrics: [] }}
            isLoading={attendanceLoading}
            dateRange={dateRange}
            onDateRangeChange={(start, end) => setDateRange({ start, end })}
            onExport={handleExport}
          />
        </Suspense>

        {/* Grades Analytics */}
        <Suspense fallback={<SkeletonPage />}>
          <LazyAnalyticsDashboard
            title="Analytics Nilai"
            data={gradesData || { metrics: [] }}
            isLoading={gradesLoading}
            dateRange={dateRange}
            onDateRangeChange={(start, end) => setDateRange({ start, end })}
            onExport={handleExport}
          />
        </Suspense>
      </div>
    </TenantLayout>
  );
}

