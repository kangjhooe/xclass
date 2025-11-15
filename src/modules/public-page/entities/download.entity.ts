import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Tenant } from '../../tenant/entities/tenant.entity';

@Entity('downloads')
@Index(['instansiId', 'isActive'])
@Index(['instansiId', 'category'])
export class Download {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  instansiId: number;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column()
  fileUrl: string;

  @Column()
  fileName: string;

  @Column({ type: 'bigint', default: 0 })
  fileSize: number; // in bytes

  @Column({ nullable: true })
  fileType: string; // MIME type

  @Column({ nullable: true })
  category: string; // e.g., 'formulir', 'brosur', 'dokumen', 'panduan'

  @Column({ default: 0 })
  downloadCount: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  order: number;

  @Column({ nullable: true })
  thumbnail: string; // Preview image for PDFs

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Tenant, { nullable: true })
  @JoinColumn({ name: 'instansi_id' })
  tenant: Tenant;
}


