import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { CreateEventRegistrationDto } from './dto/create-event-registration.dto';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { EventType, EventCategory, EventStatus } from './entities/event.entity';
import { RegistrationStatus } from './entities/event-registration.entity';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  create(
    @Body() createDto: CreateEventDto,
    @TenantId() instansiId: number,
    @Query('createdBy') createdBy?: number,
  ) {
    return this.eventsService.create(
      createDto,
      instansiId,
      createdBy ? +createdBy : undefined,
    );
  }

  @Get()
  findAll(
    @TenantId() instansiId: number,
    @Query('search') search?: string,
    @Query('eventType') eventType?: EventType,
    @Query('category') category?: EventCategory,
    @Query('status') status?: EventStatus,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.eventsService.findAll({
      search,
      eventType,
      category,
      status,
      startDate,
      endDate,
      page: +page,
      limit: +limit,
      instansiId,
    });
  }

  @Get('upcoming')
  getUpcomingEvents(@TenantId() instansiId: number) {
    return this.eventsService.getUpcomingEvents(instansiId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @TenantId() instansiId: number) {
    return this.eventsService.findOne(+id, instansiId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateEventDto,
    @TenantId() instansiId: number,
  ) {
    return this.eventsService.update(+id, updateDto, instansiId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @TenantId() instansiId: number) {
    return this.eventsService.remove(+id, instansiId);
  }

  // ========== Registrations ==========
  @Post('registrations')
  createRegistration(
    @Body() createDto: CreateEventRegistrationDto,
    @TenantId() instansiId: number,
    @Query('createdBy') createdBy?: number,
  ) {
    return this.eventsService.createRegistration(
      createDto,
      instansiId,
      createdBy ? +createdBy : undefined,
    );
  }

  @Get('registrations')
  findAllRegistrations(
    @TenantId() instansiId: number,
    @Query('eventId') eventId?: number,
    @Query('studentId') studentId?: number,
    @Query('status') status?: RegistrationStatus,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.eventsService.findAllRegistrations({
      eventId: eventId ? +eventId : undefined,
      studentId: studentId ? +studentId : undefined,
      status,
      page: +page,
      limit: +limit,
      instansiId,
    });
  }

  @Patch('registrations/:id/status')
  updateRegistrationStatus(
    @Param('id') id: string,
    @Body('status') status: RegistrationStatus,
    @TenantId() instansiId: number,
  ) {
    return this.eventsService.updateRegistrationStatus(+id, status, instansiId);
  }

  @Get('statistics')
  getStatistics(@TenantId() instansiId: number) {
    return this.eventsService.getStatistics(instansiId);
  }
}

