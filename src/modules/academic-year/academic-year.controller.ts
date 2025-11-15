import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { AcademicYearService } from './academic-year.service';
import { CreateAcademicYearDto } from './dto/create-academic-year.dto';
import { UpdateAcademicYearDto } from './dto/update-academic-year.dto';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { SemesterType } from './entities/academic-year.entity';

@Controller({ path: ['academic-years', 'tenants/:tenant/academic-years'] })
@UseGuards(JwtAuthGuard, TenantGuard)
export class AcademicYearController {
  constructor(private readonly academicYearService: AcademicYearService) {}

  @Post()
  create(
    @Body() createDto: CreateAcademicYearDto,
    @TenantId() instansiId: number,
  ) {
    return this.academicYearService.create(createDto, instansiId);
  }

  @Get()
  async findAll(@TenantId() instansiId: number) {
    const data = await this.academicYearService.findAll(instansiId);
    return {
      data,
      total: data.length,
    };
  }

  @Get('active')
  async getActive(@TenantId() instansiId: number, @Query('withSemester') withSemester?: string) {
    if (withSemester === 'true') {
      return this.academicYearService.getActiveWithSemester(instansiId);
    }
    return this.academicYearService.getActive(instansiId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @TenantId() instansiId: number) {
    return this.academicYearService.findOne(+id, instansiId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateAcademicYearDto,
    @TenantId() instansiId: number,
  ) {
    return this.academicYearService.update(+id, updateDto, instansiId);
  }

  @Patch(':id/set-active')
  setActive(@Param('id') id: string, @TenantId() instansiId: number) {
    return this.academicYearService.setActive(+id, instansiId);
  }

  @Patch(':id/set-semester')
  setSemester(
    @Param('id') id: string,
    @Body('semesterType') semesterType: SemesterType,
    @TenantId() instansiId: number,
  ) {
    return this.academicYearService.setSemester(+id, semesterType, instansiId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @TenantId() instansiId: number) {
    return this.academicYearService.remove(+id, instansiId);
  }
}

