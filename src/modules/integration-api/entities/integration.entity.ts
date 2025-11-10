import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum IntegrationType {
  DAPODIK = 'dapodik',
  SIMPATIKA = 'simpatika',
  CUSTOM = 'custom',
}

export enum IntegrationStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ERROR = 'error',
}

@Entity('integrations')
export class Integration {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  instansiId: number;

  @Column()
  name: string;

  @Column()
  type: IntegrationType;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'json' })
  config: Record<string, any>; // API keys, endpoints, credentials, etc

  @Column({ default: IntegrationStatus.INACTIVE })
  status: IntegrationStatus;

  @Column({ type: 'json', nullable: true })
  mapping: Record<string, any>; // Field mapping between systems

  @Column({ type: 'timestamp', nullable: true })
  lastSyncAt: Date;

  @Column({ type: 'text', nullable: true })
  lastError: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

