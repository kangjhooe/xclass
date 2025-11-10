import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum TemplateType {
  STUDENT = 'student',
  TEACHER = 'teacher',
  STAFF = 'staff',
  VISITOR = 'visitor',
}

@Entity('card_templates')
export class CardTemplate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  instansiId: number;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: TemplateType,
  })
  type: TemplateType;

  @Column({ type: 'text' })
  template: string; // HTML template or template configuration

  @Column({ type: 'text', nullable: true })
  backgroundImage: string;

  @Column({ type: 'text', nullable: true })
  logo: string;

  @Column({ type: 'json', nullable: true })
  layout: Record<string, any>; // Layout configuration

  @Column({ type: 'json', nullable: true })
  fields: Record<string, any>; // Fields configuration

  @Column({ default: false })
  isDefault: boolean;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

