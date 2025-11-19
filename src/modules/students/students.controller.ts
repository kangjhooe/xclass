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
@Controller({ path: ['students', 'tenants/:tenant/students'] })
@UseGuards(JwtAuthGuard, TenantGuard)
export class StudentsController {
  constructor(
    private readonly studentsService: StudentsService,
    private readonly exportImportService: ExportImportService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Buat data siswa baru' })
  @ApiResponse({ status: 201, description: 'Data siswa berhasil dibuat' })
  @ApiResponse({ status: 400, description: 'Data tidak valid' })
  @ApiResponse({ status: 409, description: 'NIK sudah terdaftar' })
  async create(@Body() createStudentDto: CreateStudentDto, @TenantId() instansiId: number) {
    return this.studentsService.create(createStudentDto, instansiId);
  }

  @Get()
  @ApiOperation({ summary: 'Dapatkan daftar siswa dengan filter dan pagination' })
  @ApiResponse({ status: 200, description: 'Daftar siswa berhasil diambil' })
  findAll(
    @TenantId() instansiId: number,
    @Query('search') search?: string,
    @Query('classId') classId?: number,
    @Query('status') status?: string,
    @Query('gender') gender?: string,
    @Query('academicYear') academicYear?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.studentsService.findAll({
      search,
      classId,
      status,
      gender,
      academicYear,
      page,
      limit,
      instansiId,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Dapatkan detail siswa berdasarkan ID' })
  @ApiResponse({ status: 200, description: 'Detail siswa berhasil diambil' })
  @ApiResponse({ status: 404, description: 'Siswa tidak ditemukan' })
  findOne(@Param('id') id: string, @TenantId() instansiId: number) {
    return this.studentsService.findOne(+id, instansiId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update data siswa' })
  @ApiResponse({ status: 200, description: 'Data siswa berhasil diupdate' })
  @ApiResponse({ status: 404, description: 'Siswa tidak ditemukan' })
  @ApiResponse({ status: 409, description: 'NIK sudah terdaftar' })
  update(@Param('id') id: string, @Body() updateStudentDto: UpdateStudentDto, @TenantId() instansiId: number) {
    return this.studentsService.update(+id, updateStudentDto, instansiId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Hapus data siswa' })
  @ApiResponse({ status: 200, description: 'Data siswa berhasil dihapus' })
  @ApiResponse({ status: 404, description: 'Siswa tidak ditemukan' })
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

  @Get('nik/:nik/lifetime')
  @ApiOperation({ summary: 'Dapatkan riwayat lengkap siswa berdasarkan NIK (dari SD sampai SMA)' })
  @ApiResponse({ status: 200, description: 'Riwayat lengkap siswa berhasil diambil' })
  @ApiResponse({ status: 404, description: 'Siswa tidak ditemukan' })
  getLifetimeData(@Param('nik') nik: string, @TenantId() instansiId: number) {
    return this.studentsService.getLifetimeData(nik, instansiId);
  }

  @Patch(':id/academic-level')
  @ApiOperation({ summary: 'Update level akademik siswa (SD/SMP/SMA)' })
  @ApiResponse({ status: 200, description: 'Level akademik berhasil diupdate' })
  @ApiResponse({ status: 404, description: 'Siswa tidak ditemukan' })
  updateAcademicLevel(
    @Param('id') id: string,
    @Body() body: { academicLevel: string; currentGrade: string; academicYear: string },
    @TenantId() instansiId: number,
  ) {
    return this.studentsService.updateAcademicLevel(
      +id,
      body.academicLevel,
      body.currentGrade,
      body.academicYear,
      instansiId,
    );
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
      { key: 'nik', header: 'NIK', width: 18 },
      { key: 'studentNumber', header: 'NIS', width: 15 },
      { key: 'nisn', header: 'NISN', width: 15 },
      { key: 'name', header: 'Nama', width: 30 },
      { key: 'email', header: 'Email', width: 30 },
      { key: 'phone', header: 'Telepon', width: 15 },
      { key: 'gender', header: 'Jenis Kelamin', width: 15 },
      { key: 'birthDate', header: 'Tanggal Lahir', width: 15 },
      { key: 'birthPlace', header: 'Tempat Lahir', width: 20 },
      { key: 'address', header: 'Alamat', width: 40 },
      { key: 'isActive', header: 'Status Aktif', width: 15 },
    ];

    const studentsData = (students as { data?: any[] }).data || [];
    await this.exportImportService.exportToExcel(
      {
        filename: `students_${new Date().toISOString().split('T')[0]}.xlsx`,
        sheetName: 'Data Siswa',
        data: studentsData,
        columns,
      },
      res,
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
      { key: 'nik', header: 'NIK', width: 18 },
      { key: 'studentNumber', header: 'NIS', width: 15 },
      { key: 'nisn', header: 'NISN', width: 15 },
      { key: 'name', header: 'Nama', width: 30 },
      { key: 'email', header: 'Email', width: 30 },
      { key: 'phone', header: 'Telepon', width: 15 },
      { key: 'gender', header: 'Jenis Kelamin', width: 15 },
      { key: 'birthDate', header: 'Tanggal Lahir', width: 15 },
      { key: 'birthPlace', header: 'Tempat Lahir', width: 20 },
      { key: 'address', header: 'Alamat', width: 40 },
      { key: 'isActive', header: 'Status Aktif', width: 15 },
    ];

    const studentsData = (students as { data?: any[] }).data || [];
    await this.exportImportService.exportToCSV(
      {
        filename: `students_${new Date().toISOString().split('T')[0]}.csv`,
        data: studentsData,
        columns,
      },
      res,
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
      { key: 'nik', header: 'NIK', width: 18 },
      { key: 'studentNumber', header: 'NIS', width: 15 },
      { key: 'nisn', header: 'NISN', width: 15 },
      { key: 'name', header: 'Nama', width: 30 },
      { key: 'email', header: 'Email', width: 30 },
      { key: 'phone', header: 'Telepon', width: 15 },
      { key: 'gender', header: 'Jenis Kelamin', width: 15 },
      { key: 'isActive', header: 'Status Aktif', width: 15 },
    ];

    const studentsData = (students as { data?: any[] }).data || [];
    await this.exportImportService.exportToPDF(
      {
        filename: `students_${new Date().toISOString().split('T')[0]}.pdf`,
        data: studentsData,
        columns,
      },
      res,
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
        'NIK': 'nik',
        'NIS': 'studentNumber',
        'NISN': 'nisn',
        'Nama': 'name',
        'Email': 'email',
        'Telepon': 'phone',
        'Jenis Kelamin': 'gender',
        'Tanggal Lahir': 'birthDate',
        'Tempat Lahir': 'birthPlace',
        'Alamat': 'address',
        'Status': 'isActive',
        'Status Aktif': 'isActive',
        'Agama': 'religion',
        'Kelas': 'classId',
        'Nama Ayah': 'fatherName',
        'NIK Ayah': 'fatherNik',
        'Telepon Ayah': 'fatherPhone',
        'Email Ayah': 'fatherEmail',
        'Pekerjaan Ayah': 'fatherOccupation',
        'Nama Ibu': 'motherName',
        'NIK Ibu': 'motherNik',
        'Telepon Ibu': 'motherPhone',
        'Email Ibu': 'motherEmail',
        'Pekerjaan Ibu': 'motherOccupation',
        'Nama Wali': 'guardianName',
        'NIK Wali': 'guardianNik',
        'Telepon Wali': 'guardianPhone',
        'Email Wali': 'guardianEmail',
        'RT': 'rt',
        'RW': 'rw',
        'Kelurahan': 'village',
        'Kecamatan': 'subDistrict',
        'Kabupaten': 'district',
        'Kota': 'city',
        'Provinsi': 'province',
        'Kode Pos': 'postalCode',
      },
    });

    // Create students from imported data
    const results = [];
    for (const data of imported) {
      try {
        // Convert status string to isActive boolean
        const statusValue = data.isActive ?? data.Status ?? data['Status Aktif'] ?? data.status;
        let isActive = true;
        if (typeof statusValue === 'string') {
          const statusLower = statusValue.toLowerCase();
          isActive = !['inactive', 'tidak aktif', 'nonaktif', 'false', '0', 'no'].includes(statusLower);
        } else if (typeof statusValue === 'boolean') {
          isActive = statusValue;
        } else if (statusValue === 0 || statusValue === false) {
          isActive = false;
        }

        const studentData: CreateStudentDto = {
          nik: data.nik || data.NIK,
          studentNumber: data.studentNumber || data.NIS,
          nisn: data.nisn || data.NISN,
          name: data.name || data.Nama,
          email: data.email || data.Email,
          phone: data.phone || data.Telepon,
          gender: data.gender || data['Jenis Kelamin'],
          birthDate: data.birthDate || data['Tanggal Lahir'],
          birthPlace: data.birthPlace || data['Tempat Lahir'],
          address: data.address || data.Alamat,
          isActive,
          religion: data.religion || data.Agama,
          classId: data.classId || data.Kelas ? Number(data.classId || data.Kelas) : undefined,
          fatherName: data.fatherName || data['Nama Ayah'],
          fatherNik: data.fatherNik || data['NIK Ayah'],
          fatherPhone: data.fatherPhone || data['Telepon Ayah'],
          fatherEmail: data.fatherEmail || data['Email Ayah'],
          fatherOccupation: data.fatherOccupation || data['Pekerjaan Ayah'],
          motherName: data.motherName || data['Nama Ibu'],
          motherNik: data.motherNik || data['NIK Ibu'],
          motherPhone: data.motherPhone || data['Telepon Ibu'],
          motherEmail: data.motherEmail || data['Email Ibu'],
          motherOccupation: data.motherOccupation || data['Pekerjaan Ibu'],
          guardianName: data.guardianName || data['Nama Wali'],
          guardianNik: data.guardianNik || data['NIK Wali'],
          guardianPhone: data.guardianPhone || data['Telepon Wali'],
          guardianEmail: data.guardianEmail || data['Email Wali'],
          rt: data.rt || data.RT,
          rw: data.rw || data.RW,
          village: data.village || data.Kelurahan,
          subDistrict: data.subDistrict || data.Kecamatan,
          district: data.district || data.Kabupaten,
          city: data.city || data.Kota,
          province: data.province || data.Provinsi,
          postalCode: data.postalCode || data['Kode Pos'],
        };

        // Remove undefined values
        Object.keys(studentData).forEach((key) => {
          if (studentData[key as keyof CreateStudentDto] === undefined) {
            delete studentData[key as keyof CreateStudentDto];
          }
        });

        const student = await this.studentsService.create(studentData, instansiId || 0);
        results.push({ success: true, data: student });
      } catch (error: any) {
        const errorMessage = error?.response?.message || error?.message || 'Unknown error';
        results.push({ 
          success: false, 
          error: errorMessage, 
          data,
          row: data.__rowIndex || 'unknown'
        });
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
