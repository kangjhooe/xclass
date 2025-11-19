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
  Request,
} from '@nestjs/common';
import { PromotionService } from './promotion.service';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { CreateBatchPromotionDto } from './dto/create-batch-promotion.dto';
import { RejectPromotionDto } from './dto/reject-promotion.dto';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';

@Controller({ path: ['promotions', 'tenants/:tenant/promotions'] })
@UseGuards(JwtAuthGuard, TenantGuard)
export class PromotionController {
  constructor(private readonly promotionService: PromotionService) {}

  @Post()
  create(
    @Body() body: any,
    @TenantId() instansiId: number,
  ) {
    // Transform frontend format ke backend format
    const createDto: CreatePromotionDto = {
      studentId: body.student_id || body.studentId,
      fromClassId: body.from_class_id || body.fromClassId,
      toClassId: body.to_class_id || body.toClassId,
      academicYear: body.academic_year_id || body.academicYear,
      status: body.status,
      finalGrade: body.final_grade || body.finalGrade,
      notes: body.notes,
    };
    return this.promotionService.create(createDto, instansiId);
  }

  @Get()
  findAll(
    @TenantId() instansiId: number,
    @Query('status') status?: string,
    @Query('academicYear') academicYear?: number,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.promotionService.findAll({
      instansiId,
      status,
      academicYear: academicYear ? Number(academicYear) : undefined,
      page: Number(page),
      limit: Number(limit),
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string, @TenantId() instansiId: number) {
    return this.promotionService.findOne(+id, instansiId);
  }

  @Post('batch')
  createBatch(
    @Body() body: any,
    @TenantId() instansiId: number,
  ) {
    // Transform frontend format ke backend format
    const createBatchDto: CreateBatchPromotionDto = {
      academicYear: body.academic_year_id || body.academicYear,
      fromClassId: body.from_class_id || body.fromClassId,
      toClassId: body.to_class_id || body.toClassId,
      studentIds: body.student_ids || body.studentIds,
      notes: body.notes,
    };
    return this.promotionService.createBatch(createBatchDto, instansiId);
  }

  @Put(':id/approve')
  approve(
    @Param('id') id: string,
    @TenantId() instansiId: number,
    @Request() req: any,
  ) {
    return this.promotionService.approve(
      +id,
      instansiId,
      req.user?.id || req.user?.userId || 1,
    );
  }

  @Put(':id/reject')
  reject(
    @Param('id') id: string,
    @Body() rejectDto: RejectPromotionDto,
    @TenantId() instansiId: number,
  ) {
    return this.promotionService.reject(+id, instansiId, rejectDto);
  }

  @Patch(':id/complete')
  complete(@Param('id') id: string, @TenantId() instansiId: number) {
    return this.promotionService.complete(+id, instansiId);
  }

  @Patch(':id/cancel')
  cancel(@Param('id') id: string, @TenantId() instansiId: number) {
    return this.promotionService.cancel(+id, instansiId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @TenantId() instansiId: number) {
    return this.promotionService.remove(+id, instansiId);
  }
}

