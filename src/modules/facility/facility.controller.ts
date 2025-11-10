import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { FacilityService } from './facility.service';
import { CreateFacilityDto } from './dto/create-facility.dto';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('facilities')
@UseGuards(JwtAuthGuard)
export class FacilityController {
  constructor(private readonly facilityService: FacilityService) {}

  @Post()
  create(
    @Body() createDto: CreateFacilityDto,
    @TenantId() instansiId: number,
  ) {
    return this.facilityService.create(createDto, instansiId);
  }

  @Get()
  findAll(
    @TenantId() instansiId: number,
    @Query('type') type?: string,
  ) {
    return this.facilityService.findAll(instansiId, type);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @TenantId() instansiId: number) {
    return this.facilityService.findOne(+id, instansiId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @TenantId() instansiId: number) {
    return this.facilityService.remove(+id, instansiId);
  }
}

