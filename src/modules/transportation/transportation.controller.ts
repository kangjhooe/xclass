import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TransportationService } from './transportation.service';
import { CreateTransportationRouteDto } from './dto/create-transportation-route.dto';
import { CreateTransportationScheduleDto } from './dto/create-transportation-schedule.dto';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('transportation')
@UseGuards(JwtAuthGuard)
export class TransportationController {
  constructor(
    private readonly transportationService: TransportationService,
  ) {}

  @Post('routes')
  createRoute(
    @Body() createDto: CreateTransportationRouteDto,
    @TenantId() instansiId: number,
  ) {
    return this.transportationService.createRoute(createDto, instansiId);
  }

  @Get('routes')
  findAllRoutes(
    @TenantId() instansiId: number,
    @Query('status') status?: string,
  ) {
    return this.transportationService.findAllRoutes(instansiId, status);
  }

  @Get('routes/:id')
  findOneRoute(@Param('id') id: string, @TenantId() instansiId: number) {
    return this.transportationService.findOneRoute(+id, instansiId);
  }

  @Delete('routes/:id')
  removeRoute(@Param('id') id: string, @TenantId() instansiId: number) {
    return this.transportationService.removeRoute(+id, instansiId);
  }

  @Post('schedules')
  createSchedule(
    @Body() createDto: CreateTransportationScheduleDto,
    @TenantId() instansiId: number,
  ) {
    return this.transportationService.createSchedule(createDto, instansiId);
  }

  @Get('schedules')
  findAllSchedules(
    @TenantId() instansiId: number,
    @Query('routeId') routeId?: number,
  ) {
    return this.transportationService.findAllSchedules(
      instansiId,
      routeId ? Number(routeId) : undefined,
    );
  }

  @Get('schedules/:id')
  findOneSchedule(@Param('id') id: string, @TenantId() instansiId: number) {
    return this.transportationService.findOneSchedule(+id, instansiId);
  }

  @Delete('schedules/:id')
  removeSchedule(@Param('id') id: string, @TenantId() instansiId: number) {
    return this.transportationService.removeSchedule(+id, instansiId);
  }
}

