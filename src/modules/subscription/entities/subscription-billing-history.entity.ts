import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TenantSubscription } from './tenant-subscription.entity';
import { Tenant } from '../../tenant/entities/tenant.entity';

export enum BillingType {
  INITIAL = 'initial',
  RENEWAL = 'renewal',
  ADJUSTMENT = 'adjustment',
  THRESHOLD_MET = 'threshold_met',
}

@Entity('subscription_billing_history')
export class SubscriptionBillingHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  tenantSubscriptionId: number;

  @ManyToOne(() => TenantSubscription)
  @JoinColumn({ name: 'tenantSubscriptionId' })
  tenantSubscription: TenantSubscription;

  @Column()
  tenantId: number;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @Column({ type: 'int' })
  studentCount: number;

  @Column({ type: 'int', nullable: true })
  previousStudentCount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  billingAmount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  previousBillingAmount: number;

  @Column({
    type: 'enum',
    enum: BillingType,
    default: BillingType.RENEWAL,
  })
  billingType: BillingType;

  @Column({ type: 'int', default: 0 })
  pendingIncreaseBefore: number;

  @Column({ type: 'int', default: 0 })
  pendingIncreaseAfter: number;

  @Column({ type: 'boolean', default: false })
  thresholdTriggered: boolean;

  @Column({ type: 'date' })
  billingDate: Date;

  @Column({ type: 'date' })
  periodStart: Date;

  @Column({ type: 'date' })
  periodEnd: Date;

  @Column({ type: 'boolean', default: false })
  isPaid: boolean;

  @Column({ type: 'date', nullable: true })
  paidAt: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  invoiceNumber: string;

  @Column({ type: 'text', nullable: true })
  paymentNotes: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

