import { applyDecorators, Get, Post, UseInterceptors, UploadedFile, Query, Res, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiOperation, ApiResponse, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { Response } from 'express';

/**
 * Decorator untuk menambahkan endpoint export/import ke controller
 * 
 * @example
 * ```ts
 * @Controller('teachers')
 * export class TeachersController {
 *   @ExportImportEndpoints('teachers', {
 *     columns: [
 *       { key: 'name', header: 'Nama', width: 20 },
 *       { key: 'nip', header: 'NIP', width: 15 },
 *     ]
 *   })
 *   // Controller methods...
 * }
 * ```
 */
export function ExportImportEndpoints(
  moduleName: string,
  options?: {
    columns?: { key: string; header: string; width?: number }[];
    getDataFn?: (query: any, tenantId: number) => Promise<any[]>;
  }
) {
  return function (target: any) {
    // This is a marker decorator - actual implementation should be done in controller
    // The decorator is mainly for documentation purposes
  };
}

/**
 * Helper function untuk membuat export endpoint
 */
export function createExportEndpoint(
  format: 'excel' | 'csv' | 'pdf',
  moduleName: string,
  getDataFn: (query: any, tenantId: number) => Promise<any[]>,
  columns?: { key: string; header: string; width?: number }[]
) {
  return applyDecorators(
    Get(`export/${format}`),
    ApiOperation({ summary: `Export data ${moduleName} ke ${format.toUpperCase()}` }),
    ApiResponse({ status: 200, description: `File ${format.toUpperCase()} berhasil di-generate` })
  );
}

/**
 * Helper function untuk membuat import endpoint
 */
export function createImportEndpoint(
  format: 'excel' | 'csv',
  moduleName: string
) {
  return applyDecorators(
    Post(`import/${format}`),
    UseInterceptors(FileInterceptor('file')),
    ApiOperation({ summary: `Import data ${moduleName} dari file ${format.toUpperCase()}` }),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          file: {
            type: 'string',
            format: 'binary',
          },
          sheetIndex: {
            type: 'number',
            description: 'Sheet index (untuk Excel, default: 0)',
          },
          startRow: {
            type: 'number',
            description: 'Baris mulai data (default: 1)',
          },
          mapping: {
            type: 'string',
            description: 'JSON mapping kolom (optional)',
          },
        },
      },
    }),
    ApiResponse({ status: 200, description: `Data ${moduleName} berhasil diimport` })
  );
}

