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
import { CurriculumService } from './curriculum.service';
import { CreateCurriculumDto } from './dto/create-curriculum.dto';
import { UpdateCurriculumDto } from './dto/update-curriculum.dto';
import { CreateSyllabusDto } from './dto/create-syllabus.dto';
import { UpdateSyllabusDto } from './dto/update-syllabus.dto';
import { CreateLearningMaterialDto } from './dto/create-learning-material.dto';
import { UpdateLearningMaterialDto } from './dto/update-learning-material.dto';
import { CreateCompetencyDto } from './dto/create-competency.dto';
import { UpdateCompetencyDto } from './dto/update-competency.dto';
import { CreateCurriculumScheduleDto } from './dto/create-curriculum-schedule.dto';
import { UpdateCurriculumScheduleDto } from './dto/update-curriculum-schedule.dto';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';

@Controller({ path: ['curriculum', 'tenants/:tenant/curriculum'] })
@UseGuards(JwtAuthGuard, TenantGuard)
export class CurriculumController {
  constructor(private readonly curriculumService: CurriculumService) {}

  // ========== Curriculum Endpoints ==========
  @Post('curricula')
  createCurriculum(@Body() createCurriculumDto: CreateCurriculumDto, @TenantId() instansiId: number) {
    return this.curriculumService.createCurriculum(createCurriculumDto, instansiId);
  }

  @Get('curricula')
  findAllCurricula(
    @TenantId() instansiId: number,
    @Query('academicYearId') academicYearId?: number,
    @Query('level') level?: string,
    @Query('grade') grade?: string,
    @Query('semester') semester?: number,
  ) {
    return this.curriculumService.findAllCurricula({
      academicYearId: academicYearId ? +academicYearId : undefined,
      level,
      grade,
      semester: semester ? +semester : undefined,
      instansiId,
    });
  }

  @Get('curricula/:id')
  findOneCurriculum(@Param('id') id: string, @TenantId() instansiId: number) {
    return this.curriculumService.findOneCurriculum(+id, instansiId);
  }

  @Patch('curricula/:id')
  updateCurriculum(
    @Param('id') id: string,
    @Body() updateCurriculumDto: UpdateCurriculumDto,
    @TenantId() instansiId: number,
  ) {
    return this.curriculumService.updateCurriculum(+id, updateCurriculumDto, instansiId);
  }

  @Delete('curricula/:id')
  removeCurriculum(@Param('id') id: string, @TenantId() instansiId: number) {
    return this.curriculumService.removeCurriculum(+id, instansiId);
  }

  // ========== Syllabus Endpoints ==========
  @Post('syllabi')
  createSyllabus(@Body() createSyllabusDto: CreateSyllabusDto, @TenantId() instansiId: number) {
    return this.curriculumService.createSyllabus(createSyllabusDto, instansiId);
  }

  @Get('syllabi')
  findAllSyllabi(
    @TenantId() instansiId: number,
    @Query('curriculumId') curriculumId?: number,
    @Query('subjectId') subjectId?: number,
  ) {
    return this.curriculumService.findAllSyllabi({
      curriculumId: curriculumId ? +curriculumId : undefined,
      subjectId: subjectId ? +subjectId : undefined,
      instansiId,
    });
  }

  @Get('syllabi/:id')
  findOneSyllabus(@Param('id') id: string, @TenantId() instansiId: number) {
    return this.curriculumService.findOneSyllabus(+id, instansiId);
  }

  @Patch('syllabi/:id')
  updateSyllabus(
    @Param('id') id: string,
    @Body() updateSyllabusDto: UpdateSyllabusDto,
    @TenantId() instansiId: number,
  ) {
    return this.curriculumService.updateSyllabus(+id, updateSyllabusDto, instansiId);
  }

  @Delete('syllabi/:id')
  removeSyllabus(@Param('id') id: string, @TenantId() instansiId: number) {
    return this.curriculumService.removeSyllabus(+id, instansiId);
  }

  // ========== Learning Material Endpoints ==========
  @Post('learning-materials')
  createLearningMaterial(
    @Body() createLearningMaterialDto: CreateLearningMaterialDto,
    @TenantId() instansiId: number,
  ) {
    return this.curriculumService.createLearningMaterial(createLearningMaterialDto, instansiId);
  }

