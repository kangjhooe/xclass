import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Put,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { GraduationService } from './graduation.service';
import { CreateGraduationDto } from './dto/create-graduation.dto';
import { CreateBatchGraduationDto } from './dto/create-batch-graduation.dto';
import { UpdateGraduationDto } from './dto/update-graduation.dto';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';

@Controller({ path: ['graduations', 'tenants/:tenant/graduations'] })
@UseGuards(JwtAuthGuard, TenantGuard)
export class GraduationController {
  constructor(private readonly graduationService: GraduationService) {}

  @Post()
  create(
    @Body() createDto: CreateGraduationDto,
    @TenantId() instansiId: number,
  ) {
    return this.graduationService.create(createDto, instansiId);
  }

  @Post('batch')
  createBatch(
    @Body() batchDto: CreateBatchGraduationDto,
    @TenantId() instansiId: number,
  ) {
    return this.graduationService.createBatch(batchDto, instansiId);
  }

  @Get()
  findAll(
    @TenantId() instansiId: number,
    @Query('graduationYear') graduationYear?: number,
    @Query('status') status?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.graduationService.findAll({
      instansiId,
      graduationYear: graduationYear ? Number(graduationYear) : undefined,
      status,
      page: Number(page),
      limit: Number(limit),
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string, @TenantId() instansiId: number) {
    return this.graduationService.findOne(+id, instansiId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateGraduationDto,
    @TenantId() instansiId: number,
  ) {
    return this.graduationService.update(+id, updateDto, instansiId);
  }

  @Put(':id/approve')
  approve(@Param('id') id: string, @TenantId() instansiId: number) {
    return this.graduationService.approve(+id, instansiId);
  }

  @Patch(':id/generate-certificate')
  generateCertificate(@Param('id') id: string, @TenantId() instansiId: number) {
    return this.graduationService.generateCertificate(+id, instansiId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @TenantId() instansiId: number) {
    return this.graduationService.remove(+id, instansiId);
  }
}

