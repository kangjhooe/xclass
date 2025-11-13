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

export enum CompetencyType {
  KI = 'KI', // Kompetensi Inti
  KD = 'KD', // Kompetensi Dasar
  IPK = 'IPK', // Indikator Pencapaian Kompetensi
}

@Entity('competencies')
export class Competency {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  instansiId: number;

  @Column()
  syllabusId: number;

  @Column({
    type: 'enum',
    enum: CompetencyType,
  })
  type: CompetencyType;

  @Column()
  code: string; // Kode kompetensi (e.g., KI-1, KD-3.1)

  @Column()
  description: string; // Deskripsi kompetensi

  @Column({ type: 'int', nullable: true })
  order: number; // Urutan kompetensi

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Syllabus, (syllabus) => syllabus.competencies, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'syllabus_id' })
  syllabus: Syllabus;
}

