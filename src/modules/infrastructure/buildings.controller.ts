import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BuildingsService } from './buildings.service';
import { CreateBuildingDto } from './dto/create-building.dto';
import { UpdateBuildingDto } from './dto/update-building.dto';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('buildings')
@UseGuards(JwtAuthGuard)
export class BuildingsController {
  constructor(private readonly buildingsService: BuildingsService) {}

  @Post()
  create(@Body() createDto: CreateBuildingDto, @TenantId() instansiId: number) {
    return this.buildingsService.create(createDto, instansiId);
  }

  @Get()
  findAll(
    @TenantId() instansiId: number,
    @Query('landId') landId?: string,
  ) {
    return this.buildingsService.findAll(instansiId, {
      landId: landId ? parseInt(landId, 10) : undefined,
    });
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @TenantId() instansiId: number) {
    return this.buildingsService.findOne(id, instansiId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateBuildingDto,
    @TenantId() instansiId: number,
  ) {
    return this.buildingsService.update(id, updateDto, instansiId);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @TenantId() instansiId: number) {
    return this.buildingsService.remove(id, instansiId);
  }
}


