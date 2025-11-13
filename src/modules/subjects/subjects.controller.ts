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
import { SubjectsService } from './subjects.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { UpdateSubjectStatusDto } from './dto/update-subject-status.dto';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { CurriculumType } from '../curriculum/entities/curriculum.entity';

@Controller({ path: ['subjects', 'tenants/:tenant/subjects'] })
@UseGuards(JwtAuthGuard, TenantGuard)
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) {}

  @Post()
  create(@Body() createSubjectDto: CreateSubjectDto, @TenantId() instansiId: number) {
    return this.subjectsService.create(createSubjectDto, instansiId);
  }

  @Get()
  findAll(
    @TenantId() instansiId: number,
    @Query('search') search?: string,
    @Query('level') level?: string,
    @Query('grade') grade?: string,
    @Query('curriculumType') curriculumType?: CurriculumType,
    @Query('isActive') isActive?: string,
    @Query('isMandatory') isMandatory?: string,
    @Query('isElective') isElective?: string,
    @Query('teacherId') teacherId?: string,
  ) {
    return this.subjectsService.findAll({
      search,
      level,
      grade,
      curriculumType: curriculumType as CurriculumType | undefined,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
      isMandatory: isMandatory !== undefined ? isMandatory === 'true' : undefined,
      isElective: isElective !== undefined ? isElective === 'true' : undefined,
      teacherId: teacherId ? +teacherId : undefined,
      instansiId,
    });
  }

  @Get('overview')
  getOverview(@TenantId() instansiId: number) {
    return this.subjectsService.getOverview(instansiId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @TenantId() instansiId: number) {
    return this.subjectsService.findOne(+id, instansiId);
  }

  @Get(':id/dashboard')
  getSubjectDashboard(@Param('id') id: string, @TenantId() instansiId: number) {
    return this.subjectsService.getSubjectDashboard(+id, instansiId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSubjectDto: UpdateSubjectDto, @TenantId() instansiId: number) {
    return this.subjectsService.update(+id, updateSubjectDto, instansiId);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() updateSubjectStatusDto: UpdateSubjectStatusDto,
    @TenantId() instansiId: number,
  ) {
    return this.subjectsService.updateStatus(+id, updateSubjectStatusDto, instansiId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @TenantId() instansiId: number) {
    return this.subjectsService.remove(+id, instansiId);
  }
}
