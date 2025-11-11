import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

export enum AuditAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  RESTORE = 'restore',
  EXPORT = 'export',
  IMPORT = 'import',
  LOGIN = 'login',
  LOGOUT = 'logout',
  PERMISSION_CHANGE = 'permission_change',
  STATUS_CHANGE = 'status_change',
}

export enum AuditStatus {
  SUCCESS = 'success',
  FAILED = 'failed',
  PENDING = 'pending',
}

@Entity('audit_trails')
@Index(['tenantId', 'createdAt'])
@Index(['userId', 'createdAt'])
@Index(['entityType', 'entityId'])
@Index(['action', 'createdAt'])
@Index(['status', 'createdAt'])
export class AuditTrail {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  tenantId: number;

  @Column()
  userId: number;

  @Column({ nullable: true })
  userName: string; // Cache username for faster queries

  @Column()
  entityType: string; // Model class name (e.g., 'Student', 'Teacher', 'User')

  @Column({ nullable: true })
  entityId: number; // ID of the affected entity

  @Column()
  action: AuditAction;

  @Column({ default: AuditStatus.SUCCESS })
  status: AuditStatus;

  // Detailed changes: field-by-field tracking
  @Column({ type: 'json', nullable: true })
  changes: {
    field: string;
    oldValue: any;
    newValue: any;
    dataType?: string;
  }[];

  // Full snapshot of entity before change (for restore)
  @Column({ type: 'json', nullable: true })
  beforeSnapshot: Record<string, any>;

  // Full snapshot of entity after change
  @Column({ type: 'json', nullable: true })
  afterSnapshot: Record<string, any>;

  // Additional metadata
  @Column({ type: 'json', nullable: true })
  metadata: {
    ipAddress?: string;
    userAgent?: string;
    requestId?: string;
    endpoint?: string;
    method?: string;
    duration?: number; // Request duration in ms
    errorMessage?: string;
    [key: string]: any;
  };

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  reason: string; // Optional reason for the change

  @CreateDateColumn()
  createdAt: Date;
}

