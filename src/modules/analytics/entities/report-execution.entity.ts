import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { CustomReport } from './custom-report.entity';

export enum ExecutionStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

@Entity('report_executions')
@Index(['reportId', 'status'])
@Index(['instansiId', 'createdAt'])
export class ReportExecution {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  instansiId: number;

  @Column()
  reportId: number;

  @Column({ default: ExecutionStatus.PENDING })
  status: ExecutionStatus;

  @Column({ type: 'text', nullable: true })
  filePath: string; // Path to generated report file

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @Column({ type: 'json', nullable: true })
  parameters: Record<string, any>; // Parameters used for this execution

  @Column({ type: 'int', nullable: true })
  recordCount: number; // Number of records in report

  @Column({ type: 'timestamp', nullable: true })
  startedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  @Column({ nullable: true })
  executedBy: number; // User ID

  @ManyToOne(() => CustomReport)
  @JoinColumn({ name: 'report_id' })
  report: CustomReport;

  @CreateDateColumn()
  createdAt: Date;
}

