import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DigitalSignature, SignatureType, SignatureStatus } from '../entities/digital-signature.entity';
import { SignedDocument, DocumentType, DocumentStatus } from '../entities/signed-document.entity';
import { User } from '../../users/entities/user.entity';
import { Student } from '../../students/entities/student.entity';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class DigitalSignatureService {
  private readonly logger = new Logger(DigitalSignatureService.name);

  constructor(
    @InjectRepository(DigitalSignature)
    private signatureRepository: Repository<DigitalSignature>,
    @InjectRepository(SignedDocument)
    private documentRepository: Repository<SignedDocument>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
  ) {}

  /**
   * Create or update digital signature
   */
  async createSignature(
    instansiId: number,
    userId: number,
    data: {
      type: SignatureType;
      name: string;
      signatureImage: string; // Base64 or file path
      validFrom?: Date;
      validUntil?: Date;
      metadata?: Record<string, any>;
    },
  ): Promise<DigitalSignature> {
    // Verify user exists
    const user = await this.userRepository.findOne({
      where: { id: userId, instansiId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user already has active signature of this type
    const existing = await this.signatureRepository.findOne({
      where: {
        instansiId,
        userId,
        type: data.type,
        status: SignatureStatus.ACTIVE,
      },
    });

    // Generate hash for verification
    const signatureHash = this.generateHash(data.signatureImage);

    if (existing) {
      // Update existing
      existing.name = data.name;
      existing.signatureImage = data.signatureImage;
      existing.signatureHash = signatureHash;
      existing.validFrom = data.validFrom;
      existing.validUntil = data.validUntil;
      existing.metadata = data.metadata;
      return await this.signatureRepository.save(existing);
    }

    // Create new
    const signature = this.signatureRepository.create({
      instansiId,
      userId,
      type: data.type,
      name: data.name,
      signatureImage: data.signatureImage,
      signatureHash,
      status: SignatureStatus.ACTIVE,
      validFrom: data.validFrom || new Date(),
      validUntil: data.validUntil,
      metadata: data.metadata,
    });

    return await this.signatureRepository.save(signature);
  }

  /**
   * Get signatures for a user
   */
  async getUserSignatures(
    instansiId: number,
    userId: number,
    type?: SignatureType,
  ): Promise<DigitalSignature[]> {
    const query = this.signatureRepository
      .createQueryBuilder('signature')
      .where('signature.instansiId = :instansiId', { instansiId })
      .andWhere('signature.userId = :userId', { userId });

    if (type) {
      query.andWhere('signature.type = :type', { type });
    }

    return await query
      .andWhere('signature.status = :status', { status: SignatureStatus.ACTIVE })
      .orderBy('signature.createdAt', 'DESC')
      .getMany();
  }

  /**
   * Get all signatures for tenant
   */
  async getSignatures(instansiId: number, type?: SignatureType): Promise<DigitalSignature[]> {
    const query = this.signatureRepository
      .createQueryBuilder('signature')
      .where('signature.instansiId = :instansiId', { instansiId })
      .leftJoinAndSelect('signature.user', 'user');

    if (type) {
      query.andWhere('signature.type = :type', { type });
    }

    return await query
      .andWhere('signature.status = :status', { status: SignatureStatus.ACTIVE })
      .orderBy('signature.createdAt', 'DESC')
      .getMany();
  }

  /**
   * Revoke signature
   */
  async revokeSignature(
    instansiId: number,
    signatureId: number,
    reason: string,
  ): Promise<DigitalSignature> {
    const signature = await this.signatureRepository.findOne({
      where: { id: signatureId, instansiId },
    });

    if (!signature) {
      throw new NotFoundException('Signature not found');
    }

    signature.status = SignatureStatus.REVOKED;
    signature.revokedAt = new Date();
    signature.revokeReason = reason;

    return await this.signatureRepository.save(signature);
  }

  /**
   * Sign a document
   */
  async signDocument(
    instansiId: number,
    studentId: number,
    signatureId: number,
    data: {
      documentType: DocumentType;
      documentNumber: string;
      documentPath: string;
      signatureMetadata?: Record<string, any>;
      documentMetadata?: Record<string, any>;
    },
  ): Promise<SignedDocument> {
    // Verify student exists
    const student = await this.studentRepository.findOne({
      where: { id: studentId, instansiId },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    // Verify signature exists and is active
    const signature = await this.signatureRepository.findOne({
      where: { id: signatureId, instansiId, status: SignatureStatus.ACTIVE },
    });

    if (!signature) {
      throw new NotFoundException('Signature not found or inactive');
    }

    // Check if signature is still valid
    const now = new Date();
    if (signature.validUntil && now > signature.validUntil) {
      throw new Error('Signature has expired');
    }

    if (signature.validFrom && now < signature.validFrom) {
      throw new Error('Signature is not yet valid');
    }

    // Generate document hash
    const documentHash = await this.generateDocumentHash(data.documentPath);

    // Create signed document record
    const signedDocument = this.documentRepository.create({
      instansiId,
      studentId,
      documentType: data.documentType,
      documentNumber: data.documentNumber,
      documentPath: data.documentPath,
      documentHash,
      signatureId,
      status: DocumentStatus.SIGNED,
      signatureMetadata: data.signatureMetadata,
      documentMetadata: data.documentMetadata,
      signedAt: new Date(),
    });

    return await this.documentRepository.save(signedDocument);
  }

  /**
   * Verify document authenticity
   */
  async verifyDocument(
    instansiId: number,
    documentId: number,
  ): Promise<{
    isValid: boolean;
    document: SignedDocument;
    signature: DigitalSignature;
    verificationHash: string;
    message: string;
  }> {
    const document = await this.documentRepository.findOne({
      where: { id: documentId, instansiId },
      relations: ['signature', 'student'],
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    // Verify document hash
    const currentHash = await this.generateDocumentHash(document.documentPath);
    const hashMatches = currentHash === document.documentHash;

    // Verify signature is still valid
    const signatureValid =
      document.signature.status === SignatureStatus.ACTIVE &&
      (!document.signature.validUntil || new Date() <= document.signature.validUntil) &&
      (!document.signature.validFrom || new Date() >= document.signature.validFrom);

    // Verify document status
    const statusValid = document.status === DocumentStatus.SIGNED || document.status === DocumentStatus.VERIFIED;

    const isValid = hashMatches && signatureValid && statusValid;

    // Generate verification hash
    const verificationHash = this.generateVerificationHash(document, document.signature);

    // Update verification status
    if (isValid && document.status === DocumentStatus.SIGNED) {
      document.status = DocumentStatus.VERIFIED;
      document.verifiedAt = new Date();
      document.verificationHash = verificationHash;
      await this.documentRepository.save(document);
    }

    return {
      isValid,
      document,
      signature: document.signature,
      verificationHash,
      message: isValid
        ? 'Document is authentic and valid'
        : hashMatches
          ? 'Document hash matches but signature is invalid'
          : 'Document hash does not match - document may have been tampered with',
    };
  }

  /**
   * Get signed documents
   */
  async getSignedDocuments(
    instansiId: number,
    filters?: {
      studentId?: number;
      documentType?: DocumentType;
      status?: DocumentStatus;
      startDate?: Date;
      endDate?: Date;
    },
  ): Promise<SignedDocument[]> {
    const query = this.documentRepository
      .createQueryBuilder('document')
      .where('document.instansiId = :instansiId', { instansiId })
      .leftJoinAndSelect('document.student', 'student')
      .leftJoinAndSelect('document.signature', 'signature')
      .leftJoinAndSelect('signature.user', 'user');

    if (filters?.studentId) {
      query.andWhere('document.studentId = :studentId', { studentId: filters.studentId });
    }

    if (filters?.documentType) {
      query.andWhere('document.documentType = :documentType', { documentType: filters.documentType });
    }

    if (filters?.status) {
      query.andWhere('document.status = :status', { status: filters.status });
    }

    if (filters?.startDate) {
      query.andWhere('document.signedAt >= :startDate', { startDate: filters.startDate });
    }

    if (filters?.endDate) {
      query.andWhere('document.signedAt <= :endDate', { endDate: filters.endDate });
    }

    return await query.orderBy('document.signedAt', 'DESC').getMany();
  }

  /**
   * Generate hash for signature image
   */
  private generateHash(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Generate hash for document file
   */
  private async generateDocumentHash(filePath: string): Promise<string> {
    try {
      const fileBuffer = fs.readFileSync(filePath);
      return crypto.createHash('sha256').update(fileBuffer).digest('hex');
    } catch (error) {
      this.logger.error(`Failed to generate document hash: ${error.message}`);
      return '';
    }
  }

  /**
   * Generate verification hash
   */
  private generateVerificationHash(document: SignedDocument, signature: DigitalSignature): string {
    const data = `${document.id}-${document.documentHash}-${signature.signatureHash}-${document.signedAt}`;
    return crypto.createHash('sha256').update(data).digest('hex');
  }
}

