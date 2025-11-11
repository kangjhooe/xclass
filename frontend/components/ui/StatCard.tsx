import { ReactNode } from 'react';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils/cn';
import { getPageTheme, PageTheme } from '@/lib/ui/pageThemes';

interface StatCardProps {
  label: string;
  value: string | number;
  theme?: PageTheme;
  icon?: ReactNode;
  footer?: ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  className?: string;
}

export function StatCard({
  label,
  value,
  theme = 'indigo',
  icon,
  footer,
  trend,
  className,
}: StatCardProps) {
  const { accentText, iconBackground, cardBorder } = getPageTheme(theme);

  // Map theme to gradient colors
  const gradientMap: Record<string, string> = {
    indigo: 'from-indigo-500 via-indigo-600 to-purple-600',
    blue: 'from-blue-500 via-blue-600 to-indigo-600',
    emerald: 'from-emerald-500 via-emerald-600 to-teal-600',
    purple: 'from-purple-500 via-purple-600 to-pink-600',
    orange: 'from-orange-500 via-amber-600 to-yellow-600',
    green: 'from-green-500 via-emerald-600 to-teal-600',
    red: 'from-red-500 via-rose-600 to-pink-600',
    cyan: 'from-cyan-500 via-blue-600 to-indigo-600',
  };

  const gradient = gradientMap[theme] || gradientMap.indigo;

  return (
    <div
      className={cn(
        'group relative bg-gradient-to-br',
        gradient,
        'p-6 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden border border-white/20',
        className,
      )}
    >
      {/* Animated Background Elements */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-700"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16 group-hover:scale-150 transition-transform duration-700" style={{ animationDelay: '100ms' }}></div>
      <div className="absolute top-1/2 right-1/4 w-20 h-20 bg-white/5 rounded-full blur-xl group-hover:scale-125 transition-transform duration-700" style={{ animationDelay: '200ms' }}></div>
      
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-white/80 rounded-full"></div>
            <p className="text-white/90 text-xs font-semibold uppercase tracking-wider">{label}</p>
          </div>
          <p className="text-5xl font-extrabold text-white mb-2 drop-shadow-lg">{value}</p>
          {trend && (
            <span
              className={cn(
                'mt-2 inline-flex items-center text-xs font-semibold rounded-full px-3 py-1',
                trend.isPositive
                  ? 'bg-white/20 text-white backdrop-blur-sm'
                  : 'bg-white/20 text-white backdrop-blur-sm',
              )}
            >
              {trend.isPositive ? '▲' : '▼'} {trend.value}
            </span>
          )}
          {footer && <p className="text-xs text-white/70 font-medium mt-2">{footer}</p>}
        </div>
        {icon && (
          <div className="ml-4">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg group-hover:bg-white/30 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
              <div className="text-white">{icon}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
