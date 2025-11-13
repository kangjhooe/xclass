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

  @Column({ name: 'instansi_id' })
  instansiId: number;

  @Column({ name: 'student_id' })
  studentId: number;

  @Column({ name: 'counselor_id', nullable: true })
  counselorId: number;

  @Column({ name: 'session_date', type: 'datetime' })
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

  @Column({ name: 'follow_up', type: 'text', nullable: true })
  followUp: string;

  @Column({ name: 'follow_up_date', type: 'datetime', nullable: true })
  followUpDate: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Student)
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @ManyToOne(() => Teacher)
  @JoinColumn({ name: 'counselor_id' })
  counselor: Teacher;
}

