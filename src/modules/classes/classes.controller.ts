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
import { ClassesService } from './classes.service';
import { CreateClassRoomDto } from './dto/create-class-room.dto';
import { UpdateClassRoomDto } from './dto/update-class-room.dto';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';

@Controller('classes')
@UseGuards(JwtAuthGuard, TenantGuard)
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  @Post()
  create(@Body() createClassRoomDto: CreateClassRoomDto, @TenantId() instansiId: number) {
    return this.classesService.create(createClassRoomDto, instansiId);
  }

  @Get()
  findAll(@TenantId() instansiId: number, @Query('search') search?: string) {
    return this.classesService.findAll({ search, instansiId });
  }

  @Get(':id')
  findOne(@Param('id') id: string, @TenantId() instansiId: number) {
    return this.classesService.findOne(+id, instansiId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateClassRoomDto: UpdateClassRoomDto, @TenantId() instansiId: number) {
    return this.classesService.update(+id, updateClassRoomDto, instansiId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @TenantId() instansiId: number) {
    return this.classesService.remove(+id, instansiId);
  }
}
