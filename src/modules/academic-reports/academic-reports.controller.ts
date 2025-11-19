import {
  Controller,
  Get,
  Query,
  UseGuards,
  Post,
  Body,
  Delete,
  Param,
  Res,
} from '@nestjs/common';
import { AcademicReportsService } from './academic-reports.service';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { Response } from 'express';
import { ReportType } from './entities/academic-report.entity';

@Controller({ path: ['academic-reports', 'tenants/:tenant/academic-reports'] })
@UseGuards(JwtAuthGuard, TenantGuard)
export class AcademicReportsController {
  constructor(private readonly academicReportsService: AcademicReportsService) {}

  @Get('dashboard')
  getDashboard(@TenantId() instansiId: number) {
    return this.academicReportsService.getDashboard(instansiId);
  }

  @Get('class-report')
  getClassReport(
    @Query('classId') classId: string,
    @TenantId() instansiId: number,
  ) {
    return this.academicReportsService.getClassReport(+classId, instansiId);
  }

  @Get('student-report')
  getStudentReport(
    @Query('studentId') studentId: string,
    @TenantId() instansiId: number,
  ) {
    return this.academicReportsService.getStudentReport(+studentId, instansiId);
  }

  @Post('export-grades')
  exportGrades(
    @Body() filters: { classId?: number; subjectId?: number; studentId?: number },
    @TenantId() instansiId: number,
  ) {
    return this.academicReportsService.exportGrades({
      ...filters,
      instansiId,
    });
  }

  // New endpoints for report management
  @Get()
  getAllReports(
    @TenantId() instansiId: number,
    @Query('classId') classId?: string,
    @Query('subjectId') subjectId?: string,
  ) {
    return this.academicReportsService.getAllReports(instansiId, {
      classId: classId ? +classId : undefined,
      subjectId: subjectId ? +subjectId : undefined,
    });
  }

  // Export must be before :id to avoid route conflict
  @Get('export/:format')
  async exportReport(
    @Param('format') format: 'pdf' | 'excel',
    @Res() res: Response,
    @TenantId() instansiId: number,
    @Query('classId') classId?: string,
    @Query('subjectId') subjectId?: string,
  ) {
    const buffer = await this.academicReportsService.exportReport(
      format,
      instansiId,
      {
        classId: classId ? +classId : undefined,
        subjectId: subjectId ? +subjectId : undefined,
      },
    );

    const contentType =
      format === 'excel'
        ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        : 'application/pdf';
    const extension = format === 'excel' ? 'xlsx' : 'pdf';
    const filename = `laporan-akademik-${new Date().toISOString().split('T')[0]}.${extension}`;

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  }

  @Get(':id')
  getReportById(@Param('id') id: string, @TenantId() instansiId: number) {
    return this.academicReportsService.getReportById(+id, instansiId);
  }

  @Post('generate')
  generateReport(
    @Body()
    data: {
      report_type: ReportType;
      title: string;
      academic_year_id?: number;
      class_id?: number;
      student_id?: number;
      period?: string;
    },
    @TenantId() instansiId: number,
  ) {
    return this.academicReportsService.generateReport(instansiId, data);
  }

  @Delete(':id')
  deleteReport(@Param('id') id: string, @TenantId() instansiId: number) {
    return this.academicReportsService.deleteReport(+id, instansiId);
  }
}

