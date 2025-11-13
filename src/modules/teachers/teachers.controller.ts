import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Res,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { TeachersService } from './teachers.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { ExportImportService } from '../export-import/export-import.service';

@ApiTags('teachers')
@ApiBearerAuth()
@Controller({ path: ['teachers', 'tenants/:tenant/teachers'] })
@UseGuards(JwtAuthGuard, TenantGuard)
export class TeachersController {
  constructor(
    private readonly teachersService: TeachersService,
    private readonly exportImportService: ExportImportService,
  ) {}

  @Post()
  create(@Body() createTeacherDto: CreateTeacherDto, @TenantId() instansiId: number) {
    return this.teachersService.create(createTeacherDto, instansiId);
  }

  @Get()
  findAll(
    @TenantId() instansiId: number,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('isActive') isActive?: string,
    @Query('gender') gender?: string,
  ) {
    return this.teachersService.findAll({
      search,
      instansiId,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
      gender,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string, @TenantId() instansiId: number) {
    return this.teachersService.findOne(+id, instansiId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTeacherDto: UpdateTeacherDto, @TenantId() instansiId: number) {
    return this.teachersService.update(+id, updateTeacherDto, instansiId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @TenantId() instansiId: number) {
    return this.teachersService.remove(+id, instansiId);
  }

  @Patch(':id/subjects')
  @ApiOperation({ summary: 'Update subjects untuk guru' })
  @ApiResponse({ status: 200, description: 'Subjects berhasil diupdate' })
  updateSubjects(
    @Param('id') id: string,
    @Body() body: { subjectIds: number[] },
    @TenantId() instansiId: number,
  ) {
    return this.teachersService.updateSubjects(+id, body.subjectIds, instansiId);
  }

  // Export endpoints
  @Get('export/excel')
  @ApiOperation({ summary: 'Export data guru ke Excel' })
  @ApiResponse({ status: 200, description: 'File Excel berhasil di-generate' })
  async exportExcel(@Query('search') search?: string, @TenantId() instansiId?: number, @Res() res?: Response) {
    const teachers = await this.teachersService.findAll({
      search,
      instansiId: instansiId || 0,
    });

    const teacherData = Array.isArray(teachers) ? teachers : teachers?.data || [];

    const columns = [
      { key: 'nip', header: 'NIP', width: 15 },
      { key: 'name', header: 'Nama', width: 30 },
      { key: 'email', header: 'Email', width: 25 },
      { key: 'phone', header: 'Telepon', width: 15 },
      { key: 'gender', header: 'Jenis Kelamin', width: 15 },
      { key: 'birth_place', header: 'Tempat Lahir', width: 20 },
      { key: 'birth_date', header: 'Tanggal Lahir', width: 15 },
      { key: 'address', header: 'Alamat', width: 40 },
      { key: 'status', header: 'Status', width: 12 },
    ];

    await this.exportImportService.exportToExcel(
      {
        filename: `teachers_${new Date().toISOString().split('T')[0]}.xlsx`,
        sheetName: 'Data Guru',
        data: teacherData,
        columns,
      },
      res,
    );
  }

  @Get('export/csv')
  @ApiOperation({ summary: 'Export data guru ke CSV' })
  @ApiResponse({ status: 200, description: 'File CSV berhasil di-generate' })
  async exportCSV(@Query('search') search?: string, @TenantId() instansiId?: number, @Res() res?: Response) {
    const teachers = await this.teachersService.findAll({
      search,
      instansiId: instansiId || 0,
    });

    const teacherData = Array.isArray(teachers) ? teachers : teachers?.data || [];

    const columns = [
      { key: 'nip', header: 'NIP' },
      { key: 'name', header: 'Nama' },
      { key: 'email', header: 'Email' },
      { key: 'phone', header: 'Telepon' },
      { key: 'gender', header: 'Jenis Kelamin' },
      { key: 'birth_place', header: 'Tempat Lahir' },
      { key: 'birth_date', header: 'Tanggal Lahir' },
      { key: 'address', header: 'Alamat' },
      { key: 'status', header: 'Status' },
    ];

    await this.exportImportService.exportToCSV(
      {
        filename: `teachers_${new Date().toISOString().split('T')[0]}.csv`,
        data: teacherData,
        columns,
      },
      res,
    );
  }

  @Get('export/pdf')
  @ApiOperation({ summary: 'Export data guru ke PDF' })
  @ApiResponse({ status: 200, description: 'File PDF berhasil di-generate' })
  async exportPDF(@Query('search') search?: string, @TenantId() instansiId?: number, @Res() res?: Response) {
    const teachers = await this.teachersService.findAll({
      search,
      instansiId: instansiId || 0,
    });

    const teacherData = Array.isArray(teachers) ? teachers : teachers?.data || [];

    const columns = [
      { key: 'nip', header: 'NIP', width: 15 },
      { key: 'name', header: 'Nama', width: 30 },
      { key: 'email', header: 'Email', width: 25 },
      { key: 'phone', header: 'Telepon', width: 15 },
      { key: 'gender', header: 'Jenis Kelamin', width: 15 },
      { key: 'status', header: 'Status', width: 12 },
    ];

    await this.exportImportService.exportToPDF(
      {
        filename: `teachers_${new Date().toISOString().split('T')[0]}.pdf`,
        data: teacherData,
        columns,
      },
      res,
    );
  }

  // Import endpoints
  @Post('import/excel')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Import data guru dari file Excel' })
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
          type: 'number',
          description: 'Sheet index (default: 0)',
        },
        startRow: {
          type: 'number',
          description: 'Baris mulai data (default: 1)',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Data guru berhasil diimport' })
  async importExcel(
    @UploadedFile() file: Express.Multer.File,
    @Query('sheetIndex') sheetIndex?: number,
    @Query('startRow') startRow?: number,
    @TenantId() instansiId?: number,
  ) {
    const imported = await this.exportImportService.importFromExcel({
      file,
      sheetIndex: sheetIndex ? parseInt(String(sheetIndex), 10) : 0,
      startRow: startRow ? parseInt(String(startRow), 10) : 1,
    });

    const results = [];
    for (const data of imported) {
      try {
        const teacher = await this.teachersService.create(data as CreateTeacherDto, instansiId || 0);
        results.push({ success: true, data: teacher });
      } catch (error: any) {
        results.push({ success: false, error: error.message, data });
      }
    }

    return {
      total: imported.length,
      imported: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
      results,
    };
  }

  @Post('import/csv')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Import data guru dari file CSV' })
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
          type: 'number',
          description: 'Baris mulai data (default: 1)',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Data guru berhasil diimport' })
  async importCSV(
    @UploadedFile() file: Express.Multer.File,
    @Query('startRow') startRow?: number,
    @TenantId() instansiId?: number,
  ) {
    const imported = await this.exportImportService.importFromCSV({
      file,
      startRow: startRow ? parseInt(String(startRow), 10) : 1,
    });

    const results = [];
    for (const data of imported) {
      try {
        const teacher = await this.teachersService.create(data as CreateTeacherDto, instansiId || 0);
        results.push({ success: true, data: teacher });
      } catch (error: any) {
        results.push({ success: false, error: error.message, data });
      }
    }

    return {
      total: imported.length,
      imported: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
      results,
    };
  }
}
