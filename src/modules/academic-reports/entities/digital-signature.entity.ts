import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum SignatureType {
  HEADMASTER = 'headmaster',
  TEACHER = 'teacher',
  ADMIN = 'admin',
  COUNSELOR = 'counselor',
}

export enum SignatureStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  REVOKED = 'revoked',
}

@Entity('digital_signatures')
@Index(['userId', 'status'])
@Index(['instansiId', 'status'])
export class DigitalSignature {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  instansiId: number;

  @Column()
  userId: number;

  @Column()
  type: SignatureType;

  @Column()
  name: string; // Name to display with signature

  @Column({ type: 'text' })
  signatureImage: string; // Base64 encoded signature image or file path

  @Column({ type: 'text', nullable: true })
  signatureHash: string; // Hash for verification

  @Column({ default: SignatureStatus.ACTIVE })
  status: SignatureStatus;

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>; // Additional metadata

  @Column({ type: 'timestamp', nullable: true })
  validFrom: Date;

  @Column({ type: 'timestamp', nullable: true })
  validUntil: Date;

  @Column({ type: 'timestamp', nullable: true })
  revokedAt: Date;

  @Column({ type: 'text', nullable: true })
  revokeReason: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

