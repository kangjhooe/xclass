import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum BackupType {
  FULL = 'full',
  DATABASE = 'database',
  FILES = 'files',
  TENANT = 'tenant',
}

export enum BackupStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

@Entity('backups')
export class Backup {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'enum', enum: BackupType, default: BackupType.FULL })
  type: BackupType;

  @Column({ type: 'enum', enum: BackupStatus, default: BackupStatus.PENDING })
  status: BackupStatus;

  @Column({ type: 'varchar', length: 500, nullable: true })
  filePath: string;

  @Column({ type: 'bigint', nullable: true })
  fileSize: number; // in bytes

  @Column({ type: 'int', nullable: true })
  tenantId: number; // null untuk backup global

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

