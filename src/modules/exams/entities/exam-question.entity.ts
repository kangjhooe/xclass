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
import { Question, QuestionType, QuestionDifficulty } from './question.entity';
import { Stimulus } from './stimulus.entity';

// Re-export types for convenience
export { QuestionType, QuestionDifficulty };

@Entity('exam_questions')
export class ExamQuestion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  examId: number;

  @Column({ nullable: true })
  questionId: number; // Reference ke Question asli (jika dari bank soal)

  @Column({ nullable: true })
  stimulusId: number; // Snapshot stimulus jika ada

  // Snapshot data dari Question (untuk konsistensi)
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
  points: number; // Bisa override dari Question

  @Column({
    type: 'enum',
    enum: QuestionDifficulty,
    default: QuestionDifficulty.LEVEL_3,
  })
  difficulty: QuestionDifficulty;

  @Column({ type: 'int', default: 0 })
  order: number; // Urutan di ujian ini

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  @Column({ default: true })
  isSnapshot: boolean; // True jika sudah di-copy dari Question

  @Column()
  instansiId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Exam, (exam) => exam.questions)
  @JoinColumn({ name: 'exam_id' })
  exam: Exam;

  @ManyToOne(() => Question, { nullable: true })
  @JoinColumn({ name: 'question_id' })
  question: Question;

  @ManyToOne(() => Stimulus, { nullable: true })
  @JoinColumn({ name: 'stimulus_id' })
  stimulus: Stimulus;
}

