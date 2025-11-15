import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DigitalSignature } from '../entities/digital-signature.entity';
import * as PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

@Injectable()
export class PdfSignatureService {
  private readonly logger = new Logger(PdfSignatureService.name);

  constructor(
    @InjectRepository(DigitalSignature)
    private signatureRepository: Repository<DigitalSignature>,
  ) {}

  /**
   * Embed signature into PDF document
   */
  async embedSignatureToPdf(
    pdfPath: string,
    signatureId: number,
    options: {
      x?: number; // X position (default: right side)
      y?: number; // Y position (default: bottom)
      width?: number; // Signature width
      height?: number; // Signature height
      page?: number; // Page number (default: last page)
    } = {},
  ): Promise<string> {
    const signature = await this.signatureRepository.findOne({
      where: { id: signatureId },
    });

    if (!signature) {
      throw new Error('Signature not found');
    }

    // For now, we'll use a simple approach
    // In production, you might want to use pdf-lib or similar library
    // that supports better PDF manipulation

    const outputPath = pdfPath.replace('.pdf', '_signed.pdf');

    try {
      // Read existing PDF
      const pdfBuffer = fs.readFileSync(pdfPath);

      // Decode signature image (assuming base64)
      let signatureImageBuffer: Buffer;
      if (signature.signatureImage.startsWith('data:image')) {
        // Base64 data URL
        const base64Data = signature.signatureImage.split(',')[1];
        signatureImageBuffer = Buffer.from(base64Data, 'base64');
      } else if (fs.existsSync(signature.signatureImage)) {
        // File path
        signatureImageBuffer = fs.readFileSync(signature.signatureImage);
      } else {
        throw new Error('Invalid signature image format');
      }

      // Create new PDF with signature
      const doc = new PDFDocument({ size: 'A4' });

      // Write existing PDF content (simplified - in production use pdf-lib)
      // For now, we'll create a new PDF with signature overlay
      const outputStream = fs.createWriteStream(outputPath);
      doc.pipe(outputStream);

      // Add signature image
      const x = options.x || 400;
      const y = options.y || 50;
      const width = options.width || 150;
      const height = options.height || 50;

      doc.image(signatureImageBuffer, x, y, {
        width,
        height,
      });

      // Add signature metadata
      doc.fontSize(10).text(`Signed by: ${signature.name}`, x, y + height + 5);
      doc.text(`Date: ${new Date().toLocaleDateString('id-ID')}`, x, y + height + 20);
      doc.text(`Signature Hash: ${signature.signatureHash?.substring(0, 16)}...`, x, y + height + 35);

      doc.end();

      return new Promise((resolve, reject) => {
        outputStream.on('finish', () => {
          resolve(outputPath);
        });
        outputStream.on('error', reject);
      });
    } catch (error) {
      this.logger.error(`Failed to embed signature: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * Generate PDF report card with signature
   */
  async generateReportCardWithSignature(
    studentData: any,
    gradesData: any[],
    signatureId: number,
    outputPath: string,
  ): Promise<string> {
    const signature = await this.signatureRepository.findOne({
      where: { id: signatureId },
    });

    if (!signature) {
      throw new Error('Signature not found');
    }

    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    // Header
    doc.fontSize(20).text('RAPOR SISWA', { align: 'center' });
    doc.moveDown();

    // Student Info
    doc.fontSize(12);
    doc.text(`Nama: ${studentData.name}`);
    doc.text(`NISN: ${studentData.nisn || '-'}`);
    doc.text(`Kelas: ${studentData.className || '-'}`);
    doc.moveDown();

    // Grades Table
    doc.fontSize(10);
    let y = doc.y;
    doc.text('Mata Pelajaran', 50, y);
    doc.text('Nilai', 300, y);
    doc.text('Keterangan', 400, y);
    doc.moveDown();

    gradesData.forEach((grade) => {
      doc.text(grade.subjectName || '-', 50);
      doc.text(grade.score?.toString() || '-', 300);
      doc.text(grade.description || '-', 400);
      doc.moveDown();
    });

    // Signature section
    const signatureY = doc.page.height - 150;
    const signatureX = doc.page.width - 250;

    // Decode signature image
    let signatureImageBuffer: Buffer;
    if (signature.signatureImage.startsWith('data:image')) {
      const base64Data = signature.signatureImage.split(',')[1];
      signatureImageBuffer = Buffer.from(base64Data, 'base64');
    } else if (fs.existsSync(signature.signatureImage)) {
      signatureImageBuffer = fs.readFileSync(signature.signatureImage);
    } else {
      throw new Error('Invalid signature image format');
    }

    // Add signature
    doc.image(signatureImageBuffer, signatureX, signatureY, {
      width: 150,
      height: 50,
    });

    // Add signature info
    doc.fontSize(10).text(`Signed by: ${signature.name}`, signatureX, signatureY + 60);
    doc.text(`Date: ${new Date().toLocaleDateString('id-ID')}`, signatureX, signatureY + 75);
    doc.text(`Hash: ${signature.signatureHash?.substring(0, 16)}...`, signatureX, signatureY + 90);

    doc.end();

    return new Promise((resolve, reject) => {
      stream.on('finish', () => {
        resolve(outputPath);
      });
      stream.on('error', reject);
    });
  }
}

