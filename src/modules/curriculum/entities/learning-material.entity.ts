import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Syllabus } from './syllabus.entity';

export enum MaterialType {
  THEORY = 'theory',
  PRACTICE = 'practice',
  ASSIGNMENT = 'assignment',
  EXAM = 'exam',
  PROJECT = 'project',
}

@Entity('learning_materials')
export class LearningMaterial {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  instansiId: number;

  @Column()
  syllabusId: number;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  content: string; // Konten materi pembelajaran

  @Column({
    type: 'enum',
    enum: MaterialType,
    default: MaterialType.THEORY,
  })
  type: MaterialType;

  @Column({ type: 'int', default: 1 })
  meetingNumber: number; // Pertemuan ke berapa

  @Column({ type: 'int', default: 0 })
  estimatedHours: number; // Estimasi jam pelajaran

  @Column({ type: 'text', nullable: true })
  fileUrl: string; // URL file materi (PDF, DOC, dll)

  @Column({ type: 'text', nullable: true })
  videoUrl: string; // URL video pembelajaran

  @Column({ type: 'text', nullable: true })
  linkUrl: string; // URL link eksternal

  @Column({ type: 'int', default: 0 })
  order: number; // Urutan materi

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Syllabus, (syllabus) => syllabus.learningMaterials, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'syllabus_id' })
  syllabus: Syllabus;
}

