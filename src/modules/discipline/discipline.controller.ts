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
import { DisciplineService } from './discipline.service';
import { CreateDisciplinaryActionDto } from './dto/create-disciplinary-action.dto';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { ModuleAccessGuard } from '../../common/guards/module-access.guard';
import { ModuleAccess } from '../../common/decorators/module-access.decorator';

@Controller('discipline')
@UseGuards(JwtAuthGuard, TenantGuard, ModuleAccessGuard)
export class DisciplineController {
  constructor(private readonly disciplineService: DisciplineService) {}

  @Post('actions')
  @ModuleAccess('discipline', 'create')
  create(
    @Body() createDto: CreateDisciplinaryActionDto,
    @TenantId() instansiId: number,
  ) {
    return this.disciplineService.create(createDto, instansiId);
  }

  @Get('actions')
  @ModuleAccess('discipline', 'view')
  findAll(
    @TenantId() instansiId: number,
    @Query('studentId') studentId?: number,
    @Query('status') status?: string,
    @Query('sanctionType') sanctionType?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.disciplineService.findAll({
      instansiId,
      studentId: studentId ? Number(studentId) : undefined,
      status,
      sanctionType,
      page: Number(page),
      limit: Number(limit),
    });
  }

  @Get('actions/:id')
  @ModuleAccess('discipline', 'view')
  findOne(@Param('id') id: string, @TenantId() instansiId: number) {
    return this.disciplineService.findOne(+id, instansiId);
  }

  @Patch('actions/:id/status')
  @ModuleAccess('discipline', 'update')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @TenantId() instansiId: number,
  ) {
    return this.disciplineService.updateStatus(+id, status, instansiId);
  }

  @Delete('actions/:id')
  @ModuleAccess('discipline', 'delete')
  remove(@Param('id') id: string, @TenantId() instansiId: number) {
    return this.disciplineService.remove(+id, instansiId);
  }
}

