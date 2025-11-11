import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Tenant } from '../../tenant/entities/tenant.entity';
import { User } from '../../users/entities/user.entity';

export enum TenantAccessStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  REVOKED = 'revoked',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}

@Entity('tenant_access_requests')
@Index(['tenantId', 'superAdminId', 'status'])
export class TenantAccessRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'tenant_id' })
  tenantId: number;

  @ManyToOne(() => Tenant, { eager: true })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ name: 'super_admin_id' })
  superAdminId: number;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'super_admin_id' })
  superAdmin: User;

  @Column({
    type: 'enum',
    enum: TenantAccessStatus,
    default: TenantAccessStatus.PENDING,
  })
  status: TenantAccessStatus;

  @Column({ type: 'datetime', name: 'requested_at' })
  requestedAt: Date;

  @Column({ type: 'datetime', name: 'approved_at', nullable: true })
  approvedAt?: Date | null;

  @Column({ name: 'approved_by', nullable: true })
  approvedBy?: number | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'approved_by' })
  approvedByUser?: User | null;

  @Column({ type: 'datetime', name: 'expires_at', nullable: true })
  expiresAt?: Date | null;

  @Column({ type: 'datetime', name: 'revoked_at', nullable: true })
  revokedAt?: Date | null;

  @Column({ name: 'revoked_by', nullable: true })
  revokedBy?: number | null;

  @Column({ type: 'text', nullable: true })
  reason?: string | null;

  @Column({ type: 'text', name: 'response_note', nullable: true })
  responseNote?: string | null;

  @Column({ type: 'text', name: 'rejection_reason', nullable: true })
  rejectionReason?: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

