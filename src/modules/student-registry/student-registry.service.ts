import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from '../students/entities/student.entity';
import { RegistrySnapshot } from './entities/registry-snapshot.entity';
import { GenerateRegistryDto, BatchGenerateRegistryDto } from './dto/generate-registry.dto';
import { PdfGeneratorService } from './services/pdf-generator.service';
import { DataAggregatorService } from './services/data-aggregator.service';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

@Injectable()
export class StudentRegistryService {
  private readonly logger = new Logger(StudentRegistryService.name);

  constructor(
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    @InjectRepository(RegistrySnapshot)
    private snapshotRepository: Repository<RegistrySnapshot>,
    private dataAggregatorService: DataAggregatorService,
    private pdfGeneratorService: PdfGeneratorService,
  ) {}

  /**
   * Generate buku induk untuk satu siswa berdasarkan NIK
   */
  async generateRegistry(
    dto: GenerateRegistryDto,
    instansiId: number,
    generatedBy?: string,
    generatedById?: number,
  ) {
    // Find student by NIK
    const student = await this.studentRepository.findOne({
      where: { nik: dto.nik, instansiId },
    });

    if (!student) {
      throw new NotFoundException(`Siswa dengan NIK ${dto.nik} tidak ditemukan`);
    }

    // Aggregate all data
    const registryData = await this.dataAggregatorService.aggregateStudentData(
      student.id,
      instansiId,
      {
        academicYear: dto.academicYear,
        categories: dto.categories,
      },
    );

    // Generate PDF if format is PDF or not specified
    if (!dto.format || dto.format === 'pdf') {
      const pdfBuffer = await this.pdfGeneratorService.generateRegistryPDF(
        registryData,
        {
          includeSignature: dto.includeSignature,
          signatureId: dto.signatureId,
        },
      );

      // Save snapshot
      const snapshot = await this.saveSnapshot(
        student,
        instansiId,
        registryData,
        pdfBuffer,
        dto.academicYear || registryData.student.academicYear,
        generatedBy,
        generatedById,
        dto.includeSignature,
        dto.signatureId,
      );

      return {
        success: true,
        student: {
          id: student.id,
          nik: student.nik,
          nisn: student.nisn,
          name: student.name,
        },
        snapshot: {
          id: snapshot.id,
          pdfUrl: snapshot.pdfUrl,
          fileHash: snapshot.fileHash,
          createdAt: snapshot.createdAt,
        },
        pdfBuffer,
        registryData: dto.format === 'json' ? registryData : undefined,
      };
    }

    // Return JSON or HTML format
    return {
      success: true,
      student: {
        id: student.id,
        nik: student.nik,
        nisn: student.nisn,
        name: student.name,
      },
      registryData,
      format: dto.format,
    };
  }

  /**
   * Batch generate buku induk untuk multiple siswa
   */
  async batchGenerateRegistry(
    dto: BatchGenerateRegistryDto,
    instansiId: number,
    generatedBy?: string,
    generatedById?: number,
  ) {
    const results = [];
    const errors = [];

    for (const nik of dto.niks) {
      try {
        const result = await this.generateRegistry(
          {
            nik,
            academicYear: dto.academicYear,
            includeSignature: dto.includeSignature,
            format: 'pdf',
          },
          instansiId,
          generatedBy,
          generatedById,
        );
        results.push({ nik, success: true, ...result });
      } catch (error) {
        this.logger.error(`Failed to generate registry for NIK ${nik}: ${error.message}`);
        errors.push({ nik, error: error.message });
      }
    }

    // If format is zip, create zip file with all PDFs
    if (dto.format === 'zip' && results.length > 0) {
      const AdmZip = require('adm-zip');
      const zip = new AdmZip();

      for (const result of results) {
        if (result.pdfBuffer) {
          const filename = `Buku_Induk_${result.student.nik}_${result.student.name.replace(/\s+/g, '_')}.pdf`;
          zip.addFile(filename, result.pdfBuffer);
        }
      }

      return {
        success: true,
        total: dto.niks.length,
        successCount: results.length,
        errorCount: errors.length,
        zipBuffer: zip.toBuffer(),
        results,
        errors,
      };
    }

    return {
      success: true,
      total: dto.niks.length,
      successCount: results.length,
      errorCount: errors.length,
      results,
      errors,
    };
  }

