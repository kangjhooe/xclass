import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Tenant } from '../../tenant/entities/tenant.entity';
import { User } from '../../users/entities/user.entity';

export enum NpsnChangeRequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('npsn_change_requests')
export class NpsnChangeRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  tenantId: number;

  @Column()
  currentNpsn: string;

  @Column()
  requestedNpsn: string;

  @Column({ type: 'text', nullable: true })
  reason: string;

  @Column({
    type: 'enum',
    enum: NpsnChangeRequestStatus,
    default: NpsnChangeRequestStatus.PENDING,
  })
  status: NpsnChangeRequestStatus;

  @Column({ nullable: true })
  requestedById: number;

  @Column({ nullable: true })
  reviewedById: number;

  @Column({ type: 'text', nullable: true })
  reviewNote: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'requested_by_id' })
  requestedBy: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'reviewed_by_id' })
  reviewedBy: User;
}

