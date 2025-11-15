import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Book } from './book.entity';
import { Student } from '../../students/entities/student.entity';
import { Teacher } from '../../teachers/entities/teacher.entity';

export enum LoanStatus {
  ACTIVE = 'active',
  RETURNED = 'returned',
  OVERDUE = 'overdue',
  LOST = 'lost',
  DAMAGED = 'damaged',
}

@Entity('book_loans')
export class BookLoan {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  bookId: number;

  @Column({ nullable: true })
  studentId: number;

  @Column({ nullable: true })
  teacherId: number;

  @Column({ nullable: true })
  staffId: number;

  @Column({ type: 'datetime' })
  loanDate: Date;

  @Column({ type: 'date' })
  dueDate: Date;

  @Column({ type: 'datetime', nullable: true })
  returnDate: Date;

  @Column({
    type: 'enum',
    enum: LoanStatus,
    default: LoanStatus.ACTIVE,
  })
  status: LoanStatus;

  @Column({ type: 'text', nullable: true })
  loanNotes: string;

  @Column({ type: 'text', nullable: true })
  returnNotes: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  fineAmount: number;

  @Column({ default: false })
  finePaid: boolean;

  @Column({ type: 'datetime', nullable: true })
  finePaidDate: Date;

  @Column({ nullable: true })
  createdBy: number;

  @Column({ nullable: true })
  returnedBy: number;

  @Column()
  instansiId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Book, (book) => book.loans)
  @JoinColumn({ name: 'book_id' })
  book: Book;

  @ManyToOne(() => Student, (student) => student.bookLoans, { nullable: true })
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @ManyToOne(() => Teacher, (teacher) => teacher.bookLoans, { nullable: true })
  @JoinColumn({ name: 'teacher_id' })
  teacher: Teacher;
}

