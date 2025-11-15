
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

@Entity('alumni')
export class Alumni {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  instansiId: number;

  @Column()
  studentId: number;

  @Column({ type: 'int' })
  graduationYear: number;

  @Column({ type: 'date' })
  graduationDate: Date;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  finalGrade: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  gpa: number;

  @Column({ type: 'int', nullable: true })
  rank: number;

  @Column({ nullable: true })
  currentOccupation: string;

  @Column({ nullable: true })
  company: string;

  @Column({ nullable: true })
  position: string;

  @Column({ nullable: true })
  industry: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  salaryRange: number;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  email: string;

  @Column({
    type: 'enum',
    enum: ['employed', 'unemployed', 'studying', 'self_employed'],
    default: 'unemployed',
  })
  status: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Student, (student) => student.alumniRecords)
  @JoinColumn({ name: 'student_id' })
  student: Student;
}

