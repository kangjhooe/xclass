'use client';

import { useState, useCallback } from 'react';
import { useToastStore } from '@/lib/store/toast';
import { apiClient } from '../api/client';

export interface UseExportImportOptions {
  modulePath: string; // e.g., 'students', 'teachers'
  tenantId?: number | string;
  onImportSuccess?: (data: any[]) => void;
  onImportError?: (error: Error) => void;
}

export function useExportImport(options: UseExportImportOptions) {
  const { modulePath, tenantId, onImportSuccess, onImportError } = options;
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const { success, error, promise } = useToastStore();

  const exportData = useCallback(
    async (format: 'excel' | 'csv' | 'pdf', data?: any[], filename?: string) => {
      setIsExporting(true);
      try {
        const baseUrl = tenantId
          ? `/tenants/${tenantId}/${modulePath}/export`
          : `/${modulePath}/export`;

        const response = await apiClient.get(`${baseUrl}/${format}`, {
          responseType: 'blob',
          params: data ? { data: JSON.stringify(data) } : {},
        });

        const blob = new Blob([response.data], {
          type:
            format === 'excel'
              ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
              : format === 'pdf'
              ? 'application/pdf'
              : 'text/csv;charset=utf-8;',
        });

        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download =
          filename ||
          `${modulePath}_${new Date().toISOString().split('T')[0]}.${
            format === 'excel' ? 'xlsx' : format
          }`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);

        success(`Data berhasil diekspor ke ${format.toUpperCase()}`);
      } catch (err: any) {
        error(err.message || 'Gagal mengekspor data');
        throw err;
      } finally {
        setIsExporting(false);
      }
    },
    [modulePath, tenantId, success, error]
  );

  const importData = useCallback(
    async (file: File, format: 'excel' | 'csv', options?: {
      sheetIndex?: number;
      startRow?: number;
      mapping?: Record<string, string>;
    }) => {
      setIsImporting(true);
      try {
        const baseUrl = tenantId
          ? `/tenants/${tenantId}/${modulePath}/import`
          : `/${modulePath}/import`;

        const formData = new FormData();
        formData.append('file', file);
        if (options?.sheetIndex !== undefined) {
          formData.append('sheetIndex', String(options.sheetIndex));
        }
        if (options?.startRow !== undefined) {
          formData.append('startRow', String(options.startRow));
        }
        if (options?.mapping) {
          formData.append('mapping', JSON.stringify(options.mapping));
        }

        const result = await promise(
          apiClient.post(`${baseUrl}/${format}`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }),
          {
            loading: 'Mengimpor data...',
            success: (data: any) => `Berhasil mengimpor ${data.data?.count || 0} data`,
            error: (err: any) => err.message || 'Gagal mengimpor data',
          }
        );

        onImportSuccess?.(result.data?.data || []);
        return result.data;
      } catch (err: any) {
        onImportError?.(err);
        throw err;
      } finally {
        setIsImporting(false);
      }
    },
    [modulePath, tenantId, promise, onImportSuccess, onImportError]
  );

  return {
    exportData,
    importData,
    isExporting,
    isImporting,
  };
}

