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
import { GraduationService } from './graduation.service';
import { CreateGraduationDto } from './dto/create-graduation.dto';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('graduations')
@UseGuards(JwtAuthGuard)
export class GraduationController {
  constructor(private readonly graduationService: GraduationService) {}

  @Post()
  create(
    @Body() createDto: CreateGraduationDto,
    @TenantId() instansiId: number,
  ) {
    return this.graduationService.create(createDto, instansiId);
  }

  @Get()
  findAll(
    @TenantId() instansiId: number,
    @Query('graduationYear') graduationYear?: number,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.graduationService.findAll({
      instansiId,
      graduationYear: graduationYear ? Number(graduationYear) : undefined,
      page: Number(page),
      limit: Number(limit),
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string, @TenantId() instansiId: number) {
    return this.graduationService.findOne(+id, instansiId);
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

