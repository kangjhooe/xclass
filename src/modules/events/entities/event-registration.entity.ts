import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Event } from './event.entity';
import { Student } from '../../students/entities/student.entity';
import { Teacher } from '../../teachers/entities/teacher.entity';
import { IncomeExpense } from '../../finance/entities/income-expense.entity';

export enum RegistrationStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  ATTENDED = 'attended',
  NO_SHOW = 'no_show',
}

@Entity('event_registrations')
export class EventRegistration {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  eventId: number;

  @Column({ nullable: true })
  studentId: number;

  @Column({ nullable: true })
  parentId: number;

  @Column({ nullable: true })
  teacherId: number;

  @Column({ nullable: true })
  staffId: number;

  @Column({ type: 'datetime' })
  registrationDate: Date;

  @Column({
    type: 'enum',
    enum: RegistrationStatus,
    default: RegistrationStatus.PENDING,
  })
  status: RegistrationStatus;

  @Column({ default: false })
  paymentStatus: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  paymentAmount: number;

  @Column({ nullable: true })
  paymentReceipt: string;

  @Column({ nullable: true })
  incomeExpenseId: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ nullable: true })
  createdBy: number;

  @Column()
  instansiId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Event, (event) => event.registrations)
  @JoinColumn({ name: 'event_id' })
  event: Event;

  @ManyToOne(() => Student, (student) => student.eventRegistrations, { nullable: true })
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @ManyToOne(() => Teacher, (teacher) => teacher.eventRegistrations, { nullable: true })
  @JoinColumn({ name: 'teacher_id' })
  teacher: Teacher;

  @ManyToOne(() => IncomeExpense, { nullable: true })
  @JoinColumn({ name: 'income_expense_id' })
  incomeExpense: IncomeExpense;
}

