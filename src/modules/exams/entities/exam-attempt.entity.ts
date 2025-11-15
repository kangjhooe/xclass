import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exam } from './exam.entity';
import { Student } from '../../students/entities/student.entity';

export enum AttemptStatus {
  STARTED = 'started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  ABANDONED = 'abandoned',
  TIMEOUT = 'timeout',
}

@Entity('exam_attempts')
export class ExamAttempt {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  examId: number;

  @Column()
  studentId: number;

  @Column({ type: 'datetime', nullable: true })
  startedAt: Date;

  @Column({ type: 'datetime', nullable: true })
  submittedAt: Date;

  @Column({
    type: 'enum',
    enum: AttemptStatus,
    default: AttemptStatus.STARTED,
  })
  status: AttemptStatus;

  @Column({ type: 'int', default: 0 })
  score: number;

  @Column({ type: 'int', default: 0 })
  totalQuestions: number;

  @Column({ type: 'int', default: 0 })
  correctAnswers: number;

  @Column({ type: 'int', default: 0 })
  timeSpent: number; // in seconds

  @Column({ nullable: true })
  ipAddress: string;

  @Column({ nullable: true })
  userAgent: string;

  @Column({ type: 'json', nullable: true })
  questionOrder: number[];

  @Column({ type: 'json', nullable: true })
  answerOrder: Record<string, any>;

  @Column()
  instansiId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Exam, (exam) => exam.attempts)
  @JoinColumn({ name: 'exam_id' })
  exam: Exam;

  @ManyToOne(() => Student, (student) => student.examAttempts)
  @JoinColumn({ name: 'student_id' })
  student: Student;
}

