import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Tenant } from '../../tenant/entities/tenant.entity';
import { SubscriptionPlan } from './subscription-plan.entity';
import { SubscriptionBillingHistory } from './subscription-billing-history.entity';

export enum SubscriptionStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  SUSPENDED = 'suspended',
  CANCELLED = 'cancelled',
}

export enum BillingCycle {
  YEARLY = 'yearly',
  MONTHLY = 'monthly',
}

@Entity('tenant_subscriptions')
export class TenantSubscription {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  tenantId: number;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @Column()
  subscriptionPlanId: number;

  @ManyToOne(() => SubscriptionPlan)
  @JoinColumn({ name: 'subscriptionPlanId' })
  subscriptionPlan: SubscriptionPlan;

  @Column({ type: 'int', default: 0 })
  studentCountAtBilling: number;

  @Column({ type: 'int', default: 0 })
  currentStudentCount: number;

  @Column({ type: 'int', default: 0 })
  pendingStudentIncrease: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  currentBillingAmount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  nextBillingAmount: number;

  @Column({ type: 'enum', enum: BillingCycle, default: BillingCycle.YEARLY })
  billingCycle: BillingCycle;

  @Column({
    type: 'enum',
    enum: SubscriptionStatus,
    default: SubscriptionStatus.ACTIVE,
  })
  status: SubscriptionStatus;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date' })
  endDate: Date;

  @Column({ type: 'date', nullable: true })
  nextBillingDate: Date;

  @Column({ type: 'date', nullable: true })
  lastBillingDate: Date;

  @Column({ type: 'boolean', default: false })
  isPaid: boolean;

  @Column({ type: 'date', nullable: true })
  paidAt: Date;

  @Column({ type: 'text', nullable: true })
  paymentNotes: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @OneToMany(
    () => SubscriptionBillingHistory,
    (billing) => billing.tenantSubscription,
  )
  billingHistory: SubscriptionBillingHistory[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

