import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Extracurricular } from './extracurricular.entity';
import { Student } from '../../students/entities/student.entity';

export enum ParticipantStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  GRADUATED = 'graduated',
}

@Entity('extracurricular_participants')
export class ExtracurricularParticipant {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  extracurricularId: number;

  @Column()
  studentId: number;

  @Column({
    type: 'enum',
    enum: ParticipantStatus,
    default: ParticipantStatus.ACTIVE,
  })
  status: ParticipantStatus;

  @Column({ type: 'datetime' })
  joinedAt: Date;

  @Column({ type: 'datetime', nullable: true })
  leftAt: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column()
  instansiId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Extracurricular, (extracurricular) => extracurricular.participants)
  @JoinColumn({ name: 'extracurricular_id' })
  extracurricular: Extracurricular;

  @ManyToOne(() => Student)
  @JoinColumn({ name: 'student_id' })
  student: Student;
}
