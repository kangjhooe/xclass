import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { MobileApiService } from './mobile-api.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { TenantId } from '../../common/decorators/tenant.decorator';

@Controller('mobile')
export class MobileApiController {
  constructor(private readonly mobileApiService: MobileApiService) {}

  @Post('login')
  async login(
    @Body() loginDto: { email: string; password: string; tenant_npsn: string },
  ) {
    return this.mobileApiService.login(
      loginDto.email,
      loginDto.password,
      loginDto.tenant_npsn,
    );
  }

  @Get('dashboard')
  @UseGuards(JwtAuthGuard, TenantGuard)
  async getDashboard(@Request() req, @TenantId() instansiId: number) {
    return this.mobileApiService.getStudentDashboard(req.user.email, instansiId);
  }

  @Get('grades')
  @UseGuards(JwtAuthGuard, TenantGuard)
  async getGrades(
    @Request() req,
    @TenantId() instansiId: number,
    @Query('subjectId') subjectId?: number,
    @Query('semester') semester?: string,
  ) {
    return this.mobileApiService.getStudentGrades(req.user.email, instansiId, {
      subjectId: subjectId ? +subjectId : undefined,
      semester,
    });
  }

  @Get('attendance')
  @UseGuards(JwtAuthGuard, TenantGuard)
  async getAttendance(
    @Request() req,
    @TenantId() instansiId: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.mobileApiService.getStudentAttendance(req.user.email, instansiId, {
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
  }

  @Get('schedule')
  @UseGuards(JwtAuthGuard, TenantGuard)
  async getSchedule(@Request() req, @TenantId() instansiId: number) {
    return this.mobileApiService.getStudentSchedule(req.user.email, instansiId);
  }

  @Get('announcements')
  @UseGuards(JwtAuthGuard, TenantGuard)
  async getAnnouncements(@Request() req, @TenantId() instansiId: number) {
    return this.mobileApiService.getAnnouncements(req.user.email, instansiId);
  }

  // Teacher endpoints
  @Get('teacher/dashboard')
  @UseGuards(JwtAuthGuard, TenantGuard)
  async getTeacherDashboard(@Request() req, @TenantId() instansiId: number) {
    return this.mobileApiService.getTeacherDashboard(req.user.email, instansiId);
  }

  @Get('teacher/schedules')
  @UseGuards(JwtAuthGuard, TenantGuard)
  async getTeacherSchedules(@Request() req, @TenantId() instansiId: number) {
    return this.mobileApiService.getTeacherSchedules(req.user.email, instansiId);
  }
}

