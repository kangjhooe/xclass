import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Tenant } from '../../tenant/entities/tenant.entity';

@Entity('news')
export class News {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  instansiId: number;

  @Column()
  title: string;

  @Column({ nullable: true, unique: true })
  slug: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'text', nullable: true })
  excerpt: string;

  @Column({ nullable: true })
  featuredImage: string;

  @Column({
    type: 'enum',
    enum: ['draft', 'published'],
    default: 'draft',
  })
  status: string;

  @Column({ default: false })
  isFeatured: boolean;

  @Column({ type: 'datetime', nullable: true })
  publishedAt: Date;

  @Column({ nullable: true })
  metaTitle: string;

  @Column({ type: 'text', nullable: true })
  metaDescription: string;

  @Column({ type: 'text', nullable: true })
  metaKeywords: string;

  @Column({ default: 0 })
  viewCount: number;

  @Column({ nullable: true })
  readingTime: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Tenant, { nullable: true })
  @JoinColumn({ name: 'instansi_id' })
  tenant: Tenant;
}

