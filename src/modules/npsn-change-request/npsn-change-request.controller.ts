import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  ParseIntPipe,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { NpsnChangeRequestService } from './npsn-change-request.service';
import { CreateNpsnChangeRequestDto } from './dto/create-npsn-change-request.dto';
import { UpdateNpsnChangeRequestDto } from './dto/update-npsn-change-request.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NpsnChangeRequestStatus } from './entities/npsn-change-request.entity';

@Controller('npsn-change-requests')
@UseGuards(JwtAuthGuard)
export class NpsnChangeRequestController {
  constructor(
    private readonly npsnChangeRequestService: NpsnChangeRequestService,
  ) {}

  @Post()
  async create(@Body() createDto: CreateNpsnChangeRequestDto, @Request() req) {
    const user = req.user;
    const tenantId = user.instansiId;

    if (!tenantId) {
      throw new BadRequestException('Tenant ID tidak ditemukan');
    }

    return await this.npsnChangeRequestService.create(
      tenantId,
      createDto,
      user.id,
    );
  }

  @Get()
  async findAll(@Request() req) {
    const user = req.user;

    // Super admin bisa lihat semua, admin tenant hanya lihat milik tenant mereka
    if (user.role === 'super_admin') {
      return await this.npsnChangeRequestService.findAll();
    } else {
      return await this.npsnChangeRequestService.findByTenant(user.instansiId);
    }
  }

  @Get('pending')
  async findPending(@Request() req) {
    const user = req.user;

    if (user.role !== 'super_admin') {
      throw new ForbiddenException('Hanya super admin yang dapat melihat semua request pending');
    }

    return await this.npsnChangeRequestService.findAll(
      NpsnChangeRequestStatus.PENDING,
    );
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const request = await this.npsnChangeRequestService.findOne(id);
    const user = req.user;

    // Admin tenant hanya bisa lihat request milik tenant mereka
    if (user.role !== 'super_admin' && request.tenantId !== user.instansiId) {
      throw new ForbiddenException('Anda tidak memiliki akses untuk melihat request ini');
    }

    return request;
  }

  @Patch(':id/approve')
  async approve(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateNpsnChangeRequestDto,
    @Request() req,
  ) {
    const user = req.user;

    if (user.role !== 'super_admin') {
      throw new ForbiddenException('Hanya super admin yang dapat menyetujui request');
    }

    return await this.npsnChangeRequestService.update(
      id,
      { ...updateDto, status: NpsnChangeRequestStatus.APPROVED },
      user.id,
    );
  }

  @Patch(':id/reject')
  async reject(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateNpsnChangeRequestDto,
    @Request() req,
  ) {
    const user = req.user;

    if (user.role !== 'super_admin') {
      throw new ForbiddenException('Hanya super admin yang dapat menolak request');
    }

    return await this.npsnChangeRequestService.update(
      id,
      { ...updateDto, status: NpsnChangeRequestStatus.REJECTED },
      user.id,
    );
  }

  @Delete(':id')
  async cancel(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const user = req.user;
    const tenantId = user.instansiId;

    if (!tenantId) {
      throw new BadRequestException('Tenant ID tidak ditemukan');
    }

    await this.npsnChangeRequestService.cancel(id, tenantId);
    return { message: 'Request berhasil dibatalkan' };
  }
}

