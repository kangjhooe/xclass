import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PpdbRegistration } from './ppdb-registration.entity';

export enum ScheduleStatus {
  AVAILABLE = 'available',
  BOOKED = 'booked',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('ppdb_interview_schedules')
export class PpdbInterviewSchedule {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  instansiId: number;

  @Column({ type: 'datetime' })
  scheduleDate: Date;

  @Column({ type: 'time' })
  startTime: string;

  @Column({ type: 'time' })
  endTime: string;

  @Column({ type: 'int', default: 1 })
  maxParticipants: number;

  @Column({ type: 'int', default: 0 })
  currentParticipants: number;

  @Column({
    type: 'enum',
    enum: ScheduleStatus,
    default: ScheduleStatus.AVAILABLE,
  })
  status: ScheduleStatus;

  @Column({ nullable: true })
  location: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ nullable: true })
  registrationId: number;

  @Column({ nullable: true })
  createdBy: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => PpdbRegistration, { nullable: true })
  @JoinColumn({ name: 'registration_id' })
  registration: PpdbRegistration;
}

