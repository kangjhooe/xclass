import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('activity_logs')
@Index(['userId', 'createdAt'])
@Index(['tenantId', 'createdAt'])
@Index(['modelType', 'modelId'])
@Index(['action', 'createdAt'])
export class ActivityLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  tenantId: number;

  @Column()
  modelType: string; // Model class name (e.g., 'Student', 'Teacher')

  @Column({ nullable: true })
  modelId: number;

  @Column()
  action: string; // 'create', 'update', 'delete', 'login', 'logout', etc.

  @Column({ type: 'json', nullable: true })
  changes: Record<string, any>; // Store old and new values

  @Column({ nullable: true })
  ipAddress: string;

  @Column({ nullable: true })
  userAgent: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn()
  createdAt: Date;
}

