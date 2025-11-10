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
import { GradesService } from './grades.service';
import { CreateStudentGradeDto } from './dto/create-student-grade.dto';
import { UpdateStudentGradeDto } from './dto/update-student-grade.dto';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';

@Controller('grades')
@UseGuards(JwtAuthGuard, TenantGuard)
export class GradesController {
  constructor(private readonly gradesService: GradesService) {}

  @Post()
  create(@Body() createStudentGradeDto: CreateStudentGradeDto, @TenantId() instansiId: number) {
    return this.gradesService.create(createStudentGradeDto, instansiId);
  }

  @Get()
  findAll(
    @TenantId() instansiId: number,
    @Query('studentId') studentId?: number,
    @Query('subjectId') subjectId?: number,
  ) {
    return this.gradesService.findAll({ studentId, subjectId, instansiId });
  }

  @Get(':id')
  findOne(@Param('id') id: string, @TenantId() instansiId: number) {
    return this.gradesService.findOne(+id, instansiId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateStudentGradeDto: UpdateStudentGradeDto, @TenantId() instansiId: number) {
    return this.gradesService.update(+id, updateStudentGradeDto, instansiId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @TenantId() instansiId: number) {
    return this.gradesService.remove(+id, instansiId);
  }
}
