import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Student } from '../../students/entities/student.entity';
import { Subject } from '../../subjects/entities/subject.entity';
import { Teacher } from '../../teachers/entities/teacher.entity';

@Entity('student_grades')
export class StudentGrade {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  studentId: number;

  @Column()
  subjectId: number;

  @Column({ nullable: true })
  teacherId: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  score: number;

  @Column({ nullable: true })
  assignmentType: string; // 'quiz', 'assignment', 'midterm', 'final', etc.

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'date', nullable: true })
  date: Date;

  @Column()
  instansiId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Student, (student) => student.grades)
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @ManyToOne(() => Subject)
  @JoinColumn({ name: 'subject_id' })
  subject: Subject;

  @ManyToOne(() => Teacher)
  @JoinColumn({ name: 'teacher_id' })
  teacher: Teacher;
}

