import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { HealthService } from './health.service';
import { CreateHealthRecordDto } from './dto/create-health-record.dto';
import { UpdateHealthRecordDto } from './dto/update-health-record.dto';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('health')
@UseGuards(JwtAuthGuard)
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Post('records')
  create(
    @Body() createDto: CreateHealthRecordDto,
    @TenantId() instansiId: number,
  ) {
    return this.healthService.create(createDto, instansiId);
  }

  @Get('records')
  findAll(
    @TenantId() instansiId: number,
    @Query('studentId') studentId?: number,
    @Query('healthStatus') healthStatus?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.healthService.findAll({
      instansiId,
      studentId: studentId ? Number(studentId) : undefined,
      healthStatus,
      startDate,
      endDate,
      page: Number(page),
      limit: Number(limit),
    });
  }

  @Get('statistics')
  getStatistics(
    @TenantId() instansiId: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.healthService.getStatistics(instansiId, startDate, endDate);
  }

  @Get('records/:id')
  findOne(@Param('id') id: string, @TenantId() instansiId: number) {
    return this.healthService.findOne(+id, instansiId);
  }

  @Patch('records/:id')
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateHealthRecordDto,
    @TenantId() instansiId: number,
  ) {
    return this.healthService.update(+id, updateDto, instansiId);
  }

  @Delete('records/:id')
  remove(@Param('id') id: string, @TenantId() instansiId: number) {
    return this.healthService.remove(+id, instansiId);
  }
}

