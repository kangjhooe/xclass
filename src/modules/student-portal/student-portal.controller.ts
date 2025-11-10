import {
  Controller,
  Get,
  Patch,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { StudentPortalService } from './student-portal.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { TenantId } from '../../common/decorators/tenant.decorator';

@Controller('student-portal')
@UseGuards(JwtAuthGuard, TenantGuard)
export class StudentPortalController {
  constructor(private readonly studentPortalService: StudentPortalService) {}

  @Get('dashboard')
  async getDashboard(@Request() req, @TenantId() instansiId: number) {
    return this.studentPortalService.getDashboard(req.user.email, instansiId);
  }

  @Get('profile')
  async getProfile(@Request() req, @TenantId() instansiId: number) {
    return this.studentPortalService.getProfile(req.user.email, instansiId);
  }

  @Patch('profile')
  async updateProfile(
    @Request() req,
    @TenantId() instansiId: number,
    @Body() updateData: { email?: string; phone?: string; address?: string },
  ) {
    return this.studentPortalService.updateProfile(
      req.user.email,
      instansiId,
      updateData,
    );
  }

  @Get('grades')
  async getGrades(
    @Request() req,
    @TenantId() instansiId: number,
    @Query('subjectId') subjectId?: number,
    @Query('semester') semester?: string,
  ) {
    return this.studentPortalService.getGrades(req.user.email, instansiId, {
      subjectId: subjectId ? +subjectId : undefined,
      semester,
    });
  }

  @Get('attendance')
  async getAttendance(
    @Request() req,
    @TenantId() instansiId: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.studentPortalService.getAttendance(req.user.email, instansiId, {
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
  }

  @Get('schedule')
  async getSchedule(@Request() req, @TenantId() instansiId: number) {
    return this.studentPortalService.getSchedule(req.user.email, instansiId);
  }

  @Get('announcements')
  async getAnnouncements(@Request() req, @TenantId() instansiId: number) {
    return this.studentPortalService.getAnnouncements(req.user.email, instansiId);
  }

  @Get('exams')
  async getExams(@Request() req, @TenantId() instansiId: number) {
    return this.studentPortalService.getExams(req.user.email, instansiId);
  }
}

