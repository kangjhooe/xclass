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
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { ExportImportService } from '../export-import/export-import.service';

@ApiTags('students')
@ApiBearerAuth()
@Controller('students')
@UseGuards(JwtAuthGuard, TenantGuard)
export class StudentsController {
  constructor(
    private readonly studentsService: StudentsService,
    private readonly exportImportService: ExportImportService,
  ) {}

  @Post()
  create(@Body() createStudentDto: CreateStudentDto, @TenantId() instansiId: number) {
    return this.studentsService.create(createStudentDto, instansiId);
  }

  @Get()
  findAll(
    @TenantId() instansiId: number,
    @Query('search') search?: string,
    @Query('classId') classId?: number,
    @Query('status') status?: string,
    @Query('gender') gender?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.studentsService.findAll({
      search,
      classId,
      status,
      gender,
      page,
      limit,
      instansiId,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string, @TenantId() instansiId: number) {
    return this.studentsService.findOne(+id, instansiId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateStudentDto: UpdateStudentDto, @TenantId() instansiId: number) {
    return this.studentsService.update(+id, updateStudentDto, instansiId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @TenantId() instansiId: number) {
    return this.studentsService.remove(+id, instansiId);
  }

  @Get(':id/grades')
  getGrades(@Param('id') id: string, @TenantId() instansiId: number) {
    return this.studentsService.getGrades(+id, instansiId);
  }

  @Get(':id/attendance')
  getAttendance(@Param('id') id: string, @TenantId() instansiId: number) {
    return this.studentsService.getAttendance(+id, instansiId);
  }

  @Get('export/excel')
  @ApiOperation({ summary: 'Export data siswa ke Excel' })
  @ApiResponse({ status: 200, description: 'File Excel berhasil di-generate' })
  async exportExcel(@Query('search') search?: string, @TenantId() instansiId?: number, @Res() res?: Response) {
    const students = await this.studentsService.findAll({
      search,
      instansiId: instansiId || 0,
      page: 1,
      limit: 10000,
    });

    const columns = [
      { key: 'studentNumber', header: 'NIS', width: 15 },
      { key: 'nisn', header: 'NISN', width: 15 },
      { key: 'name', header: 'Nama', width: 30 },
      { key: 'email', header: 'Email', width: 30 },
      { key: 'phone', header: 'Telepon', width: 15 },
      { key: 'gender', header: 'Jenis Kelamin', width: 15 },
      { key: 'birthDate', header: 'Tanggal Lahir', width: 15 },
      { key: 'birthPlace', header: 'Tempat Lahir', width: 20 },
      { key: 'address', header: 'Alamat', width: 40 },
      { key: 'status', header: 'Status', width: 15 },
    ];

    await this.exportImportService.exportToExcel(
      {
        filename: `students_${new Date().toISOString().split('T')[0]}.xlsx`,
        sheetName: 'Data Siswa',
        data: students.data || [],
        columns,
      },
      res!,
    );
  }

  @Get('export/csv')
  @ApiOperation({ summary: 'Export data siswa ke CSV' })
  @ApiResponse({ status: 200, description: 'File CSV berhasil di-generate' })
  async exportCSV(@Query('search') search?: string, @TenantId() instansiId?: number, @Res() res?: Response) {
    const students = await this.studentsService.findAll({
      search,
      instansiId: instansiId || 0,
      page: 1,
      limit: 10000,
    });

    const columns = [
      { key: 'studentNumber', header: 'NIS', width: 15 },
      { key: 'nisn', header: 'NISN', width: 15 },
      { key: 'name', header: 'Nama', width: 30 },
      { key: 'email', header: 'Email', width: 30 },
      { key: 'phone', header: 'Telepon', width: 15 },
      { key: 'gender', header: 'Jenis Kelamin', width: 15 },
      { key: 'birthDate', header: 'Tanggal Lahir', width: 15 },
      { key: 'birthPlace', header: 'Tempat Lahir', width: 20 },
      { key: 'address', header: 'Alamat', width: 40 },
      { key: 'status', header: 'Status', width: 15 },
    ];

    await this.exportImportService.exportToCSV(
      {
        filename: `students_${new Date().toISOString().split('T')[0]}.csv`,
        data: students.data || [],
        columns,
      },
      res!,
    );
  }

  @Get('export/pdf')
  @ApiOperation({ summary: 'Export data siswa ke PDF' })
  @ApiResponse({ status: 200, description: 'File PDF berhasil di-generate' })
  async exportPDF(@Query('search') search?: string, @TenantId() instansiId?: number, @Res() res?: Response) {
    const students = await this.studentsService.findAll({
      search,
      instansiId: instansiId || 0,
      page: 1,
      limit: 10000,
    });

    const columns = [
      { key: 'studentNumber', header: 'NIS', width: 15 },
      { key: 'nisn', header: 'NISN', width: 15 },
      { key: 'name', header: 'Nama', width: 30 },
      { key: 'email', header: 'Email', width: 30 },
      { key: 'phone', header: 'Telepon', width: 15 },
      { key: 'gender', header: 'Jenis Kelamin', width: 15 },
      { key: 'status', header: 'Status', width: 15 },
    ];

    await this.exportImportService.exportToPDF(
      {
        filename: `students_${new Date().toISOString().split('T')[0]}.pdf`,
        data: students.data || [],
        columns,
      },
      res!,
    );
  }

  @Post('import/excel')
  @ApiOperation({ summary: 'Import data siswa dari file Excel' })
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
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Data siswa berhasil diimport' })
  @ApiResponse({ status: 400, description: 'File tidak ditemukan atau format tidak valid' })
  @UseInterceptors(FileInterceptor('file'))
  async importExcel(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { sheetIndex?: string; startRow?: string },
    @TenantId() instansiId?: number,
  ) {
    if (!file) {
      throw new Error('File tidak ditemukan');
    }

    const imported = await this.exportImportService.importFromExcel({
      file,
      sheetIndex: body.sheetIndex ? parseInt(body.sheetIndex) : undefined,
      startRow: body.startRow ? parseInt(body.startRow) : 1,
      mapping: {
        'NIS': 'studentNumber',
        'NISN': 'nisn',
        'Nama': 'name',
        'Email': 'email',
        'Telepon': 'phone',
        'Jenis Kelamin': 'gender',
        'Tanggal Lahir': 'birthDate',
        'Tempat Lahir': 'birthPlace',
        'Alamat': 'address',
        'Status': 'status',
      },
    });

    // Create students from imported data
    const results = [];
    for (const data of imported) {
      try {
        const student = await this.studentsService.create(
          {
            studentNumber: data.studentNumber || data.NIS,
            nisn: data.nisn || data.NISN,
            name: data.name || data.Nama,
            email: data.email || data.Email,
            phone: data.phone || data.Telepon,
            gender: data.gender || data['Jenis Kelamin'],
            birthDate: data.birthDate || data['Tanggal Lahir'],
            birthPlace: data.birthPlace || data['Tempat Lahir'],
            address: data.address || data.Alamat,
            status: data.status || data.Status || 'active',
          } as CreateStudentDto,
          instansiId || 0,
        );
        results.push({ success: true, data: student });
      } catch (error: any) {
        results.push({ success: false, error: error.message, data });
      }
    }

    return {
      success: true,
      imported: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
      results,
    };
  }
}
