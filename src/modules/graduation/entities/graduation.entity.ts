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
import { AcademicYear } from '../../academic-year/entities/academic-year.entity';
import { ClassRoom } from '../../classes/entities/class-room.entity';

@Entity('graduations')
export class Graduation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  instansiId: number;

  @Column()
  studentId: number;

  @Column({ type: 'int', nullable: true })
  academicYearId: number;

  @Column({ type: 'int', nullable: true })
  classId: number;

  @Column({ type: 'int' })
  graduationYear: number;

  @Column({ type: 'date' })
  graduationDate: Date;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  finalGrade: number;

  @Column({ type: 'int', nullable: true })
  rank: number;

  @Column({
    type: 'enum',
    enum: ['pending', 'approved', 'graduated'],
    default: 'pending',
  })
  status: string;

  @Column({ default: false })
  certificateGenerated: boolean;

  @Column({ nullable: true })
  certificateNumber: string;

  @Column({ type: 'datetime', nullable: true })
  approvedAt: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Student, (student) => student.graduations)
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @ManyToOne(() => AcademicYear, { nullable: true })
  @JoinColumn({ name: 'academic_year_id' })
  academicYear: AcademicYear;

  @ManyToOne(() => ClassRoom, { nullable: true })
  @JoinColumn({ name: 'class_id' })
  classRoom: ClassRoom;
}

