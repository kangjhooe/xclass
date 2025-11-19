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
import { PaymentMethod, PaymentStatus } from './spp-payment.entity';

export enum BillCategory {
  EXAM = 'exam',                    // Ujian
  ACTIVITY = 'activity',            // Kegiatan
  UNIFORM = 'uniform',              // Seragam
  BOOK = 'book',                    // Buku
  OSIS = 'osis',                    // Iuran OSIS
  PRACTICUM = 'practicum',          // Praktikum
  FIELD_TRIP = 'field_trip',        // Study Tour
  GRADUATION = 'graduation',        // Wisuda
  OTHER = 'other',                  // Lainnya
}

@Entity('other_bills')
export class OtherBill {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  studentId: number;

  @Column({
    type: 'enum',
    enum: BillCategory,
  })
  category: BillCategory;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

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

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  paymentStatus: PaymentStatus;

  @Column({ nullable: true })
  paymentReference: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

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

  @ManyToOne(() => Student, (student) => student.otherBills)
  @JoinColumn({ name: 'student_id' })
  student: Student;
}

