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
import { Teacher } from '../../teachers/entities/teacher.entity';

@Entity('counseling_sessions')
export class CounselingSession {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  instansiId: number;

  @Column()
  studentId: number;

  @Column({ nullable: true })
  counselorId: number;

  @Column({ type: 'datetime' })
  sessionDate: Date;

  @Column({ type: 'text' })
  issue: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({
    type: 'enum',
    enum: ['scheduled', 'in_progress', 'completed', 'cancelled'],
    default: 'scheduled',
  })
  status: string;

  @Column({ type: 'text', nullable: true })
  followUp: string;

  @Column({ type: 'datetime', nullable: true })
  followUpDate: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Student)
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @ManyToOne(() => Teacher)
  @JoinColumn({ name: 'counselor_id' })
  counselor: Teacher;
}

