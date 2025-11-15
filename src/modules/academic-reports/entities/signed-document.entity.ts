import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { DigitalSignature } from './digital-signature.entity';
import { Student } from '../../students/entities/student.entity';

export enum DocumentType {
  REPORT_CARD = 'report_card',
  TRANSCRIPT = 'transcript',
  CERTIFICATE = 'certificate',
  LETTER = 'letter',
  OTHER = 'other',
}

export enum DocumentStatus {
  DRAFT = 'draft',
  SIGNED = 'signed',
  VERIFIED = 'verified',
  REVOKED = 'revoked',
}

@Entity('signed_documents')
@Index(['studentId', 'documentType'])
@Index(['instansiId', 'status'])
@Index(['signatureId'])
export class SignedDocument {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  instansiId: number;

  @Column()
  studentId: number;

  @Column()
  documentType: DocumentType;

  @Column({ type: 'varchar', length: 255 })
  documentNumber: string; // Unique document number

  @Column({ type: 'text' })
  documentPath: string; // Path to signed PDF file

  @Column({ type: 'text', nullable: true })
  documentHash: string; // Hash of document for verification

  @Column()
  signatureId: number;

  @Column({ default: DocumentStatus.DRAFT })
  status: DocumentStatus;

  @Column({ type: 'json', nullable: true })
  signatureMetadata: Record<string, any>; // Position, size, etc.

  @Column({ type: 'json', nullable: true })
  documentMetadata: Record<string, any>; // Additional document info

  @Column({ type: 'timestamp', nullable: true })
  signedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  verifiedAt: Date;

  @Column({ type: 'text', nullable: true })
  verificationHash: string; // Hash for verification

  @Column({ type: 'text', nullable: true })
  revokeReason: string;

  @Column({ type: 'timestamp', nullable: true })
  revokedAt: Date;

  @ManyToOne(() => Student)
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @ManyToOne(() => DigitalSignature)
  @JoinColumn({ name: 'signature_id' })
  signature: DigitalSignature;

  @CreateDateColumn()
  createdAt: Date;
}

