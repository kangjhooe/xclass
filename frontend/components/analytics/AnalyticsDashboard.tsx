'use client';

import { useState } from 'react';
import { LineChartComponent, BarChartComponent, PieChartComponent } from '../ui/Charts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { SkeletonChart, SkeletonStats } from '../ui/Skeleton';
import { cn } from '@/lib/utils/cn';

export interface AnalyticsMetric {
  label: string;
  value: number | string;
  change?: number; // Percentage change
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
  color?: string;
  format?: (value: number | string) => string;
}

export interface AnalyticsData {
  metrics: AnalyticsMetric[];
  trends?: {
    label: string;
    data: { name: string; value: number; [key: string]: any }[];
    dataKey: string;
    lines?: { key: string; name: string; color?: string }[];
  };
  distribution?: {
    label: string;
    data: { name: string; value: number }[];
    dataKey: string;
  };
  comparison?: {
    label: string;
    data: Array<{ name: string; value: number } & { [key: string]: number | string }>;
    dataKey: string;
    bars?: { key: string; name: string; color?: string }[];
  };
}

export interface AnalyticsDashboardProps {
  title?: string;
  data: AnalyticsData;
  isLoading?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
  onDateRangeChange?: (start: Date, end: Date) => void;
  className?: string;
  showDateFilter?: boolean;
  showExport?: boolean;
  onExport?: () => void;
}

export function AnalyticsDashboard({
  title = 'Analytics Dashboard',
  data,
  isLoading = false,
  dateRange,
  onDateRangeChange,
  className,
  showDateFilter = true,
  showExport = true,
  onExport,
}: AnalyticsDashboardProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y' | 'custom'>('30d');

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period as any);
    if (period !== 'custom' && onDateRangeChange) {
      const end = new Date();
      const start = new Date();
      
      switch (period) {
        case '7d':
          start.setDate(end.getDate() - 7);
          break;
        case '30d':
          start.setDate(end.getDate() - 30);
          break;
        case '90d':
          start.setDate(end.getDate() - 90);
          break;
        case '1y':
          start.setFullYear(end.getFullYear() - 1);
          break;
      }
      
      onDateRangeChange(start, end);
    }
  };

  if (isLoading) {
    return (
      <div className={cn('space-y-6', className)}>
        <SkeletonStats count={data.metrics.length || 4} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonChart height={300} />
          <SkeletonChart height={300} />
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{title}</h2>
          {dateRange && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {dateRange.start.toLocaleDateString('id-ID')} - {dateRange.end.toLocaleDateString('id-ID')}
            </p>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          {showDateFilter && (
            <Select
              value={selectedPeriod}
              onChange={(e) => handlePeriodChange(e.target.value)}
              className="w-40"
            >
              <option value="7d">7 Hari Terakhir</option>
              <option value="30d">30 Hari Terakhir</option>
              <option value="90d">90 Hari Terakhir</option>
              <option value="1y">1 Tahun Terakhir</option>
              <option value="custom">Custom</option>
            </Select>
          )}
          
          {showExport && onExport && (
            <Button variant="outline" size="sm" onClick={onExport}>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Ekspor
            </Button>
          )}
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {data.metrics.map((metric, index) => (
          <MetricCard key={index} metric={metric} />
        ))}
      </div>

      {/* Charts */}
      {(data.trends || data.distribution || data.comparison) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {data.trends && data.trends.data && data.trends.data.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>{data.trends.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <LineChartComponent
                  data={data.trends.data}
                  dataKey={data.trends.dataKey}
                  lines={data.trends.lines}
                  height={300}
                />
              </CardContent>
            </Card>
          )}

          {data.distribution && data.distribution.data && data.distribution.data.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>{data.distribution.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <PieChartComponent
                  data={data.distribution.data}
                  dataKey={data.distribution.dataKey}
                  height={300}
                />
              </CardContent>
            </Card>
          )}

          {data.comparison && data.comparison.data && data.comparison.data.length > 0 && (
            <Card className={cn(data.trends || data.distribution ? 'lg:col-span-2' : '')}>
              <CardHeader>
                <CardTitle>{data.comparison.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <BarChartComponent
                  data={data.comparison.data}
                  dataKey={data.comparison.dataKey}
                  bars={data.comparison.bars}
                  height={300}
                />
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

function MetricCard({ metric }: { metric: AnalyticsMetric }) {
  const formatValue = metric.format || ((v) => String(v));
  const displayValue = formatValue(metric.value);

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{metric.label}</p>
          {metric.icon && (
            <div className={cn('p-2 rounded-lg', metric.color ? `bg-${metric.color}-100 dark:bg-${metric.color}-900/20` : 'bg-gray-100 dark:bg-gray-800')}>
              {metric.icon}
            </div>
          )}
        </div>
        
        <div className="flex items-baseline gap-2">
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{displayValue}</p>
          {metric.change !== undefined && (
            <div className={cn(
              'flex items-center gap-1 text-sm font-medium',
              metric.trend === 'up' && 'text-green-600 dark:text-green-400',
              metric.trend === 'down' && 'text-red-600 dark:text-red-400',
              metric.trend === 'neutral' && 'text-gray-600 dark:text-gray-400'
            )}>
              {metric.trend === 'up' && (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              )}
              {metric.trend === 'down' && (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                </svg>
              )}
              {Math.abs(metric.change).toFixed(1)}%
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

