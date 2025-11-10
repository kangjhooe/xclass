import { Controller, Get, Query, Post, Body, UseGuards } from '@nestjs/common';
import { ActivityLogsService } from './activity-logs.service';
import { FilterActivityLogDto } from './dto/filter-activity-log.dto';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';

@Controller('activity-logs')
@UseGuards(JwtAuthGuard, TenantGuard)
export class ActivityLogsController {
  constructor(private readonly activityLogsService: ActivityLogsService) {}

  @Get()
  findAll(
    @Query() filters: FilterActivityLogDto,
    @TenantId() instansiId: number,
  ) {
    return this.activityLogsService.findAll({
      ...filters,
      userId: filters.userId ? Number(filters.userId) : undefined,
      modelId: filters.modelId ? Number(filters.modelId) : undefined,
      page: filters.page ? Number(filters.page) : 1,
      limit: filters.limit ? Number(filters.limit) : 20,
      instansiId,
    });
  }

  @Get('statistics')
  getStatistics(
    @TenantId() instansiId: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.activityLogsService.getStatistics(
      instansiId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get('trends')
  getTrends(
    @TenantId() instansiId: number,
    @Query('days') days: number = 30,
  ) {
    return this.activityLogsService.getTrends(instansiId, Number(days));
  }

  @Post('export')
  export(
    @Body() filters: FilterActivityLogDto,
    @TenantId() instansiId: number,
  ) {
    return this.activityLogsService.export({
      ...filters,
      userId: filters.userId ? Number(filters.userId) : undefined,
      modelId: filters.modelId ? Number(filters.modelId) : undefined,
      instansiId,
    });
  }
}

