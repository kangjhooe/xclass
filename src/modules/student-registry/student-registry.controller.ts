import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Res,
  Delete,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { StudentRegistryService } from './student-registry.service';
import { GenerateRegistryDto, BatchGenerateRegistryDto } from './dto/generate-registry.dto';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('student-registry')
@ApiBearerAuth()
@Controller({ path: ['student-registry', 'tenants/:tenant/student-registry'] })
@UseGuards(JwtAuthGuard, TenantGuard)
export class StudentRegistryController {
  constructor(private readonly registryService: StudentRegistryService) {}

  @Post('generate')
  @ApiOperation({ summary: 'Generate buku induk untuk satu siswa' })
  @ApiResponse({ status: 201, description: 'Buku induk berhasil di-generate' })
  @ApiResponse({ status: 404, description: 'Siswa tidak ditemukan' })
  async generateRegistry(
    @Body() dto: GenerateRegistryDto,
    @TenantId() instansiId: number,
    @CurrentUser() user: any,
    @Res() res?: Response,
  ) {
    const result = await this.registryService.generateRegistry(
      dto,
      instansiId,
      user?.name || user?.email,
      user?.id,
    );

    // If PDF format, return as PDF download
    if (result.pdfBuffer && (!dto.format || dto.format === 'pdf')) {
      if (res) {
        const filename = `Buku_Induk_${result.student.nik}_${result.student.name.replace(/\s+/g, '_')}.pdf`;
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(result.pdfBuffer);
        return;
      }
    }

    return result;
  }

  @Post('batch-generate')
  @ApiOperation({ summary: 'Batch generate buku induk untuk multiple siswa' })
  @ApiResponse({ status: 201, description: 'Batch generate berhasil' })
  async batchGenerateRegistry(
    @Body() dto: BatchGenerateRegistryDto,
    @TenantId() instansiId: number,
    @CurrentUser() user: any,
    @Res() res?: Response,
  ) {
    const result = await this.registryService.batchGenerateRegistry(
      dto,
      instansiId,
      user?.name || user?.email,
      user?.id,
    );

    // If zip format, return as zip download
    if (result.zipBuffer && dto.format === 'zip') {
      if (res) {
        const filename = `Buku_Induk_Batch_${new Date().toISOString().split('T')[0]}.zip`;
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(result.zipBuffer);
        return;
      }
    }

    return result;
  }

  @Get('data/:nik')
  @ApiOperation({ summary: 'Get registry data (tanpa generate PDF)' })
  @ApiResponse({ status: 200, description: 'Data berhasil diambil' })
  @ApiResponse({ status: 404, description: 'Siswa tidak ditemukan' })
  @ApiQuery({ name: 'academicYear', required: false, description: 'Tahun ajaran' })
  async getRegistryData(
    @Param('nik') nik: string,
    @TenantId() instansiId: number,
    @Query('academicYear') academicYear?: string,
  ) {
    return await this.registryService.getRegistryData(nik, instansiId, academicYear);
  }

  @Get('snapshots/:nik')
  @ApiOperation({ summary: 'Get semua snapshot buku induk untuk siswa' })
  @ApiResponse({ status: 200, description: 'Snapshots berhasil diambil' })
  async getStudentSnapshots(
    @Param('nik') nik: string,
    @TenantId() instansiId: number,
  ) {
    return await this.registryService.getStudentSnapshots(nik, instansiId);
  }

  @Get('snapshot/:id')
  @ApiOperation({ summary: 'Get snapshot detail' })
  @ApiResponse({ status: 200, description: 'Snapshot berhasil diambil' })
  @ApiResponse({ status: 404, description: 'Snapshot tidak ditemukan' })
  async getSnapshot(
    @Param('id') id: string,
    @TenantId() instansiId: number,
  ) {
    return await this.registryService.getSnapshot(+id, instansiId);
  }

  @Get('snapshot/:id/pdf')
  @ApiOperation({ summary: 'Download PDF dari snapshot' })
  @ApiResponse({ status: 200, description: 'PDF berhasil di-download' })
  @ApiResponse({ status: 404, description: 'Snapshot atau PDF tidak ditemukan' })
  async getSnapshotPDF(
    @Param('id') id: string,
    @TenantId() instansiId: number,
    @Res() res: Response,
  ) {
    const pdfBuffer = await this.registryService.getSnapshotPDF(+id, instansiId);
    const snapshot = await this.registryService.getSnapshot(+id, instansiId);

    const filename = `Buku_Induk_${snapshot.nik}_${snapshot.createdAt.toISOString().split('T')[0]}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(pdfBuffer);
  }

  @Delete('snapshot/:id')
  @ApiOperation({ summary: 'Hapus snapshot' })
  @ApiResponse({ status: 200, description: 'Snapshot berhasil dihapus' })
  @ApiResponse({ status: 404, description: 'Snapshot tidak ditemukan' })
  async deleteSnapshot(
    @Param('id') id: string,
    @TenantId() instansiId: number,
  ) {
    return await this.registryService.deleteSnapshot(+id, instansiId);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get statistics buku induk' })
  @ApiResponse({ status: 200, description: 'Statistics berhasil diambil' })
  async getStatistics(@TenantId() instansiId: number) {
    return await this.registryService.getStatistics(instansiId);
  }
}

