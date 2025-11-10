import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import * as XLSX from 'xlsx';
import PDFDocument from 'pdfkit';
import { Response } from 'express';

export interface ExportOptions {
  filename?: string;
  sheetName?: string;
  headers?: string[];
  data: any[];
  columns?: { key: string; header: string; width?: number }[];
}

export interface ImportOptions {
  file: Express.Multer.File;
  sheetIndex?: number;
  startRow?: number;
  mapping?: Record<string, string>; // { columnName: fieldName }
}

@Injectable()
export class ExportImportService {
  /**
   * Export data ke Excel
   */
  async exportToExcel(
    options: ExportOptions,
    res: Response,
  ): Promise<void> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(options.sheetName || 'Sheet1');

    // Set headers
    if (options.columns && options.columns.length > 0) {
      worksheet.columns = options.columns.map((col) => ({
        header: col.header,
        key: col.key,
        width: col.width || 15,
      }));

      // Add header row
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' },
      };
    } else if (options.headers && options.headers.length > 0) {
      worksheet.addRow(options.headers);
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' },
      };
    }

    // Add data rows
    options.data.forEach((row) => {
      if (options.columns) {
        const rowData: any = {};
        options.columns.forEach((col) => {
          rowData[col.key] = this.getNestedValue(row, col.key);
        });
        worksheet.addRow(rowData);
      } else {
        worksheet.addRow(row);
      }
    });

    // Set response headers
    const filename = options.filename || 'export.xlsx';
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Write to response
    await workbook.xlsx.write(res);
    res.end();
  }

  /**
   * Export data ke CSV
   */
  async exportToCSV(
    options: ExportOptions,
    res: Response,
  ): Promise<void> {
    let csv = '';

    // Add headers
    if (options.columns && options.columns.length > 0) {
      csv += options.columns.map((col) => col.header).join(',') + '\n';
    } else if (options.headers && options.headers.length > 0) {
      csv += options.headers.join(',') + '\n';
    }

    // Add data rows
    options.data.forEach((row) => {
      if (options.columns) {
        const values = options.columns.map((col) => {
          const value = this.getNestedValue(row, col.key);
          return this.escapeCSVValue(value);
        });
        csv += values.join(',') + '\n';
      } else {
        csv += row.join(',') + '\n';
      }
    });

    // Set response headers
    const filename = options.filename || 'export.csv';
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Write to response
    res.send('\ufeff' + csv); // BOM untuk Excel
    res.end();
  }

  /**
   * Export data ke PDF
   */
  async exportToPDF(
    options: ExportOptions,
    res: Response,
  ): Promise<void> {
    const doc = new PDFDocument({ margin: 50 });
    const filename = options.filename || 'export.pdf';

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    doc.pipe(res);

    // Title
    doc.fontSize(18).text('Data Export', { align: 'center' });
    doc.moveDown();

    // Table headers
    const headers = options.columns
      ? options.columns.map((col) => col.header)
      : options.headers || [];

    if (headers.length > 0) {
      // Header row
      doc.fontSize(12).font('Helvetica-Bold');
      let x = 50;
      const y = doc.y;
      const rowHeight = 25;
      const colWidth = (doc.page.width - 100) / headers.length;

      headers.forEach((header, index) => {
        doc.rect(x, y, colWidth, rowHeight).stroke();
        doc.text(header, x + 5, y + 5, {
          width: colWidth - 10,
          align: 'left',
        });
        x += colWidth;
      });

      doc.y += rowHeight;

      // Data rows
      doc.font('Helvetica');
      options.data.forEach((row, rowIndex) => {
        if (doc.y > doc.page.height - 50) {
          doc.addPage();
          doc.y = 50;
        }

        x = 50;
        const currentY = doc.y;

        if (options.columns) {
          options.columns.forEach((col, colIndex) => {
            const value = this.getNestedValue(row, col.key);
            doc.rect(x, currentY, colWidth, rowHeight).stroke();
            doc.text(String(value || ''), x + 5, currentY + 5, {
              width: colWidth - 10,
              align: 'left',
            });
            x += colWidth;
          });
        } else {
          headers.forEach((_, colIndex) => {
            const value = row[colIndex] || '';
            doc.rect(x, currentY, colWidth, rowHeight).stroke();
            doc.text(String(value), x + 5, currentY + 5, {
              width: colWidth - 10,
              align: 'left',
            });
            x += colWidth;
          });
        }

        doc.y += rowHeight;
      });
    } else {
      // Simple list format
      options.data.forEach((row, index) => {
        if (doc.y > doc.page.height - 50) {
          doc.addPage();
          doc.y = 50;
        }
        doc.fontSize(10).text(`${index + 1}. ${JSON.stringify(row)}`);
        doc.moveDown(0.5);
      });
    }

    doc.end();
  }

  /**
   * Import data dari Excel
   */
  async importFromExcel(options: ImportOptions): Promise<any[]> {
    const workbook = XLSX.read(options.file.buffer, { type: 'buffer' });
    const sheetIndex = options.sheetIndex || 0;
    const sheetName = workbook.SheetNames[sheetIndex];
    const worksheet = workbook.Sheets[sheetName];

    // Convert to JSON
    const startRow = options.startRow || 1;
    const jsonData = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: null,
    });

    // Skip header rows
    const dataRows = jsonData.slice(startRow);

    // Map columns if mapping provided
    if (options.mapping && jsonData.length > 0) {
      const headers = jsonData[0] as string[];
      return dataRows.map((row: any[]) => {
        const mapped: any = {};
        headers.forEach((header, index) => {
          const fieldName = options.mapping![header];
          if (fieldName) {
            mapped[fieldName] = row[index];
          } else {
            mapped[header] = row[index];
          }
        });
        return mapped;
      });
    }

    // Return as array of objects with first row as keys
    if (jsonData.length > 0) {
      const headers = jsonData[0] as string[];
      return dataRows.map((row: any[]) => {
        const obj: any = {};
        headers.forEach((header, index) => {
          obj[header] = row[index];
        });
        return obj;
      });
    }

    return [];
  }

  /**
   * Import data dari CSV
   */
  async importFromCSV(options: ImportOptions): Promise<any[]> {
    const text = options.file.buffer.toString('utf-8');
    const lines = text.split('\n').filter((line) => line.trim());

    if (lines.length === 0) return [];

    // Parse CSV (simple implementation)
    const parseCSVLine = (line: string): string[] => {
      const result: string[] = [];
      let current = '';
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    };

    const headers = parseCSVLine(lines[0]);
    const startRow = options.startRow || 1;
    const dataRows = lines.slice(startRow).map(parseCSVLine);

    // Map columns if mapping provided
    if (options.mapping) {
      return dataRows.map((row) => {
        const mapped: any = {};
        headers.forEach((header, index) => {
          const fieldName = options.mapping![header];
          if (fieldName) {
            mapped[fieldName] = row[index];
          } else {
            mapped[header] = row[index];
          }
        });
        return mapped;
      });
    }

    // Return as array of objects
    return dataRows.map((row) => {
      const obj: any = {};
      headers.forEach((header, index) => {
        obj[header] = row[index];
      });
      return obj;
    });
  }

  /**
   * Helper: Get nested value from object
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, prop) => current?.[prop], obj);
  }

  /**
   * Helper: Escape CSV value
   */
  private escapeCSVValue(value: any): string {
    if (value === null || value === undefined) return '';
    const str = String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }
}

