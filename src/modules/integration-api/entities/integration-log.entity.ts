import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Integration } from './integration.entity';

export enum LogType {
  SYNC = 'sync',
  ERROR = 'error',
  WEBHOOK = 'webhook',
}

@Entity('integration_logs')
export class IntegrationLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  integrationId: number;

  @Column()
  type: LogType;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'json', nullable: true })
  data: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  request: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  response: Record<string, any>;

  @Column({ default: false })
  isSuccess: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Integration)
  @JoinColumn({ name: 'integrationId' })
  integration: Integration;
}

