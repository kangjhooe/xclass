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
import { ExtracurricularService } from './extracurricular.service';
import { CreateExtracurricularDto } from './dto/create-extracurricular.dto';
import { UpdateExtracurricularDto } from './dto/update-extracurricular.dto';
import { CreateExtracurricularParticipantDto } from './dto/create-extracurricular-participant.dto';
import { CreateExtracurricularActivityDto } from './dto/create-extracurricular-activity.dto';
import { UpdateExtracurricularActivityDto } from './dto/update-extracurricular-activity.dto';
import { TenantId } from '../../common/decorators/tenant.decorator';
import {
  ExtracurricularStatus,
  ExtracurricularCategory,
} from './entities/extracurricular.entity';

@Controller('extracurriculars')
export class ExtracurricularController {
  constructor(
    private readonly extracurricularService: ExtracurricularService,
  ) {}

  @Post()
  create(
    @Body() createDto: CreateExtracurricularDto,
    @TenantId() instansiId: number,
  ) {
    return this.extracurricularService.create(createDto, instansiId);
  }

  @Get()
  findAll(
    @TenantId() instansiId: number,
    @Query('search') search?: string,
    @Query('category') category?: ExtracurricularCategory,
    @Query('status') status?: ExtracurricularStatus,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.extracurricularService.findAll({
      search,
      category,
      status,
      page: +page,
      limit: +limit,
      instansiId,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string, @TenantId() instansiId: number) {
    return this.extracurricularService.findOne(+id, instansiId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateExtracurricularDto,
    @TenantId() instansiId: number,
  ) {
    return this.extracurricularService.update(+id, updateDto, instansiId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @TenantId() instansiId: number) {
    return this.extracurricularService.remove(+id, instansiId);
  }

  // ========== Participants ==========
  @Post('participants')
  addParticipant(
    @Body() createDto: CreateExtracurricularParticipantDto,
    @TenantId() instansiId: number,
  ) {
    return this.extracurricularService.addParticipant(createDto, instansiId);
  }

  @Get(':id/participants')
  getParticipants(
    @Param('id') id: string,
    @TenantId() instansiId: number,
  ) {
    return this.extracurricularService.getParticipants(+id, instansiId);
  }

  @Delete('participants/:participantId')
  removeParticipant(
    @Param('participantId') participantId: string,
    @TenantId() instansiId: number,
    @Body('notes') notes?: string,
  ) {
    return this.extracurricularService.removeParticipant(
      +participantId,
      instansiId,
      notes,
    );
  }

  // ========== Activities ==========
  @Post('activities')
  createActivity(
    @Body() createDto: CreateExtracurricularActivityDto,
    @TenantId() instansiId: number,
    @Query('createdBy') createdBy?: number,
  ) {
    return this.extracurricularService.createActivity(
      createDto,
      instansiId,
      createdBy ? +createdBy : undefined,
    );
  }

  @Get(':id/activities')
  getActivities(
    @Param('id') id: string,
    @TenantId() instansiId: number,
  ) {
    return this.extracurricularService.getActivities(+id, instansiId);
  }

  @Patch('activities/:activityId')
  updateActivity(
    @Param('activityId') activityId: string,
    @Body() updateDto: UpdateExtracurricularActivityDto,
    @TenantId() instansiId: number,
  ) {
    return this.extracurricularService.updateActivity(
      +activityId,
      updateDto,
      instansiId,
    );
  }

  @Delete('activities/:activityId')
  deleteActivity(
    @Param('activityId') activityId: string,
    @TenantId() instansiId: number,
  ) {
    return this.extracurricularService.deleteActivity(+activityId, instansiId);
  }

  @Get('statistics')
  getStatistics(@TenantId() instansiId: number) {
    return this.extracurricularService.getStatistics(instansiId);
  }
}
