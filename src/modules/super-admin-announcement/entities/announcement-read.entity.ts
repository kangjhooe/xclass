import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('announcement_reads')
@Index(['announcementId', 'userId'], { unique: true })
export class AnnouncementRead {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  announcementId: number;

  @Column()
  userId: number;

  @Column()
  tenantId: number;

  @Column({ default: false })
  isRead: boolean;

  @Column({ type: 'datetime', nullable: true })
  readAt: Date;

  @Column({ default: false })
  isArchived: boolean;

  @Column({ type: 'datetime', nullable: true })
  archivedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

