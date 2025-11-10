import { apiClient } from './client';

export interface ExportOptions {
  filename?: string;
  sheetName?: string;
  headers?: string[];
  columns?: { key: string; header: string; width?: number }[];
  data: any[];
}

export interface ImportOptions {
  file: File;
  sheetIndex?: number;
  startRow?: number;
  mapping?: Record<string, string>;
}

export const exportImportApi = {
  /**
   * Export data ke Excel
   */
  exportExcel: async (options: ExportOptions, tenantId?: string) => {
    const params = new URLSearchParams();
    if (options.filename) params.append('filename', options.filename);
    if (options.sheetName) params.append('sheetName', options.sheetName);
    if (options.headers) params.append('headers', JSON.stringify(options.headers));
    if (options.columns) params.append('columns', JSON.stringify(options.columns));
    params.append('data', JSON.stringify(options.data));

    const url = tenantId
      ? `/tenants/${tenantId}/students/export/excel?${params.toString()}`
      : `/export-import/export/excel?${params.toString()}`;

    const response = await apiClient.get(url, {
      responseType: 'blob',
    });

    // Create download link
    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url_blob = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url_blob;
    link.download = options.filename || 'export.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url_blob);
  },

  /**
   * Export data ke CSV
   */
  exportCSV: async (options: ExportOptions, tenantId?: string) => {
    const params = new URLSearchParams();
    if (options.filename) params.append('filename', options.filename);
    if (options.headers) params.append('headers', JSON.stringify(options.headers));
    if (options.columns) params.append('columns', JSON.stringify(options.columns));
    params.append('data', JSON.stringify(options.data));

    const url = tenantId
      ? `/tenants/${tenantId}/students/export/csv?${params.toString()}`
      : `/export-import/export/csv?${params.toString()}`;

    const response = await apiClient.get(url, {
      responseType: 'blob',
    });

    // Create download link
    const blob = new Blob([response.data], {
      type: 'text/csv;charset=utf-8;',
    });
    const url_blob = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url_blob;
    link.download = options.filename || 'export.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url_blob);
  },

  /**
   * Export data ke PDF
   */
  exportPDF: async (options: ExportOptions, tenantId?: string) => {
    const params = new URLSearchParams();
    if (options.filename) params.append('filename', options.filename);
    if (options.headers) params.append('headers', JSON.stringify(options.headers));
    if (options.columns) params.append('columns', JSON.stringify(options.columns));
    params.append('data', JSON.stringify(options.data));

    const url = tenantId
      ? `/tenants/${tenantId}/students/export/pdf?${params.toString()}`
      : `/export-import/export/pdf?${params.toString()}`;

    const response = await apiClient.get(url, {
      responseType: 'blob',
    });

    // Create download link
    const blob = new Blob([response.data], {
      type: 'application/pdf',
    });
    const url_blob = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url_blob;
    link.download = options.filename || 'export.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url_blob);
  },

  /**
   * Import data dari Excel
   */
  importExcel: async (options: ImportOptions, tenantId?: string) => {
    const formData = new FormData();
    formData.append('file', options.file);
    if (options.sheetIndex !== undefined) {
      formData.append('sheetIndex', String(options.sheetIndex));
    }
    if (options.startRow !== undefined) {
      formData.append('startRow', String(options.startRow));
    }
    if (options.mapping) {
      formData.append('mapping', JSON.stringify(options.mapping));
    }

    const url = tenantId
      ? `/tenants/${tenantId}/students/import/excel`
      : `/export-import/import/excel`;

    const response = await apiClient.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  /**
   * Import data dari CSV
   */
  importCSV: async (options: ImportOptions, tenantId?: string) => {
    const formData = new FormData();
    formData.append('file', options.file);
    if (options.startRow !== undefined) {
      formData.append('startRow', String(options.startRow));
    }
    if (options.mapping) {
      formData.append('mapping', JSON.stringify(options.mapping));
    }

    const url = tenantId
      ? `/tenants/${tenantId}/students/import/csv`
      : `/export-import/import/csv`;

    const response = await apiClient.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },
};

