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
import { ExamSchedule } from './exam-schedule.entity';
import { ExamQuestion } from './exam-question.entity';
import { ExamAttempt } from './exam-attempt.entity';

export enum ExamType {
  QUIZ = 'quiz',
  MIDTERM = 'midterm',
  FINAL = 'final',
  ASSIGNMENT = 'assignment',
}

export enum ExamStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  ONGOING = 'ongoing',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('exams')
export class Exam {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: ExamType,
    default: ExamType.QUIZ,
  })
  examType: ExamType;

  @Column({ nullable: true })
  semester: string;

  @Column({ nullable: true })
  academicYear: string;

  @Column({ type: 'datetime' })
  startTime: Date;

  @Column({ type: 'datetime' })
  endTime: Date;

  @Column({
    type: 'enum',
    enum: ExamStatus,
    default: ExamStatus.DRAFT,
  })
  status: ExamStatus;

  @Column({ type: 'text', nullable: true })
  instructions: string;

  @Column({ type: 'json', nullable: true })
  settings: Record<string, any>;

  @Column({ nullable: true })
  createdBy: number;

  @Column({ default: true })
  allowReview: boolean;

  @Column({ default: false })
  showCorrectAnswers: boolean;

  @Column({ default: false })
  randomizeQuestions: boolean;

  @Column({ default: false })
  randomizeAnswers: boolean;

  @Column({ default: 1 })
  maxAttempts: number;

  @Column()
  instansiId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => ExamSchedule, (schedule) => schedule.exam)
  schedules: ExamSchedule[];

  @OneToMany(() => ExamQuestion, (question) => question.exam)
  questions: ExamQuestion[];

  @OneToMany(() => ExamAttempt, (attempt) => attempt.exam)
  attempts: ExamAttempt[];
}

