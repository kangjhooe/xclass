import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Student } from '../../students/entities/student.entity';

export enum PaymentMethod {
  CASH = 'cash',
  TRANSFER = 'transfer',
  QRIS = 'qris',
  EDC = 'edc',
  VIRTUAL_ACCOUNT = 'virtual_account',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled',
}

@Entity('spp_payments')
export class SppPayment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  studentId: number;

  @Column()
  paymentPeriod: string;

  @Column()
  paymentYear: number;

  @Column()
  paymentMonth: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({ type: 'date' })
  dueDate: Date;

  @Column({ type: 'datetime', nullable: true })
  paidDate: Date;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
    nullable: true,
  })
  paymentMethod: PaymentMethod;

  @Column({ nullable: true })
  paymentReference: string;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  paymentStatus: PaymentStatus;

  @Column({ type: 'text', nullable: true })
  paymentNotes: string;

  @Column({ nullable: true })
  receiptNumber: string;

  @Column({ nullable: true })
  receiptFile: string;

  @Column({ nullable: true })
  createdBy: number;

  @Column({ nullable: true })
  verifiedBy: number;

  @Column({ type: 'datetime', nullable: true })
  verifiedAt: Date;

  @Column()
  instansiId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Student)
  @JoinColumn({ name: 'student_id' })
  student: Student;
}

