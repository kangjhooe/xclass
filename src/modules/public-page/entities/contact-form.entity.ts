import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

export enum ContactFormStatus {
  NEW = 'new',
  READ = 'read',
  REPLIED = 'replied',
  ARCHIVED = 'archived',
}

@Entity('contact_forms')
@Index(['instansiId', 'status'])
@Index(['instansiId', 'createdAt'])
export class ContactForm {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  instansiId: number;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column()
  subject: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ default: ContactFormStatus.NEW })
  status: ContactFormStatus;

  @Column({ type: 'text', nullable: true })
  reply: string;

  @Column({ type: 'timestamp', nullable: true })
  repliedAt: Date;

  @Column({ nullable: true })
  repliedBy: number; // User ID

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>; // Additional data (IP, user agent, etc.)

  @CreateDateColumn()
  createdAt: Date;
}

