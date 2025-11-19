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

export enum SavingsTransactionType {
  DEPOSIT = 'deposit',      // Setoran
  WITHDRAWAL = 'withdrawal', // Penarikan
}

@Entity('student_savings')
export class StudentSavings {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  studentId: number;

  @Column({
    type: 'enum',
    enum: SavingsTransactionType,
  })
  transactionType: SavingsTransactionType;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  receiptNumber: string;

  @Column({ nullable: true })
  receiptFile: string;

  @Column({ nullable: true })
  createdBy: number;

  @Column()
  instansiId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Student, (student) => student.savings)
  @JoinColumn({ name: 'student_id' })
  student: Student;
}

