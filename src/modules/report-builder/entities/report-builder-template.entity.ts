import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export interface ReportBuilderConfig {
  layout: 'portrait' | 'landscape';
  sections: ReportSection[];
  styles?: {
    fontFamily?: string;
    fontSize?: number;
    colors?: {
      primary?: string;
      secondary?: string;
      text?: string;
    };
  };
}

export interface ReportSection {
  id: string;
  type: 'header' | 'footer' | 'body';
  elements: ReportElement[];
  styles?: {
    padding?: number;
    backgroundColor?: string;
  };
}

export interface ReportElement {
  id: string;
  type: 'text' | 'table' | 'chart' | 'image' | 'line' | 'spacer' | 'query';
  position: {
    x: number;
    y: number;
    width?: number;
    height?: number;
  };
  config: Record<string, any>;
  styles?: Record<string, any>;
}

@Entity('report_builder_templates')
export class ReportBuilderTemplate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  instansiId: number;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column()
  category: string;

  @Column({ type: 'json' })
  config: ReportBuilderConfig;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

