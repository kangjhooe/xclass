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
import { Course } from './course.entity';
import { CourseQuizQuestion } from './course-quiz-question.entity';
import { CourseQuizAttempt } from './course-quiz-attempt.entity';

@Entity('course_quizzes')
export class CourseQuiz {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  courseId: number;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'int', nullable: true })
  timeLimit: number;

  @Column({ type: 'int', default: 1 })
  maxAttempts: number;

  @Column({ default: true })
  showAnswers: boolean;

  @Column({ default: true })
  allowReview: boolean;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  passingScore: number;

  @Column({ type: 'int', default: 0 })
  order: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Course, (course) => course.quizzes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'course_id' })
  course: Course;

  @OneToMany(() => CourseQuizQuestion, (question) => question.quiz)
  questions: CourseQuizQuestion[];

  @OneToMany(() => CourseQuizAttempt, (attempt) => attempt.quiz)
  attempts: CourseQuizAttempt[];
}

