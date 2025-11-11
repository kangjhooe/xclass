'use client';

import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { LineChartComponent, BarChartComponent, PieChartComponent } from '../ui/Charts';
import { SkeletonChart } from '../ui/Skeleton';
import { cn } from '@/lib/utils/cn';

export interface AnalyticsWidgetProps {
  title: string;
  type: 'line' | 'bar' | 'pie' | 'metric' | 'table';
  data: any;
  isLoading?: boolean;
  className?: string;
  height?: number;
  config?: {
    dataKey?: string;
    lines?: { key: string; name: string; color?: string }[];
    bars?: { key: string; name: string; color?: string }[];
    showLegend?: boolean;
    showTooltip?: boolean;
  };
}

export function AnalyticsWidget({
  title,
  type,
  data,
  isLoading = false,
  className,
  height = 300,
  config = {},
}: AnalyticsWidgetProps) {
  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <SkeletonChart height={height} />
        </CardContent>
      </Card>
    );
  }

  const renderContent = () => {
    switch (type) {
      case 'line':
        return (
          <LineChartComponent
            data={data}
            dataKey={config.dataKey || 'value'}
            lines={config.lines}
            height={height}
          />
        );

      case 'bar':
        return (
          <BarChartComponent
            data={data}
            dataKey={config.dataKey || 'value'}
            bars={config.bars}
            height={height}
          />
        );

      case 'pie':
        return (
          <PieChartComponent
            data={data}
            dataKey={config.dataKey || 'value'}
            height={height}
          />
        );

      case 'metric':
        return (
          <div className="text-center py-8">
            <div className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              {data.value}
            </div>
            {data.label && (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {data.label}
              </div>
            )}
            {data.change !== undefined && (
              <div className={cn(
                'text-sm font-medium mt-2',
                data.change > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              )}>
                {data.change > 0 ? '+' : ''}{data.change}%
              </div>
            )}
          </div>
        );

      case 'table':
        return (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  {data.headers?.map((header: string, index: number) => (
                    <th key={index} className="text-left py-2 px-4 font-semibold text-gray-700 dark:text-gray-300">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.rows?.map((row: any[], rowIndex: number) => (
                  <tr key={rowIndex} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex} className="py-2 px-4 text-gray-600 dark:text-gray-400">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      default:
        return <div className="text-center py-8 text-gray-500">Unknown widget type</div>;
    }
  };

  return (
    <Card className={cn('h-full', className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {renderContent()}
      </CardContent>
    </Card>
  );
}

