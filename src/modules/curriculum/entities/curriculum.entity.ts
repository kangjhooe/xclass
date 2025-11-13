import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Syllabus } from './syllabus.entity';

export enum CurriculumType {
  K13 = 'K13',
  MERDEKA = 'Merdeka',
  MANDIRI = 'Mandiri',
  KURIKULUM_2013 = 'Kurikulum 2013',
}

@Entity('curricula')
export class Curriculum {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  instansiId: number;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: CurriculumType,
    default: CurriculumType.K13,
  })
  type: CurriculumType;

  @Column({ nullable: true })
  academicYearId: number;

  @Column({ nullable: true })
  level: string; // SD, SMP, SMA, SMK

  @Column({ nullable: true })
  grade: string; // 1, 2, 3, etc.

  @Column({ type: 'int', default: 1 })
  semester: number; // 1 or 2

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Syllabus, (syllabus) => syllabus.curriculum)
  syllabi: Syllabus[];
}

