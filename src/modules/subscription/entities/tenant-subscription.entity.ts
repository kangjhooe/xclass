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
import { PaymentGatewayTransaction } from './payment-gateway-transaction.entity';

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

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  lockedPricePerStudent: number; // Harga locked saat subscription dibuat (untuk pricing lock)

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

  // Trial fields
  @Column({ type: 'boolean', default: false })
  isTrial: boolean;

  @Column({ type: 'date', nullable: true })
  trialStartDate: Date;

  @Column({ type: 'date', nullable: true })
  trialEndDate: Date;

  // Warning fields
  @Column({ type: 'boolean', default: false })
  warningSent: boolean;

  @Column({ type: 'date', nullable: true })
  warningSentAt: Date;

  // Grace period fields
  @Column({ type: 'date', nullable: true })
  gracePeriodEndDate: Date;

  @OneToMany(
    () => SubscriptionBillingHistory,
    (billing) => billing.tenantSubscription,
  )
  billingHistory: SubscriptionBillingHistory[];

  @OneToMany(
    () => PaymentGatewayTransaction,
    (payment) => payment.tenantSubscription,
  )
  paymentTransactions: PaymentGatewayTransaction[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

