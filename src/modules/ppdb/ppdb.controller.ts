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
  Request,
  UseInterceptors,
  UploadedFile,
  Res,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { PpdbService } from './ppdb.service';
import { CreatePpdbRegistrationDto } from './dto/create-ppdb-registration.dto';
import { UpdatePpdbRegistrationDto } from './dto/update-ppdb-registration.dto';
import { VerifyDocumentDto, DocumentVerificationStatus } from './dto/verify-document.dto';
import { UploadPaymentDto, VerifyPaymentDto } from './dto/upload-payment.dto';
import { BulkUpdateStatusDto, BulkExportDto, BulkImportScoreDto, BulkSendNotificationDto } from './dto/bulk-operations.dto';
import { CreateInterviewScheduleDto, BookInterviewScheduleDto } from './dto/create-interview-schedule.dto';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { RegistrationStatus, PpdbRegistration } from './entities/ppdb-registration.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { StorageService } from '../storage/storage.service';

@Controller('ppdb')
export class PpdbController {
  constructor(
    private readonly ppdbService: PpdbService,
    private readonly storageService: StorageService,
  ) {}

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

  @Get('announcement/check')
  async checkAnnouncement(
    @Query('registrationNumber') registrationNumber?: string,
    @Query('nisn') nisn?: string, // Parameter name tetap nisn untuk backward compatibility, tapi bisa digunakan untuk NIK juga
    @TenantId() instansiId?: number,
  ) {
    if (!registrationNumber && !nisn) {
      throw new BadRequestException('Nomor pendaftaran atau NISN/NIK wajib diisi');
    }

    return this.ppdbService.findByRegistrationNumberOrNisn(
      registrationNumber,
      nisn,
      instansiId,
    );
  }

