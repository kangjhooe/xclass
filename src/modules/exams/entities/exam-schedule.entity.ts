import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exam } from './exam.entity';
import { ClassRoom } from '../../classes/entities/class-room.entity';
import { Subject } from '../../subjects/entities/subject.entity';
import { Teacher } from '../../teachers/entities/teacher.entity';

export enum ScheduleStatus {
  SCHEDULED = 'scheduled',
  ONGOING = 'ongoing',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('exam_schedules')
export class ExamSchedule {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  examId: number;

  @Column()
  classId: number;

  @Column()
  subjectId: number;

  @Column()
  teacherId: number;

  @Column({ type: 'datetime' })
  startTime: Date;

  @Column({ type: 'datetime' })
  endTime: Date;

  @Column({ type: 'int' })
  duration: number; // in minutes

  @Column({ type: 'int', default: 0 })
  totalQuestions: number;

  @Column({ type: 'int', default: 0 })
  totalScore: number;

  @Column({ type: 'int', default: 0 })
  passingScore: number;

  @Column({
    type: 'enum',
    enum: ScheduleStatus,
    default: ScheduleStatus.SCHEDULED,
  })
  status: ScheduleStatus;

  @Column({ type: 'text', nullable: true })
  instructions: string;

  @Column({ type: 'json', nullable: true })
  settings: Record<string, any>;

  @Column({ default: true })
  allowReview: boolean;

  @Column({ default: false })
  showCorrectAnswers: boolean;

  @Column({ default: false })
  randomizeQuestions: boolean;

  @Column({ default: false })
  randomizeAnswers: boolean;

  @Column({ type: 'int', default: 1 })
  maxAttempts: number;

  @Column()
  instansiId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Exam, (exam) => exam.schedules)
  @JoinColumn({ name: 'exam_id' })
  exam: Exam;

  @ManyToOne(() => ClassRoom)
  @JoinColumn({ name: 'class_id' })
  classRoom: ClassRoom;

  @ManyToOne(() => Subject)
  @JoinColumn({ name: 'subject_id' })
  subject: Subject;

  @ManyToOne(() => Teacher, (teacher) => teacher.examSchedules)
  @JoinColumn({ name: 'teacher_id' })
  teacher: Teacher;
}

