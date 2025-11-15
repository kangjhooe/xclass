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

export enum PaymentGatewayProvider {
  XENDIT = 'xendit',
}

export enum PaymentGatewayMethod {
  QRIS = 'qris',
  VIRTUAL_ACCOUNT = 'virtual_account',
  E_WALLET = 'e_wallet',
}

export enum PaymentGatewayStatus {
  PENDING = 'pending',
  PAID = 'paid',
  EXPIRED = 'expired',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

@Entity('payment_gateway_transactions')
export class PaymentGatewayTransaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  tenantSubscriptionId: number;

  @ManyToOne(() => TenantSubscription)
  @JoinColumn({ name: 'tenantSubscriptionId' })
  tenantSubscription: TenantSubscription;

  @Column()
  tenantId: number;

  @Column({
    type: 'enum',
    enum: PaymentGatewayProvider,
    default: PaymentGatewayProvider.XENDIT,
  })
  provider: PaymentGatewayProvider;

  @Column({
    type: 'enum',
    enum: PaymentGatewayMethod,
  })
  paymentMethod: PaymentGatewayMethod;

  @Column({
    type: 'enum',
    enum: PaymentGatewayStatus,
    default: PaymentGatewayStatus.PENDING,
  })
  status: PaymentGatewayStatus;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ nullable: true })
  externalId: string; // Xendit invoice ID atau payment ID

  @Column({ type: 'text', nullable: true })
  paymentUrl: string; // URL untuk redirect user ke payment page

  @Column({ type: 'text', nullable: true })
  qrCode: string; // QR Code untuk QRIS

  @Column({ type: 'text', nullable: true })
  virtualAccountNumber: string; // Nomor VA untuk Virtual Account

  @Column({ type: 'text', nullable: true })
  eWalletId: string; // ID untuk E-Wallet

  @Column({ type: 'datetime', nullable: true })
  expiresAt: Date;

  @Column({ type: 'datetime', nullable: true })
  paidAt: Date;

  @Column({ type: 'text', nullable: true })
  failureReason: string;

  @Column({ type: 'text', nullable: true })
  metadata: string; // JSON string untuk menyimpan data tambahan

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

