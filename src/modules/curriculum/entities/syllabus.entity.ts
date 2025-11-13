import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Curriculum } from './curriculum.entity';
import { Subject } from '../../subjects/entities/subject.entity';
import { LearningMaterial } from './learning-material.entity';
import { Competency } from './competency.entity';

@Entity('syllabi')
export class Syllabus {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  instansiId: number;

  @Column()
  curriculumId: number;

  @Column()
  subjectId: number;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'int', default: 0 })
  totalHours: number; // Total jam pelajaran per semester

  @Column({ type: 'int', default: 0 })
  totalMeetings: number; // Total pertemuan

  @Column({ type: 'text', nullable: true })
  learningObjectives: string; // Tujuan pembelajaran

  @Column({ type: 'text', nullable: true })
  assessmentMethods: string; // Metode penilaian

  @Column({ type: 'text', nullable: true })
  learningResources: string; // Sumber belajar

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Curriculum, (curriculum) => curriculum.syllabi)
  @JoinColumn({ name: 'curriculum_id' })
  curriculum: Curriculum;

  @ManyToOne(() => Subject)
  @JoinColumn({ name: 'subject_id' })
  subject: Subject;

  @OneToMany(() => LearningMaterial, (material) => material.syllabus)
  learningMaterials: LearningMaterial[];

  @OneToMany(() => Competency, (competency) => competency.syllabus)
  competencies: Competency[];
}

