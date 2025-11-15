import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum ChannelProvider {
  TWILIO = 'twilio',
  RAJA_SMS = 'raja_sms',
  ZENZIVA = 'zenziva',
  WHATSAPP_BUSINESS = 'whatsapp_business',
  WHATSAPP_CLOUD_API = 'whatsapp_cloud_api',
  FIREBASE = 'firebase',
  SMTP = 'smtp',
}

export enum ChannelType {
  SMS = 'sms',
  WHATSAPP = 'whatsapp',
  EMAIL = 'email',
  PUSH = 'push',
}

@Entity('notification_channels')
export class NotificationChannel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  instansiId: number;

  @Column()
  name: string; // Nama channel (e.g., "WhatsApp Production", "SMS Twilio")

  @Column()
  type: ChannelType;

  @Column()
  provider: ChannelProvider;

  @Column({ type: 'json' })
  config: Record<string, any>; // Konfigurasi provider (API keys, tokens, dll)

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isDefault: boolean; // Channel default untuk type tertentu

  @Column({ type: 'int', default: 0 })
  priority: number; // Priority untuk fallback (0 = highest priority)

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

