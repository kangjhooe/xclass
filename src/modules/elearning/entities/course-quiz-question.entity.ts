import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CourseQuiz } from './course-quiz.entity';
import { Question } from '../../exams/entities/question.entity';

export enum QuestionType {
  MULTIPLE_CHOICE = 'multiple_choice',
  TRUE_FALSE = 'true_false',
  ESSAY = 'essay',
}

@Entity('course_quiz_questions')
export class CourseQuizQuestion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  quizId: number;

  @Column({ nullable: true })
  questionId: number; // Reference ke Question dari bank soal

  @Column({ type: 'text' })
  question: string;

  @Column({
    type: 'enum',
    enum: QuestionType,
  })
  type: QuestionType;

  @Column({ type: 'json', nullable: true })
  options: string[];

  @Column({ type: 'text', nullable: true })
  correctAnswer: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 1 })
  points: number;

  @Column({ type: 'text', nullable: true })
  explanation: string;

  @Column({ type: 'int', default: 0 })
  order: number;

  @Column({ default: true })
  isSnapshot: boolean; // True jika di-copy dari Question

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => CourseQuiz, (quiz) => quiz.questions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'quiz_id' })
  quiz: CourseQuiz;

  @ManyToOne(() => Question, { nullable: true })
  @JoinColumn({ name: 'question_id' })
  sourceQuestion: Question;
}

