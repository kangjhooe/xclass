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
  Req,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';

@Controller({ path: ['attendance', 'tenants/:tenant/attendance'] })
@UseGuards(JwtAuthGuard, TenantGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post()
  create(@Body() createAttendanceDto: CreateAttendanceDto, @TenantId() instansiId: number) {
    return this.attendanceService.create(createAttendanceDto, instansiId);
  }

  @Get()
  findAll(
    @TenantId() instansiId: number,
    @Req() req: ExpressRequest,
    @Query('studentId') studentId?: number,
    @Query('scheduleId') scheduleId?: number,
    @Query('date') date?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.attendanceService.findAll({ studentId, scheduleId, date, startDate, endDate, instansiId }, req.user as any);
  }

  @Get('stats/summary')
  getStats(
    @TenantId() instansiId: number,
    @Query('scheduleId') scheduleId?: number,
    @Query('date') date?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.attendanceService.getStats({
      scheduleId,
      date,
      startDate,
      endDate,
      instansiId,
    });
  }

  @Get('stats/daily')
  getDailyStats(
    @TenantId() instansiId: number,
    @Query('scheduleId') scheduleId?: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.attendanceService.getDailyStats({
      scheduleId,
      startDate,
      endDate,
      instansiId,
    });
  }

  @Get('stats/by-schedule')
  getScheduleStats(
    @TenantId() instansiId: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('status') status?: 'present' | 'absent' | 'late' | 'excused',
  ) {
    return this.attendanceService.getScheduleStats({
      instansiId,
      startDate,
      endDate,
      status,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string, @TenantId() instansiId: number) {
    return this.attendanceService.findOne(+id, instansiId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAttendanceDto: UpdateAttendanceDto, @TenantId() instansiId: number) {
    return this.attendanceService.update(+id, updateAttendanceDto, instansiId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @TenantId() instansiId: number) {
    return this.attendanceService.remove(+id, instansiId);
  }
}
