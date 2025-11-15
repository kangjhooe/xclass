import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CourseAssignment } from './course-assignment.entity';
import { Student } from '../../students/entities/student.entity';

export enum SubmissionStatus {
  SUBMITTED = 'submitted',
  GRADED = 'graded',
  RETURNED = 'returned',
}

@Entity('course_assignment_submissions')
export class CourseAssignmentSubmission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  assignmentId: number;

  @Column()
  studentId: number;

  @Column({ type: 'text', nullable: true })
  answer: string;

  @Column({ type: 'text', nullable: true })
  fileUrl: string;

  @Column({
    type: 'enum',
    enum: SubmissionStatus,
    default: SubmissionStatus.SUBMITTED,
  })
  status: SubmissionStatus;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  score: number;

  @Column({ type: 'text', nullable: true })
  feedback: string;

  @Column({ type: 'date', nullable: true })
  submittedAt: Date;

  @Column({ type: 'date', nullable: true })
  gradedAt: Date;

  @Column({ default: false })
  isLate: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => CourseAssignment, (assignment) => assignment.submissions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'assignment_id' })
  assignment: CourseAssignment;

  @ManyToOne(() => Student, (student) => student.courseAssignmentSubmissions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'student_id' })
  student: Student;
}

