import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CounselingService } from './counseling.service';
import { CreateCounselingSessionDto } from './dto/create-counseling-session.dto';
import { UpdateCounselingSessionDto } from './dto/update-counseling-session.dto';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { ModuleAccessGuard } from '../../common/guards/module-access.guard';
import { ModuleAccess } from '../../common/decorators/module-access.decorator';

@Controller('counseling')
@UseGuards(JwtAuthGuard, TenantGuard, ModuleAccessGuard)
export class CounselingController {
  constructor(private readonly counselingService: CounselingService) {}

  @Post('sessions')
  @ModuleAccess('counseling', 'create')
  create(
    @Body() createDto: CreateCounselingSessionDto,
    @TenantId() instansiId: number,
  ) {
    return this.counselingService.create(createDto, instansiId);
  }

  @Get('sessions')
  @ModuleAccess('counseling', 'view')
  findAll(
    @TenantId() instansiId: number,
    @Query('studentId') studentId?: number,
    @Query('counselorId') counselorId?: number,
    @Query('status') status?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('search') search?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.counselingService.findAll({
      instansiId,
      studentId: studentId ? Number(studentId) : undefined,
      counselorId: counselorId ? Number(counselorId) : undefined,
      status,
      startDate,
      endDate,
      search,
      page: Number(page),
      limit: Number(limit),
    });
  }

  @Get('sessions/:id')
  @ModuleAccess('counseling', 'view')
  findOne(@Param('id') id: string, @TenantId() instansiId: number) {
    return this.counselingService.findOne(+id, instansiId);
  }

  @Patch('sessions/:id')
  @ModuleAccess('counseling', 'update')
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateCounselingSessionDto,
    @TenantId() instansiId: number,
  ) {
    return this.counselingService.update(+id, updateDto, instansiId);
  }

  @Patch('sessions/:id/status')
  @ModuleAccess('counseling', 'update')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @TenantId() instansiId: number,
  ) {
    return this.counselingService.updateStatus(+id, status, instansiId);
  }

  @Delete('sessions/:id')
  @ModuleAccess('counseling', 'delete')
  remove(@Param('id') id: string, @TenantId() instansiId: number) {
    return this.counselingService.remove(+id, instansiId);
  }
}

