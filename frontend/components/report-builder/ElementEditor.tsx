'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { ReportElement } from './types';

interface ElementEditorProps {
  element: ReportElement;
  onUpdate: (elementId: string, updates: Partial<ReportElement>) => void;
  onDelete: (elementId: string) => void;
}

export function ElementEditor({ element, onUpdate, onDelete }: ElementEditorProps) {
  const [config, setConfig] = useState(element.config);

  useEffect(() => {
    setConfig(element.config);
  }, [element]);

  const handleConfigChange = (key: string, value: any) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    onUpdate(element.id, { config: newConfig });
  };

  const renderEditor = () => {
    switch (element.type) {
      case 'text':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Content</label>
              <textarea
                value={config.content || ''}
                onChange={(e) => handleConfigChange('content', e.target.value)}
                className="w-full p-2 border rounded"
                rows={4}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Font Size</label>
              <Input
                type="number"
                value={config.fontSize || 14}
                onChange={(e) => handleConfigChange('fontSize', parseInt(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Font Weight</label>
              <Select
                value={config.fontWeight || 'normal'}
                onChange={(e) => handleConfigChange('fontWeight', e.target.value)}
              >
                <option value="normal">Normal</option>
                <option value="bold">Bold</option>
                <option value="lighter">Light</option>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Align</label>
              <Select
                value={config.align || 'left'}
                onChange={(e) => handleConfigChange('align', e.target.value)}
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </Select>
            </div>
          </div>
        );

      case 'table':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Show Header</label>
              <input
                type="checkbox"
                checked={config.showHeader !== false}
                onChange={(e) => handleConfigChange('showHeader', e.target.checked)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Columns (comma separated)</label>
              <Input
                value={Array.isArray(config.columns) ? config.columns.join(', ') : ''}
                onChange={(e) => handleConfigChange('columns', e.target.value.split(',').map(s => s.trim()))}
                placeholder="Column1, Column2, Column3"
              />
            </div>
          </div>
        );

      case 'chart':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Chart Type</label>
              <Select
                value={config.chartType || 'bar'}
                onChange={(e) => handleConfigChange('chartType', e.target.value)}
              >
                <option value="bar">Bar</option>
                <option value="line">Line</option>
                <option value="pie">Pie</option>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Data Key</label>
              <Input
                value={config.dataKey || 'value'}
                onChange={(e) => handleConfigChange('dataKey', e.target.value)}
              />
            </div>
          </div>
        );

      case 'image':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Image URL</label>
              <Input
                value={config.src || ''}
                onChange={(e) => handleConfigChange('src', e.target.value)}
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Alt Text</label>
              <Input
                value={config.alt || ''}
                onChange={(e) => handleConfigChange('alt', e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium mb-1">Width</label>
                <Input
                  type="number"
                  value={config.width || 100}
                  onChange={(e) => handleConfigChange('width', parseInt(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Height</label>
                <Input
                  type="number"
                  value={config.height || 100}
                  onChange={(e) => handleConfigChange('height', parseInt(e.target.value))}
                />
              </div>
            </div>
          </div>
        );

      case 'query':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">SQL Query</label>
              <textarea
                value={config.query || ''}
                onChange={(e) => handleConfigChange('query', e.target.value)}
                className="w-full p-2 border rounded font-mono text-sm"
                rows={8}
                placeholder="SELECT * FROM students WHERE instansiId = :instansiId"
              />
            </div>
          </div>
        );

      case 'line':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Style</label>
              <Select
                value={config.style || 'solid'}
                onChange={(e) => handleConfigChange('style', e.target.value)}
              >
                <option value="solid">Solid</option>
                <option value="dashed">Dashed</option>
                <option value="dotted">Dotted</option>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Color</label>
              <Input
                type="color"
                value={config.color || '#000000'}
                onChange={(e) => handleConfigChange('color', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Thickness</label>
              <Input
                type="number"
                value={config.thickness || 1}
                onChange={(e) => handleConfigChange('thickness', parseInt(e.target.value))}
              />
            </div>
          </div>
        );

      case 'spacer':
        return (
          <div>
            <label className="block text-sm font-medium mb-1">Height (px)</label>
            <Input
              type="number"
              value={config.height || 20}
              onChange={(e) => handleConfigChange('height', parseInt(e.target.value))}
            />
          </div>
        );

      default:
        return <div className="text-gray-500">No editor available for this element type</div>;
    }
  };

  return (
    <div className="p-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg capitalize">{element.type} Editor</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {renderEditor()}
          <div className="pt-4 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(element.id)}
              className="w-full text-red-600 hover:text-red-700"
            >
              Hapus Elemen
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

