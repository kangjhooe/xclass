import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum TemplateType {
  EMAIL = 'email',
  SMS = 'sms',
  WHATSAPP = 'whatsapp',
  PUSH = 'push',
}

@Entity('notification_templates')
export class NotificationTemplate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  instansiId: number;

  @Column()
  name: string;

  @Column()
  type: TemplateType;

  @Column()
  subject: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'json', nullable: true })
  variables: string[]; // List of variables yang bisa digunakan

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

