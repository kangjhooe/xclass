import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('subscription_plans')
export class SubscriptionPlan {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'int', default: 0 })
  minStudents: number;

  @Column({ type: 'int', nullable: true })
  maxStudents: number; // null untuk unlimited

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  pricePerStudentPerYear: number;

  @Column({ type: 'int', default: 0 })
  billingThreshold: number;

  @Column({ type: 'boolean', default: false })
  isFree: boolean;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'int', default: 0 })
  sortOrder: number;

  @Column({ type: 'json', nullable: true })
  features: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

