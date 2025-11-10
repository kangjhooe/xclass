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
import { PromotionService } from './promotion.service';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from '@nestjs/common';

@Controller('promotions')
@UseGuards(JwtAuthGuard)
export class PromotionController {
  constructor(private readonly promotionService: PromotionService) {}

  @Post()
  create(
    @Body() createDto: CreatePromotionDto,
    @TenantId() instansiId: number,
  ) {
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

  @Patch(':id/approve')
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

