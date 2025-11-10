import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum ReportFormat {
  PDF = 'pdf',
  EXCEL = 'excel',
  CSV = 'csv',
}

@Entity('report_templates')
export class ReportTemplate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  instansiId: number;

  @Column()
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column()
  category: string; // academic, financial, attendance, etc

  @Column({ type: 'text' })
  query: string; // SQL query atau query builder config

  @Column({ type: 'json', nullable: true })
  parameters: Record<string, any>; // Parameter yang bisa diisi

  @Column()
  format: ReportFormat;

  @Column({ type: 'text', nullable: true })
  template: string; // Template untuk rendering (HTML, etc)

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

