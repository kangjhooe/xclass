import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';
import { Course } from './course.entity';
import { Student } from '../../students/entities/student.entity';

@Entity('course_progress')
@Unique(['courseId', 'studentId'])
export class CourseProgress {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  courseId: number;

  @Column()
  studentId: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  progressPercentage: number;

  @Column({ type: 'int', default: 0 })
  materialsCompleted: number;

  @Column({ type: 'int', default: 0 })
  videosCompleted: number;

  @Column({ type: 'int', default: 0 })
  assignmentsCompleted: number;

  @Column({ type: 'int', default: 0 })
  quizzesCompleted: number;

  @Column({ default: false })
  isCompleted: boolean;

  @Column({ type: 'date', nullable: true })
  completedAt: Date;

  @Column({ type: 'date', nullable: true })
  lastAccessedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Course, (course) => course.progresses, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'course_id' })
  course: Course;

  @ManyToOne(() => Student, (student) => student.courseProgresses, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'student_id' })
  student: Student;
}

