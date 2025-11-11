'use client';

import { useCallback } from 'react';
import { Card } from '../ui/Card';
import { cn } from '@/lib/utils/cn';
import { ReportSection, ReportElement } from './types';
import { ElementRenderer } from './ElementRenderer';

interface ReportCanvasProps {
  section: ReportSection;
  selectedElement: ReportElement | null;
  onSelectElement: (element: ReportElement | null) => void;
  onUpdateElement: (elementId: string, updates: Partial<ReportElement>) => void;
  onDeleteElement: (elementId: string) => void;
  onMoveElement: (elementId: string, position: { x: number; y: number }) => void;
  layout: 'portrait' | 'landscape';
}

export function ReportCanvas({
  section,
  selectedElement,
  onSelectElement,
  onUpdateElement,
  onDeleteElement,
  onMoveElement,
  layout,
}: ReportCanvasProps) {
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const elementType = e.dataTransfer.getData('elementType') as ReportElement['type'];
    if (elementType) {
      // This will be handled by parent component
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  return (
    <div className="flex justify-center">
      <Card
        className={cn(
          'bg-white shadow-lg',
          layout === 'portrait' ? 'w-[210mm] min-h-[297mm]' : 'w-[297mm] min-h-[210mm]',
          'p-8'
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <div className="relative" style={{ minHeight: '100%' }}>
          {section.elements.map((element) => (
            <div
              key={element.id}
              onClick={() => onSelectElement(element)}
              className={cn(
                'relative mb-4 cursor-pointer transition-all',
                selectedElement?.id === element.id
                  ? 'ring-2 ring-blue-500 ring-offset-2'
                  : 'hover:ring-1 hover:ring-gray-300'
              )}
              style={{
                left: `${element.position.x}px`,
                top: `${element.position.y}px`,
                width: element.position.width ? `${element.position.width}%` : 'auto',
                height: element.position.height ? `${element.position.height}px` : 'auto',
              }}
            >
              <ElementRenderer element={element} />
              {selectedElement?.id === element.id && (
                <div className="absolute -top-8 right-0 flex gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteElement(element.id);
                    }}
                    className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                  >
                    Hapus
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