  /**
   * Get registry data (without generating PDF)
   */
  async getRegistryData(nik: string, instansiId: number, academicYear?: string) {
    const student = await this.studentRepository.findOne({
      where: { nik, instansiId },
    });

    if (!student) {
      throw new NotFoundException(`Siswa dengan NIK ${nik} tidak ditemukan`);
    }

    const registryData = await this.dataAggregatorService.aggregateStudentData(
      student.id,
      instansiId,
      { academicYear },
    );

    return registryData;
  }

  /**
   * Get registry snapshot by ID
   */
  async getSnapshot(snapshotId: number, instansiId: number) {
    const snapshot = await this.snapshotRepository.findOne({
      where: { id: snapshotId, instansiId },
      relations: ['student'],
    });

    if (!snapshot) {
      throw new NotFoundException('Snapshot tidak ditemukan');
    }

    return snapshot;
  }

  /**
   * Get all snapshots for a student
   */
  async getStudentSnapshots(nik: string, instansiId: number) {
    const student = await this.studentRepository.findOne({
      where: { nik, instansiId },
    });

    if (!student) {
      throw new NotFoundException(`Siswa dengan NIK ${nik} tidak ditemukan`);
    }

    const snapshots = await this.snapshotRepository.find({
      where: { studentId: student.id, instansiId },
      order: { createdAt: 'DESC' },
    });

    return snapshots;
  }

  /**
   * Get PDF buffer from snapshot
   */
  async getSnapshotPDF(snapshotId: number, instansiId: number): Promise<Buffer> {
    const snapshot = await this.getSnapshot(snapshotId, instansiId);

    if (!snapshot.pdfPath || !fs.existsSync(snapshot.pdfPath)) {
      throw new NotFoundException('File PDF tidak ditemukan');
    }

    return fs.readFileSync(snapshot.pdfPath);
  }

  /**
   * Save registry snapshot
   */
  private async saveSnapshot(
    student: Student,
    instansiId: number,
    registryData: any,
    pdfBuffer: Buffer,
    academicYear: string,
    generatedBy?: string,
    generatedById?: number,
    isSigned?: boolean,
    signatureId?: number,
  ): Promise<RegistrySnapshot> {
    // Create storage directory if not exists
    const storageDir = path.join(process.cwd(), 'storage', 'registry', instansiId.toString());
    if (!fs.existsSync(storageDir)) {
      fs.mkdirSync(storageDir, { recursive: true });
    }

    // Generate filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `registry_${student.nik}_${timestamp}.pdf`;
    const filepath = path.join(storageDir, filename);

    // Save PDF file
    fs.writeFileSync(filepath, pdfBuffer);

    // Calculate file hash
    const fileHash = crypto.createHash('sha256').update(pdfBuffer).digest('hex');

    // Generate URL (relative path)
    const pdfUrl = `/storage/registry/${instansiId}/${filename}`;

    // Create snapshot
    const snapshot = this.snapshotRepository.create({
      studentId: student.id,
      instansiId,
      nik: student.nik,
      nisn: student.nisn,
      academicYear,
      academicLevel: student.academicLevel,
      currentGrade: student.currentGrade,
      pdfPath: filepath,
      pdfUrl,
      registryData: JSON.stringify(registryData),
      generatedBy,
      generatedById,
      fileHash,
      isSigned: isSigned || false,
      signatureId,
    });

    return await this.snapshotRepository.save(snapshot);
  }

  /**
   * Delete snapshot
   */
  async deleteSnapshot(snapshotId: number, instansiId: number) {
    const snapshot = await this.getSnapshot(snapshotId, instansiId);

    // Delete PDF file
    if (snapshot.pdfPath && fs.existsSync(snapshot.pdfPath)) {
      fs.unlinkSync(snapshot.pdfPath);
    }

    await this.snapshotRepository.remove(snapshot);

    return { success: true, message: 'Snapshot berhasil dihapus' };
  }

  /**
   * Get statistics
   */
  async getStatistics(instansiId: number) {
    const totalSnapshots = await this.snapshotRepository.count({
      where: { instansiId },
    });

    const signedSnapshots = await this.snapshotRepository.count({
      where: { instansiId, isSigned: true },
    });

    const recentSnapshots = await this.snapshotRepository.find({
      where: { instansiId },
      order: { createdAt: 'DESC' },
      take: 10,
      relations: ['student'],
    });

    return {
      totalSnapshots,
      signedSnapshots,
      unsignedSnapshots: totalSnapshots - signedSnapshots,
      recentSnapshots: recentSnapshots.map((s) => ({
        id: s.id,
        studentName: s.student?.name,
        nik: s.nik,
        academicYear: s.academicYear,
        createdAt: s.createdAt,
        isSigned: s.isSigned,
      })),
    };
  }
}

