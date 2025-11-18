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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { CounselingService } from './counseling.service';
import { CreateCounselingSessionDto } from './dto/create-counseling-session.dto';
import { UpdateCounselingSessionDto } from './dto/update-counseling-session.dto';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { ModuleAccessGuard } from '../../common/guards/module-access.guard';
import { ModuleAccess } from '../../common/decorators/module-access.decorator';

@ApiTags('counseling')
@ApiBearerAuth()
@Controller('counseling')
@UseGuards(JwtAuthGuard, TenantGuard, ModuleAccessGuard)
export class CounselingController {
  constructor(private readonly counselingService: CounselingService) {}

  @Post('sessions')
  @ModuleAccess('counseling', 'create')
  @ApiOperation({ summary: 'Buat sesi konseling baru' })
  @ApiResponse({ status: 201, description: 'Sesi konseling berhasil dibuat' })
  @ApiResponse({ status: 400, description: 'Data tidak valid atau validasi gagal' })
  @ApiResponse({ status: 404, description: 'Siswa atau konselor tidak ditemukan' })
  create(
    @Body() createDto: CreateCounselingSessionDto,
    @TenantId() instansiId: number,
  ) {
    return this.counselingService.create(createDto, instansiId);
  }

  @Get('sessions')
  @ModuleAccess('counseling', 'view')
  @ApiOperation({ summary: 'Dapatkan daftar sesi konseling dengan filter dan pagination' })
  @ApiResponse({ status: 200, description: 'Daftar sesi konseling berhasil diambil' })
  @ApiQuery({ name: 'studentId', required: false, type: Number, description: 'Filter berdasarkan ID siswa' })
  @ApiQuery({ name: 'counselorId', required: false, type: Number, description: 'Filter berdasarkan ID konselor' })
  @ApiQuery({ name: 'status', required: false, enum: ['scheduled', 'in_progress', 'completed', 'cancelled'], description: 'Filter berdasarkan status' })
  @ApiQuery({ name: 'startDate', required: false, type: String, description: 'Filter dari tanggal (ISO format)' })
  @ApiQuery({ name: 'endDate', required: false, type: String, description: 'Filter sampai tanggal (ISO format)' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Pencarian di masalah, catatan, atau nama' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Nomor halaman', example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Jumlah data per halaman', example: 20 })
  findAll(
    @TenantId() instansiId: number,
    @Query('studentId') studentId?: number,
    @Query('counselorId') counselorId?: number,
    @Query('status') status?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('search') search?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.counselingService.findAll({
      instansiId,
      studentId: studentId ? Number(studentId) : undefined,
      counselorId: counselorId ? Number(counselorId) : undefined,
      status,
      startDate,
      endDate,
      search,
      page: Number(page),
      limit: Number(limit),
    });
  }

  @Get('sessions/:id')
  @ModuleAccess('counseling', 'view')
  @ApiOperation({ summary: 'Dapatkan detail sesi konseling berdasarkan ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID sesi konseling' })
  @ApiResponse({ status: 200, description: 'Detail sesi konseling berhasil diambil' })
  @ApiResponse({ status: 404, description: 'Sesi konseling tidak ditemukan' })
  findOne(@Param('id') id: string, @TenantId() instansiId: number) {
    return this.counselingService.findOne(+id, instansiId);
  }

  @Patch('sessions/:id')
  @ModuleAccess('counseling', 'update')
  @ApiOperation({ summary: 'Update sesi konseling' })
  @ApiParam({ name: 'id', type: Number, description: 'ID sesi konseling' })
  @ApiResponse({ status: 200, description: 'Sesi konseling berhasil diupdate' })
  @ApiResponse({ status: 400, description: 'Data tidak valid atau validasi gagal' })
  @ApiResponse({ status: 404, description: 'Sesi konseling tidak ditemukan' })
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateCounselingSessionDto,
    @TenantId() instansiId: number,
  ) {
    return this.counselingService.update(+id, updateDto, instansiId);
  }

  @Patch('sessions/:id/status')
  @ModuleAccess('counseling', 'update')
  @ApiOperation({ summary: 'Update status sesi konseling' })
  @ApiParam({ name: 'id', type: Number, description: 'ID sesi konseling' })
  @ApiResponse({ status: 200, description: 'Status sesi konseling berhasil diupdate' })
  @ApiResponse({ status: 400, description: 'Status tidak valid atau validasi gagal' })
  @ApiResponse({ status: 404, description: 'Sesi konseling tidak ditemukan' })
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @TenantId() instansiId: number,
  ) {
    return this.counselingService.updateStatus(+id, status, instansiId);
  }

  @Delete('sessions/:id')
  @ModuleAccess('counseling', 'delete')
  @ApiOperation({ summary: 'Hapus sesi konseling' })
  @ApiParam({ name: 'id', type: Number, description: 'ID sesi konseling' })
  @ApiResponse({ status: 200, description: 'Sesi konseling berhasil dihapus' })
  @ApiResponse({ status: 404, description: 'Sesi konseling tidak ditemukan' })
  remove(@Param('id') id: string, @TenantId() instansiId: number) {
    return this.counselingService.remove(+id, instansiId);
  }
}

