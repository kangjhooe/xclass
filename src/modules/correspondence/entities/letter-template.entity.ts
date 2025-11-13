import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { OutgoingLetter } from './outgoing-letter.entity';
import { GeneratedLetter } from './generated-letter.entity';

export interface TemplateVariableDefinition {
  key: string;
  label: string;
  type: string;
  required?: boolean;
  placeholder?: string;
  options?: Array<{ label: string; value: string }>;
  helperText?: string;
  defaultValue?: string;
  source?: string;
}

@Entity('letter_templates')
@Index(['instansiId', 'code'], { unique: true })
export class LetterTemplate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  instansiId: number;

  @Column()
  code: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  jenisSurat: string;

  @Column({ nullable: true })
  category: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'json', nullable: true })
  variables: TemplateVariableDefinition[];

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  description: string;

  @Column()
  createdBy: number;

  @Column({ nullable: true })
  updatedBy: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => OutgoingLetter, (letter) => letter.template)
  outgoingLetters: OutgoingLetter[];

  @OneToMany(() => GeneratedLetter, (letter) => letter.template)
  generatedLetters: GeneratedLetter[];
}

