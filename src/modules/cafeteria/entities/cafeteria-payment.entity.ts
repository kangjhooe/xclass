import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CafeteriaOrder } from './cafeteria-order.entity';

@Entity('cafeteria_payments')
export class CafeteriaPayment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  orderId: number;

  @Column({
    type: 'enum',
    enum: ['cash', 'card', 'transfer', 'qris'],
  })
  paymentMethod: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  paymentAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  changeAmount: number;

  @Column({ nullable: true })
  paymentReference: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending',
  })
  paymentStatus: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => CafeteriaOrder, (order) => order.payments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'order_id' })
  order: CafeteriaOrder;
}

