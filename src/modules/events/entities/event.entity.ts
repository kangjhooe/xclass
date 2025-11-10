import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EventRegistration } from './event-registration.entity';

export enum EventType {
  ACADEMIC = 'academic',
  SOCIAL = 'social',
  SPORTS = 'sports',
  CULTURAL = 'cultural',
  RELIGIOUS = 'religious',
  MEETING = 'meeting',
  CEREMONY = 'ceremony',
}

export enum EventCategory {
  SCHOOL = 'school',
  CLASS = 'class',
  GRADE = 'grade',
  EXTRACURRICULAR = 'extracurricular',
  PARENT = 'parent',
  TEACHER = 'teacher',
  STUDENT = 'student',
}

export enum EventStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ONGOING = 'ongoing',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: EventType,
  })
  eventType: EventType;

  @Column({
    type: 'enum',
    enum: EventCategory,
  })
  category: EventCategory;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date' })
  endDate: Date;

  @Column({ type: 'datetime', nullable: true })
  startTime: Date;

  @Column({ type: 'datetime', nullable: true })
  endTime: Date;

  @Column({ nullable: true })
  venue: string;

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true })
  organizer: string;

  @Column({ type: 'json', nullable: true })
  targetAudience: string[];

  @Column({ type: 'int', nullable: true })
  maxParticipants: number;

  @Column({ default: false })
  registrationRequired: boolean;

  @Column({ type: 'datetime', nullable: true })
  registrationDeadline: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  cost: number;

  @Column({
    type: 'enum',
    enum: EventStatus,
    default: EventStatus.DRAFT,
  })
  status: EventStatus;

  @Column({ default: false })
  isPublic: boolean;

  @Column({ type: 'json', nullable: true })
  images: string[];

  @Column({ type: 'json', nullable: true })
  attachments: string[];

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ nullable: true })
  createdBy: number;

  @Column()
  instansiId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => EventRegistration, (registration) => registration.event)
  registrations: EventRegistration[];
}

