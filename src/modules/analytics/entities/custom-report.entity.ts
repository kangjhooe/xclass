import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum ReportType {
  STUDENTS = 'students',
  TEACHERS = 'teachers',
  ATTENDANCE = 'attendance',
  GRADES = 'grades',
  FINANCIAL = 'financial',
  CUSTOM = 'custom',
}

export enum ReportFormat {
  PDF = 'pdf',
  EXCEL = 'excel',
  CSV = 'csv',
  JSON = 'json',
}

export enum ReportSchedule {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly',
  MANUAL = 'manual',
}

@Entity('custom_reports')
@Index(['instansiId', 'isActive'])
@Index(['instansiId', 'createdAt'])
export class CustomReport {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  instansiId: number;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column()
  type: ReportType;

  @Column({ type: 'json' })
  config: {
    filters?: Record<string, any>;
    columns?: string[];
    aggregations?: Array<{
      field: string;
      function: 'sum' | 'avg' | 'count' | 'min' | 'max';
    }>;
    grouping?: string[];
    sorting?: Array<{
      field: string;
      direction: 'asc' | 'desc';
    }>;
  };

  @Column()
  format: ReportFormat;

  @Column({ default: ReportSchedule.MANUAL })
  schedule: ReportSchedule;

  @Column({ type: 'time', nullable: true })
  scheduleTime: string; // Time to run scheduled reports

  @Column({ type: 'int', nullable: true })
  scheduleDay: number; // Day of week/month for scheduled reports

  @Column({ type: 'text', nullable: true })
  emailRecipients: string; // Comma-separated email addresses

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  createdBy: number; // User ID

  @Column({ type: 'timestamp', nullable: true })
  lastRunAt: Date;

  @Column({ type: 'text', nullable: true })
  lastRunResult: string; // Path to last generated report

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

