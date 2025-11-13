import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Question } from './question.entity';
import { Teacher } from '../../teachers/entities/teacher.entity';

export enum ShareType {
  COPY = 'copy',
  EDIT = 'edit',
  VIEW = 'view',
}

export enum ShareStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('question_shares')
export class QuestionShare {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  questionId: number;

  @Column()
  fromTeacherId: number;

  @Column()
  toTeacherId: number;

  @Column()
  fromInstansiId: number;

  @Column()
  toInstansiId: number;

  @Column({
    type: 'enum',
    enum: ShareType,
    default: ShareType.COPY,
  })
  shareType: ShareType;

  @Column({
    type: 'enum',
    enum: ShareStatus,
    default: ShareStatus.PENDING,
  })
  status: ShareStatus;

  @Column({ type: 'text', nullable: true })
  message: string;

  @Column({ type: 'datetime', nullable: true })
  requestedAt: Date;

  @Column({ type: 'datetime', nullable: true })
  approvedAt: Date;

  @Column({ nullable: true })
  approvedBy: number; // teacherId yang approve

  @Column()
  instansiId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Question)
  @JoinColumn({ name: 'question_id' })
  question: Question;

  @ManyToOne(() => Teacher)
  @JoinColumn({ name: 'from_teacher_id' })
  fromTeacher: Teacher;

  @ManyToOne(() => Teacher)
  @JoinColumn({ name: 'to_teacher_id' })
  toTeacher: Teacher;
}

