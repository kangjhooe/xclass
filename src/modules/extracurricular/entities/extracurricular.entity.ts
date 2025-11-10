import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Teacher } from '../../teachers/entities/teacher.entity';
import { ExtracurricularParticipant } from './extracurricular-participant.entity';
import { ExtracurricularActivity } from './extracurricular-activity.entity';

export enum ExtracurricularStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  COMPLETED = 'completed',
}

export enum ExtracurricularCategory {
  SPORTS = 'sports',
  ARTS = 'arts',
  ACADEMIC = 'academic',
  SOCIAL = 'social',
  RELIGIOUS = 'religious',
  TECHNOLOGY = 'technology',
}

@Entity('extracurriculars')
export class Extracurricular {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: ExtracurricularCategory,
  })
  category: ExtracurricularCategory;

  @Column({ nullable: true })
  supervisorId: number;

  @Column({ nullable: true })
  assistantSupervisorId: number;

  @Column({ type: 'json', nullable: true })
  schedule: Record<string, any>;

  @Column({ nullable: true })
  venue: string;

  @Column({ type: 'int', nullable: true })
  maxParticipants: number;

  @Column({ type: 'int', default: 0 })
  currentParticipants: number;

  @Column({
    type: 'enum',
    enum: ExtracurricularStatus,
    default: ExtracurricularStatus.ACTIVE,
  })
  status: ExtracurricularStatus;

  @Column({ type: 'date', nullable: true })
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  endDate: Date;

  @Column({ type: 'json', nullable: true })
  requirements: string[];

  @Column({ type: 'json', nullable: true })
  equipmentNeeded: string[];

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  cost: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column()
  instansiId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Teacher, { nullable: true })
  @JoinColumn({ name: 'supervisor_id' })
  supervisor: Teacher;

  @ManyToOne(() => Teacher, { nullable: true })
  @JoinColumn({ name: 'assistant_supervisor_id' })
  assistantSupervisor: Teacher;

  @OneToMany(() => ExtracurricularParticipant, (participant) => participant.extracurricular)
  participants: ExtracurricularParticipant[];

  @OneToMany(() => ExtracurricularActivity, (activity) => activity.extracurricular)
  activities: ExtracurricularActivity[];
}

