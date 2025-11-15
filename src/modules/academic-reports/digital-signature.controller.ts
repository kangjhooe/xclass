import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Request,
} from '@nestjs/common';
import { DigitalSignatureService } from './services/digital-signature.service';
import { PdfSignatureService } from './services/pdf-signature.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { SignatureType } from './entities/digital-signature.entity';
import { DocumentType } from './entities/signed-document.entity';

@Controller('academic-reports/digital-signature')
@UseGuards(JwtAuthGuard, TenantGuard)
export class DigitalSignatureController {
  constructor(
    private readonly signatureService: DigitalSignatureService,
    private readonly pdfService: PdfSignatureService,
  ) {}

  // Signature Management
  @Post('signatures')
  @UsePipes(new ValidationPipe({ transform: true }))
  async createSignature(
    @Request() req,
    @TenantId() instansiId: number,
    @Body() body: {
      type: SignatureType;
      name: string;
      signatureImage: string;
      validFrom?: string;
      validUntil?: string;
      metadata?: Record<string, any>;
    },
  ) {
    return this.signatureService.createSignature(instansiId, req.user.userId, {
      ...body,
      validFrom: body.validFrom ? new Date(body.validFrom) : undefined,
      validUntil: body.validUntil ? new Date(body.validUntil) : undefined,
    });
  }

  @Get('signatures')
  async getSignatures(
    @TenantId() instansiId: number,
    @Query('type') type?: SignatureType,
    @Query('userId') userId?: number,
  ) {
    if (userId) {
      return this.signatureService.getUserSignatures(instansiId, userId, type);
    }
    return this.signatureService.getSignatures(instansiId, type);
  }

  @Get('signatures/:id')
  async getSignature(@TenantId() instansiId: number, @Param('id') id: number) {
    const signatures = await this.signatureService.getSignatures(instansiId);
    return signatures.find((s) => s.id === id);
  }

  @Put('signatures/:id/revoke')
  @UsePipes(new ValidationPipe({ transform: true }))
  async revokeSignature(
    @TenantId() instansiId: number,
    @Param('id') id: number,
    @Body() body: { reason: string },
  ) {
    return this.signatureService.revokeSignature(instansiId, id, body.reason);
  }

  // Document Signing
  @Post('documents/sign')
  @UsePipes(new ValidationPipe({ transform: true }))
  async signDocument(
    @TenantId() instansiId: number,
    @Body() body: {
      studentId: number;
      signatureId: number;
      documentType: DocumentType;
      documentNumber: string;
      documentPath: string;
      signatureMetadata?: Record<string, any>;
      documentMetadata?: Record<string, any>;
    },
  ) {
    return this.signatureService.signDocument(instansiId, body.studentId, body.signatureId, {
      documentType: body.documentType,
      documentNumber: body.documentNumber,
      documentPath: body.documentPath,
      signatureMetadata: body.signatureMetadata,
      documentMetadata: body.documentMetadata,
    });
  }

  @Get('documents')
  async getSignedDocuments(
    @TenantId() instansiId: number,
    @Query('studentId') studentId?: number,
    @Query('documentType') documentType?: DocumentType,
    @Query('status') status?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.signatureService.getSignedDocuments(instansiId, {
      studentId: studentId ? +studentId : undefined,
      documentType,
      status: status as any,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
  }

  @Get('documents/:id/verify')
  async verifyDocument(@TenantId() instansiId: number, @Param('id') id: number) {
    return this.signatureService.verifyDocument(instansiId, id);
  }

  // PDF Operations
  @Post('pdf/embed-signature')
  @UsePipes(new ValidationPipe({ transform: true }))
  async embedSignature(
    @Body() body: {
      pdfPath: string;
      signatureId: number;
      x?: number;
      y?: number;
      width?: number;
      height?: number;
      page?: number;
    },
  ) {
    return this.pdfService.embedSignatureToPdf(body.pdfPath, body.signatureId, {
      x: body.x,
      y: body.y,
      width: body.width,
      height: body.height,
      page: body.page,
    });
  }

  @Post('pdf/generate-report-card')
  @UsePipes(new ValidationPipe({ transform: true }))
  async generateReportCard(
    @Body() body: {
      studentData: any;
      gradesData: any[];
      signatureId: number;
      outputPath: string;
    },
  ) {
    return this.pdfService.generateReportCardWithSignature(
      body.studentData,
      body.gradesData,
      body.signatureId,
      body.outputPath,
    );
  }
}

