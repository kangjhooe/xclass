import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { AcademicYearService } from './academic-year.service';
import { CreateAcademicYearDto } from './dto/create-academic-year.dto';
import { UpdateAcademicYearDto } from './dto/update-academic-year.dto';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('academic-years')
@UseGuards(JwtAuthGuard)
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
  findAll(@TenantId() instansiId: number) {
    return this.academicYearService.findAll(instansiId);
  }

  @Get('active')
  getActive(@TenantId() instansiId: number) {
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

  @Delete(':id')
  remove(@Param('id') id: string, @TenantId() instansiId: number) {
    return this.academicYearService.remove(+id, instansiId);
  }
}

