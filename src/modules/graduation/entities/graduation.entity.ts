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

@Entity('graduations')
export class Graduation {
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

  @Column({ type: 'int', nullable: true })
  rank: number;

  @Column({ default: false })
  certificateGenerated: boolean;

  @Column({ nullable: true })
  certificateNumber: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Student)
  @JoinColumn({ name: 'student_id' })
  student: Student;
}

