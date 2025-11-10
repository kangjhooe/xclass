import { Controller, Get, Query, UseGuards, Post, Body } from '@nestjs/common';
import { AcademicReportsService } from './academic-reports.service';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';

@Controller('academic-reports')
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
}

