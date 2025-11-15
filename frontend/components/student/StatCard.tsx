'use client';

import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Progress } from '@/components/ui/Progress';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  gradient: string;
  iconBg?: string;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  progress?: {
    value: number;
    max?: number;
    variant?: 'default' | 'success' | 'warning' | 'danger';
  };
  className?: string;
}

export default function StatCard({
  title,
  value,
  icon: Icon,
  gradient,
  iconBg,
  subtitle,
  trend,
  progress,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1',
        className
      )}
    >
      {/* Gradient Background */}
      <div className={cn('absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity', gradient)} />
      
      {/* Content */}
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
          </div>
          <div
            className={cn(
              'w-12 h-12 rounded-xl flex items-center justify-center shadow-md transition-transform group-hover:scale-110 group-hover:rotate-3',
              iconBg || gradient
            )}
          >
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* Progress Bar */}
        {progress && (
          <div className="mt-3">
            <Progress
              value={progress.value}
              max={progress.max}
              variant={progress.variant}
              size="sm"
              showLabel={false}
            />
          </div>
        )}

        {/* Trend Indicator */}
        {trend && (
          <div className={cn('flex items-center gap-1 text-xs font-medium mt-2', trend.isPositive ? 'text-green-600' : 'text-red-600')}>
            <span>{trend.isPositive ? '↑' : '↓'}</span>
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>

      {/* Decorative Elements */}
      <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full opacity-10 blur-2xl bg-gradient-to-br from-blue-400 to-purple-400 pointer-events-none" />
    </div>
  );
}