  @Get('announcement/statistics')
  async getAnnouncementStatistics(@TenantId() instansiId: number) {
    return this.ppdbService.getAnnouncementStatistics(instansiId);
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

  // Endpoint untuk pendaftar (ppdb_applicant)
  @UseGuards(JwtAuthGuard)
  @Get('my-registration')
  getMyRegistration(@Request() req, @TenantId() instansiId: number) {
    return this.ppdbService.findByUserId(req.user.userId, instansiId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('my-registration')
  createMyRegistration(
    @Request() req,
    @Body() createDto: CreatePpdbRegistrationDto,
    @TenantId() instansiId: number,
  ) {
    return this.ppdbService.createForApplicant(createDto, instansiId, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('my-registration')
  updateMyRegistration(
    @Request() req,
    @Body() updateDto: UpdatePpdbRegistrationDto,
    @TenantId() instansiId: number,
  ) {
    return this.ppdbService.updateByUserId(req.user.userId, updateDto, instansiId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('my-registration/upload-document')
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocument(
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
    @Body('documentType') documentType: string,
    @TenantId() instansiId: number,
  ) {
    if (!file) {
      throw new BadRequestException('File tidak ditemukan');
    }

    const uploadResult = await this.storageService.uploadFile(
      file,
      'ppdb-documents',
      instansiId,
    );

    // Update documents field di registration
    const registration = await this.ppdbService.findByUserId(req.user.userId, instansiId);
    if (!registration) {
      throw new NotFoundException('Pendaftaran tidak ditemukan');
    }

    const documents = registration.documents || {};
    documents[documentType] = {
      url: uploadResult.url,
      filename: uploadResult.filename,
      originalName: file.originalname,
      uploadedAt: new Date().toISOString(),
      verificationStatus: 'pending', // Default status saat upload
      verifiedBy: null,
      verifiedAt: null,
      rejectionReason: null,
    };

    return this.ppdbService.updateByUserId(
      req.user.userId,
      { documents },
      instansiId,
    );
  }

  @Post('registrations/:id/verify-document')
  async verifyDocument(
    @Param('id') id: string,
    @Body() verifyDto: VerifyDocumentDto,
    @Request() req,
    @TenantId() instansiId: number,
  ) {
    return this.ppdbService.verifyDocument(
      +id,
      verifyDto.documentType,
      verifyDto.status,
      instansiId,
      req.user.userId,
      verifyDto.rejectionReason,
    );
  }

  @Get('registrations/:id/certificate')
  async getCertificate(
    @Param('id') id: string,
    @TenantId() instansiId: number,
    @Res() res: Response,
  ) {
    const registration = await this.ppdbService.findOne(+id, instansiId);
    const certificate = await this.ppdbService.generateCertificate(registration);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Bukti-Pendaftaran-${registration.registrationNumber}.pdf"`);
    res.send(certificate);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-registration/certificate')
  async getMyCertificate(
    @Request() req,
    @TenantId() instansiId: number,
    @Res() res: Response,
  ) {
    const registration = await this.ppdbService.findByUserId(req.user.userId, instansiId);
    if (!registration) {
      throw new NotFoundException('Pendaftaran tidak ditemukan');
    }
    
    const certificate = await this.ppdbService.generateCertificate(registration);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Bukti-Pendaftaran-${registration.registrationNumber}.pdf"`);
    res.send(certificate);
  }

  @Post('registrations/:id/send-document-reminder')
  async sendDocumentReminder(
    @Param('id') id: string,
    @TenantId() instansiId: number,
  ) {
    const registration = await this.ppdbService.findOne(+id, instansiId);
    await this.ppdbService.sendDocumentReminder(registration);
    return { message: 'Reminder dokumen berhasil dikirim' };
  }

  @Post('announce-selection')
  async announceSelection(
    @Body() body: { registrationIds?: number[] },
    @TenantId() instansiId: number,
  ) {
    let registrations: PpdbRegistration[];
    
    if (body.registrationIds && body.registrationIds.length > 0) {
      registrations = await Promise.all(
        body.registrationIds.map(id => this.ppdbService.findOne(id, instansiId))
      );
    } else {
      // Get all registrations with accepted or rejected status
      const result = await this.ppdbService.findAll({
        instansiId,
        status: RegistrationStatus.ACCEPTED,
        page: 1,
        limit: 1000,
      });
      registrations = result.data;
      
      const rejectedResult = await this.ppdbService.findAll({
        instansiId,
        status: RegistrationStatus.REJECTED,
        page: 1,
        limit: 1000,
      });
      registrations = [...registrations, ...rejectedResult.data];
    }

    await this.ppdbService.sendSelectionAnnouncement(registrations, instansiId);
    return { 
      message: `Pengumuman seleksi berhasil dikirim ke ${registrations.length} pendaftar`,
      count: registrations.length,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('my-registration/upload-payment')
  @UseInterceptors(FileInterceptor('file'))
  async uploadPayment(
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadDto: UploadPaymentDto,
    @TenantId() instansiId: number,
  ) {
    if (!file) {
      throw new BadRequestException('File bukti pembayaran wajib diupload');
    }

    const uploadResult = await this.storageService.uploadFile(
      file,
      'ppdb-payments',
      instansiId,
    );

    const registration = await this.ppdbService.findByUserId(req.user.userId, instansiId);
    if (!registration) {
      throw new NotFoundException('Pendaftaran tidak ditemukan');
    }

    return this.ppdbService.uploadPaymentReceipt(
      registration.id,
      {
        receiptUrl: uploadResult.url,
        receiptFilename: uploadResult.filename,
        paymentAmount: uploadDto.paymentAmount,
        paymentMethod: uploadDto.paymentMethod || 'transfer',
        paymentReference: uploadDto.paymentReference,
        notes: uploadDto.notes,
      },
      instansiId,
    );
  }

  @Post('registrations/:id/verify-payment')
  async verifyPayment(
    @Param('id') id: string,
    @Body() verifyDto: VerifyPaymentDto,
    @Request() req,
    @TenantId() instansiId: number,
  ) {
    return this.ppdbService.verifyPayment(
      +id,
      verifyDto.status,
      instansiId,
      req.user.userId,
      verifyDto.rejectionReason,
    );
  }

  // ========== INTERVIEW SCHEDULE ENDPOINTS ==========

  @Post('interview-schedules')
  async createInterviewSchedule(
    @Body() createDto: CreateInterviewScheduleDto,
    @Request() req,
    @TenantId() instansiId: number,
  ) {
    return this.ppdbService.createInterviewSchedule(
      createDto,
      instansiId,
      req.user.userId,
    );
  }

  @Get('interview-schedules')
  async findAllInterviewSchedules(
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('status') status?: string,
    @TenantId() instansiId?: number,
  ) {
    const filters: any = {};
    if (dateFrom) filters.dateFrom = new Date(dateFrom);
    if (dateTo) filters.dateTo = new Date(dateTo);
    if (status) filters.status = status;

    return this.ppdbService.findAllInterviewSchedules(instansiId!, filters);
  }

  @Get('interview-schedules/available')
  async getAvailableSchedules(@TenantId() instansiId: number) {
    return this.ppdbService.findAvailableSchedules(instansiId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('my-registration/book-interview')
  async bookInterview(
    @Request() req,
    @Body() bookDto: BookInterviewScheduleDto,
    @TenantId() instansiId: number,
  ) {
    const registration = await this.ppdbService.findByUserId(req.user.userId, instansiId);
    if (!registration) {
      throw new NotFoundException('Pendaftaran tidak ditemukan');
    }

    return this.ppdbService.bookInterviewSchedule(
      bookDto.scheduleId,
      registration.id,
      instansiId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-registration/interview-schedule')
  async getMyInterviewSchedule(
    @Request() req,
    @TenantId() instansiId: number,
  ) {
    const registration = await this.ppdbService.findByUserId(req.user.userId, instansiId);
    if (!registration) {
      throw new NotFoundException('Pendaftaran tidak ditemukan');
    }

    return this.ppdbService.getMyInterviewSchedule(registration.id, instansiId);
  }

  @Delete('interview-schedules/:id')
  async cancelInterviewSchedule(
    @Param('id') id: string,
    @TenantId() instansiId: number,
  ) {
    return this.ppdbService.cancelInterviewSchedule(+id, instansiId);
  }

  @Get('analytics')
  async getAnalytics(
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @TenantId() instansiId?: number,
  ) {
    const filters: any = {};
    if (dateFrom) filters.dateFrom = new Date(dateFrom);
    if (dateTo) filters.dateTo = new Date(dateTo);

    return this.ppdbService.getAnalytics(instansiId!, filters);
  }

  // ========== BULK OPERATIONS ENDPOINTS ==========

  @Post('bulk/update-status')
  async bulkUpdateStatus(
    @Body() bulkDto: BulkUpdateStatusDto,
    @TenantId() instansiId: number,
  ) {
    return this.ppdbService.bulkUpdateStatus(
      bulkDto.registrationIds,
      bulkDto.status,
      instansiId,
      bulkDto.notes,
    );
  }

  @Post('bulk/export')
  async bulkExport(
    @Body() exportDto: BulkExportDto,
    @TenantId() instansiId: number,
    @Res() res: Response,
  ) {
    const result = await this.ppdbService.bulkExport(exportDto, instansiId);
    
    if (exportDto.format === 'pdf') {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="ppdb-export-${Date.now()}.pdf"`);
      res.send(result);
    } else {
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="ppdb-export-${Date.now()}.xlsx"`);
      res.send(result);
    }
  }

  @Post('bulk/import-scores')
  async bulkImportScores(
    @Body() importDto: BulkImportScoreDto,
    @TenantId() instansiId: number,
  ) {
    return this.ppdbService.bulkImportScores(importDto.scores, instansiId);
  }

  @Post('bulk/send-notification')
  async bulkSendNotification(
    @Body() notificationDto: BulkSendNotificationDto,
    @TenantId() instansiId: number,
  ) {
    return this.ppdbService.bulkSendNotification(
      notificationDto.registrationIds,
      notificationDto.subject,
      notificationDto.message,
      instansiId,
    );
  }

  // ========== STUDENT TRANSFER ENDPOINTS ==========

  @UseGuards(JwtAuthGuard)
  @Get('search-student')
  async searchStudentFromOtherTenant(
    @Query('nisn') nisn: string,
    @Query('sourceTenantNpsn') sourceTenantNpsn: string,
    @TenantId() instansiId: number,
  ) {
    if (!nisn || !sourceTenantNpsn) {
      throw new BadRequestException('NISN dan NPSN tenant sumber wajib diisi');
    }

    return this.ppdbService.searchStudentFromOtherTenant(
      nisn,
      sourceTenantNpsn,
      instansiId,
    );
  }
}

