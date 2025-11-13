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
} from '@nestjs/common';
import { SchedulesService } from './schedules.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { CheckScheduleConflictDto } from './dto/check-schedule-conflict.dto';

@Controller({ path: ['schedules', 'tenants/:tenant/schedules'] })
@UseGuards(JwtAuthGuard, TenantGuard)
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Post()
  create(@Body() createScheduleDto: CreateScheduleDto, @TenantId() instansiId: number) {
    return this.schedulesService.create(createScheduleDto, instansiId);
  }

  @Post('check-conflict')
  checkConflict(@Body() dto: CheckScheduleConflictDto, @TenantId() instansiId: number) {
    return this.schedulesService.checkScheduleConflicts(dto, instansiId);
  }

  @Get()
  findAll(
    @TenantId() instansiId: number,
    @Query('classId') classId?: number,
    @Query('teacherId') teacherId?: number,
    @Query('dayOfWeek') dayOfWeek?: number,
  ) {
    return this.schedulesService.findAll({ classId, teacherId, dayOfWeek, instansiId });
  }

  @Get(':id')
  findOne(@Param('id') id: string, @TenantId() instansiId: number) {
    return this.schedulesService.findOne(+id, instansiId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateScheduleDto: UpdateScheduleDto, @TenantId() instansiId: number) {
    return this.schedulesService.update(+id, updateScheduleDto, instansiId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @TenantId() instansiId: number) {
    return this.schedulesService.remove(+id, instansiId);
  }
}
