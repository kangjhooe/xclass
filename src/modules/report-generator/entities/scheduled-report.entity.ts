import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ReportTemplate } from './report-template.entity';

export enum ScheduleFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
}

export enum ScheduleStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
}

@Entity('scheduled_reports')
export class ScheduledReport {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  instansiId: number;

  @Column()
  templateId: number;

  @Column()
  name: string;

  @Column()
  frequency: ScheduleFrequency;

  @Column({ type: 'json', nullable: true })
  scheduleConfig: Record<string, any>; // day of week, day of month, etc

  @Column({ type: 'json', nullable: true })
  parameters: Record<string, any>;

  @Column({ type: 'simple-array', nullable: true })
  recipients: string[]; // Email recipients

  @Column({ default: ScheduleStatus.ACTIVE })
  status: ScheduleStatus;

  @Column({ type: 'timestamp', nullable: true })
  lastRunAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  nextRunAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => ReportTemplate)
  @JoinColumn({ name: 'template_id' })
  template: ReportTemplate;
}

