import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { LetterTemplate } from './letter-template.entity';

export enum GeneratedLetterStatus {
  DRAFT = 'draft',
  FINAL = 'final',
}

@Entity('generated_letters')
export class GeneratedLetter {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  instansiId: number;

  @Column({ nullable: true })
  templateId: number;

  @ManyToOne(() => LetterTemplate, (template) => template.generatedLetters, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'templateId' })
  template: LetterTemplate;

  @Column()
  referenceNumber: string;

  @Column()
  subject: string;

  @Column({ type: 'json', nullable: true })
  variables: Record<string, any>;

  @Column({
    type: 'enum',
    enum: GeneratedLetterStatus,
    default: GeneratedLetterStatus.DRAFT,
  })
  status: GeneratedLetterStatus;

  @Column({ nullable: true })
  recipient: string;

  @Column({ nullable: true })
  filePath: string;

  @Column({ type: 'longtext', nullable: true })
  renderedHtml?: string;

  @Column({ type: 'date', nullable: true })
  letterDate: Date | null;

  @Column()
  createdBy: number;

  @Column({ nullable: true })
  updatedBy: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}


