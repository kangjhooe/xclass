import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('super_admin_announcements')
export class SuperAdminAnnouncement {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  authorId: number;

  @Column()
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({
    type: 'enum',
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  })
  priority: string;

  @Column({
    type: 'enum',
    enum: ['draft', 'published', 'archived'],
    default: 'draft',
  })
  status: string;

  // Filter untuk target tenant
  // Jika null atau empty, berarti untuk semua tenant
  @Column({ type: 'json', nullable: true })
  targetTenantIds: number[];

  // Filter untuk jenjang (SD, SMP, SMA, SMK, dll)
  @Column({ type: 'json', nullable: true })
  targetJenjang: string[];

  // Filter untuk jenis/type tenant (sd, smp, sma, smk, dll)
  @Column({ type: 'json', nullable: true })
  targetJenis: string[];

  // Lampiran (array of file URLs)
  @Column({ type: 'json', nullable: true })
  attachments: Array<{
    filename: string;
    originalName: string;
    url: string;
    size: number;
    mimeType: string;
  }>;

  @Column({ type: 'datetime', nullable: true })
  publishAt: Date;

  @Column({ type: 'datetime', nullable: true })
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

