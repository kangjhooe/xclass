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
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('rooms')
@UseGuards(JwtAuthGuard)
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post()
  create(@Body() createDto: CreateRoomDto, @TenantId() instansiId: number) {
    return this.roomsService.create(createDto, instansiId);
  }

  @Get()
  findAll(
    @TenantId() instansiId: number,
    @Query('buildingId') buildingId?: string,
    @Query('usageType') usageType?: string,
    @Query('condition') condition?: string,
  ) {
    return this.roomsService.findAll(instansiId, {
      buildingId: buildingId ? parseInt(buildingId, 10) : undefined,
      usageType,
      condition,
    });
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @TenantId() instansiId: number) {
    return this.roomsService.findOne(id, instansiId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateRoomDto,
    @TenantId() instansiId: number,
  ) {
    return this.roomsService.update(id, updateDto, instansiId);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @TenantId() instansiId: number) {
    return this.roomsService.remove(id, instansiId);
  }
}


