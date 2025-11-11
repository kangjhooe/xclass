import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';

@ApiTags('analytics')
@ApiBearerAuth()
@Controller({ path: ['analytics', 'tenants/:tenant/analytics'] })
@UseGuards(JwtAuthGuard, TenantGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('students')
  @ApiOperation({ summary: 'Get students analytics' })
  @ApiResponse({ status: 200, description: 'Students analytics data' })
  async getStudentsAnalytics(
    @TenantId() instansiId: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('classId') classId?: string,
  ) {
    return this.analyticsService.getStudentsAnalytics({
      instansiId,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      classId: classId ? parseInt(classId, 10) : undefined,
    });
  }

  @Get('teachers')
  @ApiOperation({ summary: 'Get teachers analytics' })
  @ApiResponse({ status: 200, description: 'Teachers analytics data' })
  async getTeachersAnalytics(
    @TenantId() instansiId: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.analyticsService.getTeachersAnalytics({
      instansiId,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
  }

  @Get('attendance')
  @ApiOperation({ summary: 'Get attendance analytics' })
  @ApiResponse({ status: 200, description: 'Attendance analytics data' })
  async getAttendanceAnalytics(
    @TenantId() instansiId: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('classId') classId?: string,
  ) {
    return this.analyticsService.getAttendanceAnalytics({
      instansiId,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      classId: classId ? parseInt(classId, 10) : undefined,
    });
  }

  @Get('grades')
  @ApiOperation({ summary: 'Get grades analytics' })
  @ApiResponse({ status: 200, description: 'Grades analytics data' })
  async getGradesAnalytics(
    @TenantId() instansiId: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('classId') classId?: string,
    @Query('subjectId') subjectId?: string,
  ) {
    return this.analyticsService.getGradesAnalytics({
      instansiId,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      classId: classId ? parseInt(classId, 10) : undefined,
      subjectId: subjectId ? parseInt(subjectId, 10) : undefined,
    });
  }
}

