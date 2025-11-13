import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Teacher } from '../../teachers/entities/teacher.entity';
import { Stimulus } from './stimulus.entity';
import { QuestionBank } from './question-bank.entity';
import type { ExamQuestion } from './exam-question.entity';

export enum QuestionType {
  MULTIPLE_CHOICE = 'multiple_choice',
  TRUE_FALSE = 'true_false',
  ESSAY = 'essay',
  FILL_BLANK = 'fill_blank',
  MATCHING = 'matching',
}

export enum QuestionDifficulty {
  LEVEL_1 = 1, // Termudah
  LEVEL_2 = 2,
  LEVEL_3 = 3,
  LEVEL_4 = 4,
  LEVEL_5 = 5, // Tersulit
}

@Entity('questions')
export class Question {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  questionBankId: number; // Nullable jika dibuat langsung saat ujian

  @Column({ nullable: true })
  stimulusId: number;

  @Column({ type: 'text' })
  questionText: string;

  @Column({
    type: 'enum',
    enum: QuestionType,
    default: QuestionType.MULTIPLE_CHOICE,
  })
  questionType: QuestionType;

  @Column({ type: 'json', nullable: true })
  options: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  correctAnswer: string;

  @Column({ type: 'text', nullable: true })
  explanation: string;

  @Column({ type: 'int', default: 1 })
  points: number;

  @Column({
    type: 'enum',
    enum: QuestionDifficulty,
    default: QuestionDifficulty.LEVEL_3,
  })
  difficulty: QuestionDifficulty;

  @Column({ type: 'int', default: 0 })
  order: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  @Column()
  createdBy: number; // teacherId

  @Column()
  instansiId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => QuestionBank, { nullable: true })
  @JoinColumn({ name: 'question_bank_id' })
  questionBank: QuestionBank;

  @ManyToMany(() => QuestionBank, (bank) => bank.questions)
  banks: QuestionBank[];

  @ManyToOne(() => Stimulus, { nullable: true })
  @JoinColumn({ name: 'stimulus_id' })
  stimulus: Stimulus;

  @ManyToOne(() => Teacher)
  @JoinColumn({ name: 'created_by' })
  teacher: Teacher;

  @OneToMany('ExamQuestion', 'question')
  examQuestions: ExamQuestion[];
}

