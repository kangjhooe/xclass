import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';

import { GradesService } from './grades.service';
import { CreateStudentGradeDto } from './dto/create-student-grade.dto';
import { UpdateStudentGradeDto } from './dto/update-student-grade.dto';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { AssessmentType } from './entities/student-grade.entity';

@Controller({ path: ['grades', 'tenants/:tenant/grades'] })
@UseGuards(JwtAuthGuard, TenantGuard)
export class GradesController {
  constructor(private readonly gradesService: GradesService) {}

  @Post()
  create(
    @Body() createStudentGradeDto: CreateStudentGradeDto,
    @TenantId() instansiId: number,
    @Req() req: Request,
  ) {
    return this.gradesService.create(createStudentGradeDto, instansiId, req.user as any);
  }

  @Get()
  findAll(
    @TenantId() instansiId: number,
    @Req() req: Request,
    @Query('studentId') studentId?: string,
    @Query('subjectId') subjectId?: string,
    @Query('classId') classId?: string,
    @Query('assessmentType') assessmentType?: string,
    @Query('competencyId') competencyId?: string,
    @Query('search') search?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('updatedSince') updatedSince?: string,
    @Query('teacherId') teacherId?: string,
  ) {
    const filters = {
      instansiId,
      studentId: this.parseNumber(studentId),
      subjectId: this.parseNumber(subjectId),
      classId: this.parseNumber(classId),
      assessmentType: assessmentType && Object.values(AssessmentType).includes(assessmentType as AssessmentType)
        ? (assessmentType as AssessmentType)
        : undefined,
      competencyId: this.parseNumber(competencyId),
      search: search?.trim() || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      updatedSince: updatedSince || undefined,
      teacherId: this.parseNumber(teacherId),
    };

    return this.gradesService.findAll(filters, req.user as any);
  }

  @Get('export')
  async export(
    @TenantId() instansiId: number,
    @Query('format') format: string = 'excel',
    @Query('studentId') studentId?: string,
    @Query('subjectId') subjectId?: string,
    @Query('classId') classId?: string,
    @Query('assessmentType') assessmentType?: string,
    @Query('competencyId') competencyId?: string,
    @Query('search') search?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('teacherId') teacherId?: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const filters = {
      instansiId,
      studentId: this.parseNumber(studentId),
      subjectId: this.parseNumber(subjectId),
      classId: this.parseNumber(classId),
      assessmentType: assessmentType && Object.values(AssessmentType).includes(assessmentType as AssessmentType)
        ? (assessmentType as AssessmentType)
        : undefined,
      competencyId: this.parseNumber(competencyId),
      search: search?.trim() || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      teacherId: this.parseNumber(teacherId),
    };

    const normalizedFormat = (format || 'excel').toLowerCase();
    const allowedFormats: Array<'excel' | 'pdf' | 'csv'> = ['excel', 'pdf', 'csv'];
    const selectedFormat = allowedFormats.includes(normalizedFormat as any)
      ? (normalizedFormat as 'excel' | 'pdf' | 'csv')
      : 'excel';

    await this.gradesService.export(filters, selectedFormat, res, req.user as any);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @TenantId() instansiId: number, @Req() req: Request) {
    return this.gradesService.findOne(+id, instansiId, req.user as any);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateStudentGradeDto: UpdateStudentGradeDto,
    @TenantId() instansiId: number,
    @Req() req: Request,
  ) {
    return this.gradesService.update(+id, updateStudentGradeDto, instansiId, req.user as any);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @TenantId() instansiId: number, @Req() req: Request) {
    return this.gradesService.remove(+id, instansiId, req.user as any);
  }

  private parseNumber(value?: string): number | undefined {
    if (!value) {
      return undefined;
    }
    const parsed = Number(value);
    return Number.isNaN(parsed) ? undefined : parsed;
  }
}

