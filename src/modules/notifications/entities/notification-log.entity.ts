import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { NotificationType, NotificationStatus } from './notification.entity';

@Entity('notification_logs')
@Index(['notificationId'])
@Index(['instansiId', 'createdAt'])
@Index(['channelId'])
export class NotificationLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  notificationId: number;

  @Column()
  instansiId: number;

  @Column({ nullable: true })
  channelId: number; // ID dari notification_channels

  @Column()
  type: NotificationType;

  @Column()
  status: NotificationStatus;

  @Column({ type: 'text', nullable: true })
  recipient: string;

  @Column({ type: 'text', nullable: true })
  message: string; // Pesan yang dikirim (untuk tracking)

  @Column({ type: 'json', nullable: true })
  requestData: Record<string, any>; // Data request ke provider

  @Column({ type: 'json', nullable: true })
  responseData: Record<string, any>; // Response dari provider

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  providerMessageId: string; // ID dari provider (untuk tracking)

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  cost: number; // Biaya pengiriman (jika ada)

  @Column({ type: 'varchar', length: 50, nullable: true })
  provider: string; // Nama provider yang digunakan

  @CreateDateColumn()
  createdAt: Date;
}

