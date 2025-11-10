import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { DataPokokService } from './data-pokok.service';
import { CreateDataPokokDto } from './dto/create-data-pokok.dto';
import { UpdateDataPokokDto } from './dto/update-data-pokok.dto';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';

@Controller('data-pokok')
@UseGuards(JwtAuthGuard, TenantGuard)
export class DataPokokController {
  constructor(private readonly dataPokokService: DataPokokService) {}

  @Post()
  create(@Body() createDataPokokDto: CreateDataPokokDto, @TenantId() instansiId: number) {
    return this.dataPokokService.create(createDataPokokDto, instansiId);
  }

  @Get()
  findOne(@TenantId() instansiId: number) {
    return this.dataPokokService.findOne(instansiId);
  }

  @Patch()
  update(@Body() updateDataPokokDto: UpdateDataPokokDto, @TenantId() instansiId: number) {
    return this.dataPokokService.update(updateDataPokokDto, instansiId);
  }

  @Delete()
  remove(@TenantId() instansiId: number) {
    return this.dataPokokService.remove(instansiId);
  }
}

