'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { cn } from '@/lib/utils/cn';
import { ReportElement, ReportSection, ReportBuilderConfig } from './types';
import { ElementPalette } from './ElementPalette';
import { ReportCanvas } from './ReportCanvas';
import { ElementEditor } from './ElementEditor';

export interface ReportBuilderProps {
  initialConfig?: ReportBuilderConfig;
  onSave?: (config: ReportBuilderConfig) => void;
  onPreview?: (config: ReportBuilderConfig) => void;
  onExport?: (config: ReportBuilderConfig, format: 'pdf' | 'excel' | 'html') => void;
}

export function ReportBuilder({
  initialConfig,
  onSave,
  onPreview,
  onExport,
}: ReportBuilderProps) {
  const [config, setConfig] = useState<ReportBuilderConfig>(
    initialConfig || {
      layout: 'portrait',
      sections: [
        {
          id: 'header',
          type: 'header',
          elements: [],
        },
        {
          id: 'body',
          type: 'body',
          elements: [],
        },
        {
          id: 'footer',
          type: 'footer',
          elements: [],
        },
      ],
    }
  );

  const [selectedElement, setSelectedElement] = useState<ReportElement | null>(null);
  const [selectedSection, setSelectedSection] = useState<string>('body');
  const [reportName, setReportName] = useState('');
  const [reportCategory, setReportCategory] = useState('general');

  const handleAddElement = useCallback((elementType: ReportElement['type']) => {
    const newElement: ReportElement = {
      id: `element-${Date.now()}`,
      type: elementType,
      position: {
        x: 0,
        y: 0,
        width: elementType === 'table' ? 100 : undefined,
        height: elementType === 'chart' ? 200 : undefined,
      },
      config: getDefaultConfig(elementType),
    };

    setConfig((prev) => ({
      ...prev,
      sections: prev.sections.map((section) =>
        section.id === selectedSection
          ? { ...section, elements: [...section.elements, newElement] }
          : section
      ),
    }));

    setSelectedElement(newElement);
  }, [selectedSection]);

  const handleUpdateElement = useCallback((elementId: string, updates: Partial<ReportElement>) => {
    setConfig((prev) => ({
      ...prev,
      sections: prev.sections.map((section) => ({
        ...section,
        elements: section.elements.map((el) =>
          el.id === elementId ? { ...el, ...updates } : el
        ),
      })),
    }));

    if (selectedElement?.id === elementId) {
      setSelectedElement((prev) => (prev ? { ...prev, ...updates } : null));
    }
  }, [selectedElement]);

  const handleDeleteElement = useCallback((elementId: string) => {
    setConfig((prev) => ({
      ...prev,
      sections: prev.sections.map((section) => ({
        ...section,
        elements: section.elements.filter((el) => el.id !== elementId),
      })),
    }));

    if (selectedElement?.id === elementId) {
      setSelectedElement(null);
    }
  }, [selectedElement]);

  const handleMoveElement = useCallback((elementId: string, newPosition: { x: number; y: number }) => {
    handleUpdateElement(elementId, { position: { ...selectedElement?.position, ...newPosition } });
  }, [handleUpdateElement, selectedElement]);

  const currentSection = config.sections.find((s) => s.id === selectedSection);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Left Sidebar - Element Palette */}
      <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
        <ElementPalette onAddElement={handleAddElement} />
      </div>

      {/* Center - Canvas */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Input
                placeholder="Nama Laporan"
                value={reportName}
                onChange={(e) => setReportName(e.target.value)}
                className="w-64"
              />
              <Select
                value={reportCategory}
                onChange={(e) => setReportCategory(e.target.value)}
                className="w-48"
              >
                <option value="general">Umum</option>
                <option value="academic">Akademik</option>
                <option value="attendance">Kehadiran</option>
                <option value="financial">Keuangan</option>
              </Select>
              <Select
                value={config.layout}
                onChange={(e) => setConfig((prev) => ({ ...prev, layout: e.target.value as 'portrait' | 'landscape' }))}
                className="w-32"
              >
                <option value="portrait">Portrait</option>
                <option value="landscape">Landscape</option>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => onPreview?.(config)}>
                Preview
              </Button>
              <Button variant="outline" size="sm" onClick={() => onExport?.(config, 'pdf')}>
                Export PDF
              </Button>
              <Button variant="outline" size="sm" onClick={() => onExport?.(config, 'excel')}>
                Export Excel
              </Button>
              <Button size="sm" onClick={() => onSave?.(config)}>
                Simpan
              </Button>
            </div>
          </div>

          {/* Section Tabs */}
          <div className="flex gap-2">
            {config.sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setSelectedSection(section.id)}
                className={cn(
                  'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                  selectedSection === section.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                )}
              >
                {section.type === 'header' ? 'Header' : section.type === 'footer' ? 'Footer' : 'Body'}
              </button>
            ))}
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 overflow-auto p-8 bg-gray-100 dark:bg-gray-900">
          <ReportCanvas
            section={currentSection!}
            selectedElement={selectedElement}
            onSelectElement={setSelectedElement}
            onUpdateElement={handleUpdateElement}
            onDeleteElement={handleDeleteElement}
            onMoveElement={handleMoveElement}
            layout={config.layout}
          />
        </div>
      </div>

      {/* Right Sidebar - Element Editor */}
      <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 overflow-y-auto">
        {selectedElement ? (
          <ElementEditor
            element={selectedElement}
            onUpdate={handleUpdateElement}
            onDelete={handleDeleteElement}
          />
        ) : (
          <div className="p-6 text-center text-gray-500 dark:text-gray-400">
            Pilih elemen untuk mengedit
          </div>
        )}
      </div>
    </div>
  );
}

function getDefaultConfig(type: ReportElement['type']): Record<string, any> {
  switch (type) {
    case 'text':
      return { content: 'Text', fontSize: 14, fontWeight: 'normal', align: 'left' };
    case 'table':
      return { columns: [], data: [], showHeader: true };
    case 'chart':
      return { chartType: 'bar', data: [], dataKey: 'value' };
    case 'image':
      return { src: '', alt: '', width: 100, height: 100 };
    case 'query':
      return { query: '', parameters: {} };
    case 'line':
      return { style: 'solid', color: '#000000', thickness: 1 };
    case 'spacer':
      return { height: 20 };
    default:
      return {};
  }
}

