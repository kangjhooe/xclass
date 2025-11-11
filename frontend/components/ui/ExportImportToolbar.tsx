'use client';

import { useState } from 'react';
import { Button } from './Button';
import { ExportButton } from './ExportButton';
import { ImportButton } from './ImportButton';
import { useToastStore } from '@/lib/store/toast';
import { cn } from '@/lib/utils/cn';

export interface ExportImportToolbarProps {
  moduleName: string;
  modulePath: string; // e.g., 'students', 'teachers', 'classes'
  tenantId?: number | string;
  data: any[];
  columns?: { key: string; header: string; width?: number }[];
  onImportSuccess?: (data: any[]) => void;
  onImportError?: (error: Error) => void;
  className?: string;
  showImport?: boolean;
  showExport?: boolean;
  exportFormats?: ('excel' | 'csv' | 'pdf')[];
  customExport?: (format: 'excel' | 'csv' | 'pdf') => Promise<void>;
  customImport?: (file: File, format: 'excel' | 'csv') => Promise<any[]>;
}

export function ExportImportToolbar({
  moduleName,
  modulePath,
  tenantId,
  data,
  columns,
  onImportSuccess,
  onImportError,
  className,
  showImport = true,
  showExport = true,
  exportFormats = ['excel', 'csv', 'pdf'],
  customExport,
  customImport,
}: ExportImportToolbarProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const { success, error, promise } = useToastStore();

  const handleExport = async (format: 'excel' | 'csv' | 'pdf') => {
    if (customExport) {
      await customExport(format);
      return;
    }

    setIsExporting(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
      const baseUrl = tenantId
        ? `${apiUrl}/tenants/${tenantId}/${modulePath}/export`
        : `${apiUrl}/${modulePath}/export`;

      const url = `${baseUrl}/${format}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Export gagal');
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${moduleName}_${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      success(`Data berhasil diekspor ke ${format.toUpperCase()}`);
    } catch (err: any) {
      error(err.message || 'Gagal mengekspor data');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async (file: File, format: 'excel' | 'csv') => {
    if (customImport) {
      try {
        const result = await customImport(file, format);
        onImportSuccess?.(result);
        return;
      } catch (err: any) {
        onImportError?.(err);
        return;
      }
    }

    setIsImporting(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
      const baseUrl = tenantId
        ? `${apiUrl}/tenants/${tenantId}/${modulePath}/import`
        : `${apiUrl}/${modulePath}/import`;

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${baseUrl}/${format}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Import gagal');
      }

      const result = await response.json();
      success(`Berhasil mengimpor ${result.count || 0} data`);
      onImportSuccess?.(result.data || []);
    } catch (err: any) {
      error(err.message || 'Gagal mengimpor data');
      onImportError?.(err);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {showExport && (
        <div className="flex items-center gap-2">
          {exportFormats.includes('excel') && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('excel')}
              disabled={isExporting || data.length === 0}
              className="flex items-center gap-2"
            >
              {isExporting ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Mengekspor...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Excel
                </>
              )}
            </Button>
          )}
          {exportFormats.includes('csv') && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('csv')}
              disabled={isExporting || data.length === 0}
              className="flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              CSV
            </Button>
          )}
          {exportFormats.includes('pdf') && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('pdf')}
              disabled={isExporting || data.length === 0}
              className="flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              PDF
            </Button>
          )}
        </div>
      )}

      {showImport && (
        <ImportButton
          onImport={handleImport}
          isLoading={isImporting}
          accept={exportFormats.includes('excel') ? '.xlsx,.xls' : '.csv'}
          label="Impor"
        />
      )}
    </div>
  );
}