  @Get('learning-materials')
  findAllLearningMaterials(
    @TenantId() instansiId: number,
    @Query('syllabusId') syllabusId?: number,
    @Query('type') type?: string,
  ) {
    return this.curriculumService.findAllLearningMaterials({
      syllabusId: syllabusId ? +syllabusId : undefined,
      type,
      instansiId,
    });
  }

  @Get('learning-materials/:id')
  findOneLearningMaterial(@Param('id') id: string, @TenantId() instansiId: number) {
    return this.curriculumService.findOneLearningMaterial(+id, instansiId);
  }

  @Patch('learning-materials/:id')
  updateLearningMaterial(
    @Param('id') id: string,
    @Body() updateLearningMaterialDto: UpdateLearningMaterialDto,
    @TenantId() instansiId: number,
  ) {
    return this.curriculumService.updateLearningMaterial(+id, updateLearningMaterialDto, instansiId);
  }

  @Delete('learning-materials/:id')
  removeLearningMaterial(@Param('id') id: string, @TenantId() instansiId: number) {
    return this.curriculumService.removeLearningMaterial(+id, instansiId);
  }

  // ========== Competency Endpoints ==========
  @Post('competencies')
  createCompetency(@Body() createCompetencyDto: CreateCompetencyDto, @TenantId() instansiId: number) {
    return this.curriculumService.createCompetency(createCompetencyDto, instansiId);
  }

  @Get('competencies')
  findAllCompetencies(
    @TenantId() instansiId: number,
    @Query('syllabusId') syllabusId?: number,
    @Query('type') type?: string,
  ) {
    return this.curriculumService.findAllCompetencies({
      syllabusId: syllabusId ? +syllabusId : undefined,
      type,
      instansiId,
    });
  }

  @Get('competencies/:id')
  findOneCompetency(@Param('id') id: string, @TenantId() instansiId: number) {
    return this.curriculumService.findOneCompetency(+id, instansiId);
  }

  @Patch('competencies/:id')
  updateCompetency(
    @Param('id') id: string,
    @Body() updateCompetencyDto: UpdateCompetencyDto,
    @TenantId() instansiId: number,
  ) {
    return this.curriculumService.updateCompetency(+id, updateCompetencyDto, instansiId);
  }

  @Delete('competencies/:id')
  removeCompetency(@Param('id') id: string, @TenantId() instansiId: number) {
    return this.curriculumService.removeCompetency(+id, instansiId);
  }

  // ========== Curriculum Schedule Endpoints ==========
  @Post('schedules')
  createCurriculumSchedule(
    @Body() createCurriculumScheduleDto: CreateCurriculumScheduleDto,
    @TenantId() instansiId: number,
  ) {
    return this.curriculumService.createCurriculumSchedule(createCurriculumScheduleDto, instansiId);
  }

  @Get('schedules')
  findAllCurriculumSchedules(
    @TenantId() instansiId: number,
    @Query('curriculumId') curriculumId?: number,
    @Query('syllabusId') syllabusId?: number,
    @Query('classId') classId?: number,
    @Query('subjectId') subjectId?: number,
    @Query('teacherId') teacherId?: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.curriculumService.findAllCurriculumSchedules({
      curriculumId: curriculumId ? +curriculumId : undefined,
      syllabusId: syllabusId ? +syllabusId : undefined,
      classId: classId ? +classId : undefined,
      subjectId: subjectId ? +subjectId : undefined,
      teacherId: teacherId ? +teacherId : undefined,
      startDate,
      endDate,
      instansiId,
    });
  }

  @Get('schedules/:id')
  findOneCurriculumSchedule(@Param('id') id: string, @TenantId() instansiId: number) {
    return this.curriculumService.findOneCurriculumSchedule(+id, instansiId);
  }

  @Patch('schedules/:id')
  updateCurriculumSchedule(
    @Param('id') id: string,
    @Body() updateCurriculumScheduleDto: UpdateCurriculumScheduleDto,
    @TenantId() instansiId: number,
  ) {
    return this.curriculumService.updateCurriculumSchedule(+id, updateCurriculumScheduleDto, instansiId);
  }

  @Delete('schedules/:id')
  removeCurriculumSchedule(@Param('id') id: string, @TenantId() instansiId: number) {
    return this.curriculumService.removeCurriculumSchedule(+id, instansiId);
  }
}

