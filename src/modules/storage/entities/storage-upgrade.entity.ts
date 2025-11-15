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
import { TenantSubscription } from '../../subscription/entities/tenant-subscription.entity';

export enum StorageUpgradeType {
  PACKAGE = 'package',
  CUSTOM = 'custom',
}

export enum StorageUpgradeStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}

@Entity('storage_upgrades')
export class StorageUpgrade {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  tenantId: number;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @Column({ nullable: true })
  tenantSubscriptionId: number;

  @ManyToOne(() => TenantSubscription, { nullable: true })
  @JoinColumn({ name: 'tenantSubscriptionId' })
  tenantSubscription: TenantSubscription;

  @Column({ type: 'enum', enum: StorageUpgradeType })
  upgradeType: StorageUpgradeType;

  @Column({ type: 'int', comment: 'Additional storage in GB' })
  additionalStorageGB: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, comment: 'Price per year' })
  pricePerYear: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, comment: 'Pro-rated price for remaining period' })
  proRatedPrice: number;

  @Column({ type: 'enum', enum: StorageUpgradeStatus, default: StorageUpgradeStatus.PENDING })
  status: StorageUpgradeStatus;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date' })
  endDate: Date;

  @Column({ type: 'boolean', default: false })
  isPaid: boolean;

  @Column({ type: 'date', nullable: true })
  paidAt: Date;

  @Column({ type: 'text', nullable: true })
  paymentNotes: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

