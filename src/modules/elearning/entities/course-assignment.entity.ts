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
import { CourseAssignmentSubmission } from './course-assignment-submission.entity';

@Entity('course_assignments')
export class CourseAssignment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  courseId: number;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  instructions: string;

  @Column({ type: 'date' })
  dueDate: Date;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  maxScore: number;

  @Column({ default: true })
  allowLateSubmission: boolean;

  @Column({ type: 'int', default: 0 })
  order: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Course, (course) => course.assignments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'course_id' })
  course: Course;

  @OneToMany(() => CourseAssignmentSubmission, (submission) => submission.assignment)
  submissions: CourseAssignmentSubmission[];
}

