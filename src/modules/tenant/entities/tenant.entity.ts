import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('tenants')
export class Tenant {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  npsn: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'json', nullable: true })
  settings: Record<string, any>;

  @Column({ type: 'bigint', default: 0, comment: 'Storage usage in bytes' })
  storageUsageBytes: number;

  @Column({ type: 'bigint', default: 0, comment: 'Storage limit in bytes (base + upgrade)' })
  storageLimitBytes: number;

  @Column({ type: 'bigint', default: 0, comment: 'Additional storage from upgrades in bytes' })
  storageUpgradeBytes: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

