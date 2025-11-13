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
import { Competency } from '../../curriculum/entities/competency.entity';

export enum AssessmentType {
  NH = 'NH', // Nilai Harian
  PTS = 'PTS', // Penilaian Tengah Semester / PTS
  PAS = 'PAS', // Penilaian Akhir Semester / PAS
  PROJECT = 'PROJECT', // Penilaian Proyek
  OTHER = 'OTHER', // Penilaian lainnya
}

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

  @Column({
    type: 'enum',
    enum: AssessmentType,
    default: AssessmentType.NH,
    name: 'assessment_type',
  })
  assessmentType: AssessmentType;

  @Column({ nullable: true, name: 'custom_assessment_label' })
  customAssessmentLabel: string | null;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  score: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  weight: number | null;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'date', nullable: true })
  date: Date;

  @Column({ nullable: true, name: 'competency_id' })
  competencyId: number | null;

  @Column({ type: 'text', nullable: true, name: 'learning_outcome' })
  learningOutcome: string | null;

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

  @ManyToOne(() => Competency, { nullable: true })
  @JoinColumn({ name: 'competency_id' })
  competency: Competency | null;
}

