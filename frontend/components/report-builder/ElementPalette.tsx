'use client';

import { Card, CardContent } from '../ui/Card';
import { cn } from '@/lib/utils/cn';
import { ReportElement } from './types';

interface ElementPaletteProps {
  onAddElement: (type: ReportElement['type']) => void;
}

const elementTypes: { type: ReportElement['type']; label: string; icon: string }[] = [
  { type: 'text', label: 'Text', icon: '📝' },
  { type: 'table', label: 'Table', icon: '📊' },
  { type: 'chart', label: 'Chart', icon: '📈' },
  { type: 'image', label: 'Image', icon: '🖼️' },
  { type: 'query', label: 'Query', icon: '🔍' },
  { type: 'line', label: 'Line', icon: '➖' },
  { type: 'spacer', label: 'Spacer', icon: '⬜' },
];

export function ElementPalette({ onAddElement }: ElementPaletteProps) {
  return (
    <div className="p-4">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
        Elemen Laporan
      </h3>
      <div className="space-y-2">
        {elementTypes.map((item) => (
          <button
            key={item.type}
            onClick={() => onAddElement(item.type)}
            className={cn(
              'w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700',
              'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700',
              'transition-colors text-left flex items-center gap-3',
              'cursor-move'
            )}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('elementType', item.type);
            }}
          >
            <span className="text-2xl">{item.icon}</span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

