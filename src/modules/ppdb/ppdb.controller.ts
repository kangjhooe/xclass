import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { PpdbService } from './ppdb.service';
import { CreatePpdbRegistrationDto } from './dto/create-ppdb-registration.dto';
import { UpdatePpdbRegistrationDto } from './dto/update-ppdb-registration.dto';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { RegistrationStatus } from './entities/ppdb-registration.entity';

@Controller('ppdb')
export class PpdbController {
  constructor(private readonly ppdbService: PpdbService) {}

  @Post('registrations')
  create(
    @Body() createDto: CreatePpdbRegistrationDto,
    @TenantId() instansiId: number,
  ) {
    return this.ppdbService.create(createDto, instansiId);
  }

  @Get('registrations')
  findAll(
    @TenantId() instansiId: number,
    @Query('search') search?: string,
    @Query('status') status?: RegistrationStatus,
    @Query('registrationPath') registrationPath?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.ppdbService.findAll({
      search,
      status,
      registrationPath,
      page: +page,
      limit: +limit,
      instansiId,
    });
  }

  @Get('registrations/:id')
  findOne(@Param('id') id: string, @TenantId() instansiId: number) {
    return this.ppdbService.findOne(+id, instansiId);
  }

  @Patch('registrations/:id')
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdatePpdbRegistrationDto,
    @TenantId() instansiId: number,
  ) {
    return this.ppdbService.update(+id, updateDto, instansiId);
  }

  @Delete('registrations/:id')
  remove(@Param('id') id: string, @TenantId() instansiId: number) {
    return this.ppdbService.remove(+id, instansiId);
  }

  @Patch('registrations/:id/status')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: RegistrationStatus,
    @Body('notes') notes: string,
    @TenantId() instansiId: number,
  ) {
    return this.ppdbService.updateStatus(+id, status, instansiId, notes);
  }

  @Get('statistics')
  getStatistics(@TenantId() instansiId: number) {
    return this.ppdbService.getStatistics(instansiId);
  }
}

