import {
  Controller,
  Post,
  Get,
  Query,
  Res,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { ExportImportService, ExportOptions, ImportOptions } from './export-import.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { TenantId } from '../../common/decorators/tenant.decorator';

@ApiTags('export-import')
@ApiBearerAuth()
@Controller('export-import')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ExportImportController {
  constructor(private readonly exportImportService: ExportImportService) {}

  @Post('import/excel')
  @ApiOperation({ summary: 'Import data dari file Excel' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        sheetIndex: {
          type: 'string',
          description: 'Index sheet (default: 0)',
        },
        startRow: {
          type: 'string',
          description: 'Baris mulai data (default: 1)',
        },
        mapping: {
          type: 'string',
          description: 'JSON mapping kolom ke field',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Data berhasil diimport' })
  @ApiResponse({ status: 400, description: 'File tidak ditemukan atau format tidak valid' })
  @Roles('admin', 'super_admin')
  @UseInterceptors(FileInterceptor('file'))
  async importExcel(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { sheetIndex?: string; startRow?: string; mapping?: string },
    @TenantId() tenantId?: number,
  ) {
    if (!file) {
      throw new Error('File tidak ditemukan');
    }

    const options: ImportOptions = {
      file,
      sheetIndex: body.sheetIndex ? parseInt(body.sheetIndex) : undefined,
      startRow: body.startRow ? parseInt(body.startRow) : undefined,
      mapping: body.mapping ? JSON.parse(body.mapping) : undefined,
    };

    const data = await this.exportImportService.importFromExcel(options);
    return {
      success: true,
      data,
      count: data.length,
    };
  }

  @Post('import/csv')
  @ApiOperation({ summary: 'Import data dari file CSV' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        startRow: {
          type: 'string',
          description: 'Baris mulai data (default: 1)',
        },
        mapping: {
          type: 'string',
          description: 'JSON mapping kolom ke field',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Data berhasil diimport' })
  @ApiResponse({ status: 400, description: 'File tidak ditemukan atau format tidak valid' })
  @Roles('admin', 'super_admin')
  @UseInterceptors(FileInterceptor('file'))
  async importCSV(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { startRow?: string; mapping?: string },
    @TenantId() tenantId?: number,
  ) {
    if (!file) {
      throw new Error('File tidak ditemukan');
    }

    const options: ImportOptions = {
      file,
      startRow: body.startRow ? parseInt(body.startRow) : undefined,
      mapping: body.mapping ? JSON.parse(body.mapping) : undefined,
    };

    const data = await this.exportImportService.importFromCSV(options);
    return {
      success: true,
      data,
      count: data.length,
    };
  }

  @Get('export/excel')
  @ApiOperation({ summary: 'Export data ke file Excel (.xlsx)' })
  @ApiResponse({ status: 200, description: 'File Excel berhasil di-generate', content: {
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
      schema: { type: 'string', format: 'binary' },
    },
  }})
  @Roles('admin', 'super_admin')
  async exportExcel(
    @Query() query: {
      filename?: string;
      sheetName?: string;
      headers?: string;
      columns?: string;
      data?: string;
    },
    @Res() res: Response,
    @TenantId() tenantId?: number,
  ) {
    try {
      const options: ExportOptions = {
        filename: query.filename || 'export.xlsx',
        sheetName: query.sheetName,
        headers: query.headers ? JSON.parse(query.headers) : undefined,
        columns: query.columns ? JSON.parse(query.columns) : undefined,
        data: query.data ? JSON.parse(query.data) : [],
      };

      await this.exportImportService.exportToExcel(options, res);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  @Get('export/csv')
  @ApiOperation({ summary: 'Export data ke file CSV' })
  @ApiResponse({ status: 200, description: 'File CSV berhasil di-generate', content: {
    'text/csv': {
      schema: { type: 'string', format: 'binary' },
    },
  }})
  @Roles('admin', 'super_admin')
  async exportCSV(
    @Query() query: {
      filename?: string;
      headers?: string;
      columns?: string;
      data?: string;
    },
    @Res() res: Response,
    @TenantId() tenantId?: number,
  ) {
    try {
      const options: ExportOptions = {
        filename: query.filename || 'export.csv',
        headers: query.headers ? JSON.parse(query.headers) : undefined,
        columns: query.columns ? JSON.parse(query.columns) : undefined,
        data: query.data ? JSON.parse(query.data) : [],
      };

      await this.exportImportService.exportToCSV(options, res);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  @Get('export/pdf')
  @ApiOperation({ summary: 'Export data ke file PDF' })
  @ApiResponse({ status: 200, description: 'File PDF berhasil di-generate', content: {
    'application/pdf': {
      schema: { type: 'string', format: 'binary' },
    },
  }})
  @Roles('admin', 'super_admin')
  async exportPDF(
    @Query() query: {
      filename?: string;
      headers?: string;
      columns?: string;
      data?: string;
    },
    @Res() res: Response,
    @TenantId() tenantId?: number,
  ) {
    try {
      const options: ExportOptions = {
        filename: query.filename || 'export.pdf',
        headers: query.headers ? JSON.parse(query.headers) : undefined,
        columns: query.columns ? JSON.parse(query.columns) : undefined,
        data: query.data ? JSON.parse(query.data) : [],
      };

      await this.exportImportService.exportToPDF(options, res);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

