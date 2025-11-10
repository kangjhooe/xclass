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

export enum ActivityType {
  REGULAR = 'regular',
  COMPETITION = 'competition',
  TRAINING = 'training',
  EVENT = 'event',
  MEETING = 'meeting',
}

export enum ActivityStatus {
  SCHEDULED = 'scheduled',
  ONGOING = 'ongoing',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('extracurricular_activities')
export class ExtracurricularActivity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  extracurricularId: number;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'date' })
  activityDate: Date;

  @Column({ type: 'datetime', nullable: true })
  startTime: Date;

  @Column({ type: 'datetime', nullable: true })
  endTime: Date;

  @Column({ nullable: true })
  venue: string;

  @Column({
    type: 'enum',
    enum: ActivityType,
    default: ActivityType.REGULAR,
  })
  type: ActivityType;

  @Column({
    type: 'enum',
    enum: ActivityStatus,
    default: ActivityStatus.SCHEDULED,
  })
  status: ActivityStatus;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ nullable: true })
  createdBy: number;

  @Column()
  instansiId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Extracurricular, (extracurricular) => extracurricular.activities)
  @JoinColumn({ name: 'extracurricular_id' })
  extracurricular: Extracurricular;
}
