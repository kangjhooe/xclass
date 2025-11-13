import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Question } from './question.entity';
import { Teacher } from '../../teachers/entities/teacher.entity';

export enum StimulusType {
  TEXT = 'text',
  IMAGE = 'image',
  PDF = 'pdf',
  VIDEO = 'video',
  AUDIO = 'audio',
}

@Entity('stimuli')
export class Stimulus {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  content: string; // Untuk text, atau URL untuk file

  @Column({
    type: 'enum',
    enum: StimulusType,
    default: StimulusType.TEXT,
  })
  contentType: StimulusType;

  @Column({ type: 'text', nullable: true })
  fileUrl: string; // URL file jika bukan text

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  @Column()
  createdBy: number; // teacherId

  @Column()
  instansiId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Teacher)
  @JoinColumn({ name: 'created_by' })
  teacher: Teacher;

  @OneToMany(() => Question, (question) => question.stimulus)
  questions: Question[];
}

