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
import { AlumniService } from './alumni.service';
import { CreateAlumniDto } from './dto/create-alumni.dto';
import { UpdateAlumniDto } from './dto/update-alumni.dto';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('alumni')
@UseGuards(JwtAuthGuard)
export class AlumniController {
  constructor(private readonly alumniService: AlumniService) {}

  @Post()
  create(
    @Body() createDto: CreateAlumniDto,
    @TenantId() instansiId: number,
  ) {
    return this.alumniService.create(createDto, instansiId);
  }

  @Get()
  findAll(
    @TenantId() instansiId: number,
    @Query('status') status?: string,
    @Query('graduationYear') graduationYear?: number,
    @Query('search') search?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.alumniService.findAll({
      instansiId,
      status,
      graduationYear: graduationYear ? Number(graduationYear) : undefined,
      search,
      page: Number(page),
      limit: Number(limit),
    });
  }

  @Get('statistics')
  getStatistics(@TenantId() instansiId: number) {
    return this.alumniService.getStatistics(instansiId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @TenantId() instansiId: number) {
    return this.alumniService.findOne(+id, instansiId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateAlumniDto,
    @TenantId() instansiId: number,
  ) {
    return this.alumniService.update(+id, updateDto, instansiId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @TenantId() instansiId: number) {
    return this.alumniService.remove(+id, instansiId);
  }
}

