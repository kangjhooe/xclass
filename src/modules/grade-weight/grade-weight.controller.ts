import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { GradeWeightService } from './grade-weight.service';
import { CreateGradeWeightDto } from './dto/create-grade-weight.dto';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('grade-weights')
@UseGuards(JwtAuthGuard)
export class GradeWeightController {
  constructor(private readonly gradeWeightService: GradeWeightService) {}

  @Post()
  create(
    @Body() createDto: CreateGradeWeightDto,
    @TenantId() instansiId: number,
  ) {
    return this.gradeWeightService.create(createDto, instansiId);
  }

  @Get()
  findAll(@TenantId() instansiId: number) {
    return this.gradeWeightService.findAll(instansiId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @TenantId() instansiId: number) {
    return this.gradeWeightService.findOne(+id, instansiId);
  }

  @Patch(':id/toggle-active')
  toggleActive(@Param('id') id: string, @TenantId() instansiId: number) {
    return this.gradeWeightService.toggleActive(+id, instansiId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @TenantId() instansiId: number) {
    return this.gradeWeightService.remove(+id, instansiId);
  }
}

