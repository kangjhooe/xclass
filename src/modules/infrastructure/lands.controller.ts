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
import { LandsService } from './lands.service';
import { CreateLandDto } from './dto/create-land.dto';
import { UpdateLandDto } from './dto/update-land.dto';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { LandOwnershipStatus } from './entities/land.entity';

@Controller('lands')
@UseGuards(JwtAuthGuard)
export class LandsController {
  constructor(private readonly landsService: LandsService) {}

  @Post()
  create(@Body() createDto: CreateLandDto, @TenantId() instansiId: number) {
    return this.landsService.create(createDto, instansiId);
  }

  @Get()
  findAll(
    @TenantId() instansiId: number,
    @Query('search') search?: string,
    @Query('ownershipStatus') ownershipStatus?: LandOwnershipStatus,
  ) {
    return this.landsService.findAll(instansiId, {
      search,
      ownershipStatus,
    });
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @TenantId() instansiId: number) {
    return this.landsService.findOne(id, instansiId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateLandDto,
    @TenantId() instansiId: number,
  ) {
    return this.landsService.update(id, updateDto, instansiId);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @TenantId() instansiId: number) {
    return this.landsService.remove(id, instansiId);
  }
}


