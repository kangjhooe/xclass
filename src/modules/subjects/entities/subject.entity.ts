import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Teacher } from '../../teachers/entities/teacher.entity';
import { Schedule } from '../../schedules/entities/schedule.entity';
import { CurriculumType } from '../../curriculum/entities/curriculum.entity';
import { Syllabus } from '../../curriculum/entities/syllabus.entity';

@Entity('subjects')
export class Subject {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  code: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  level: string;

  @Column({ nullable: true })
  grade: string;

  @Column({ type: 'int', nullable: true })
  semester: number;

  @Column({ nullable: true })
  department: string;

  @Column({ nullable: true })
  category: string;

  @Column({ name: 'learning_focus', nullable: true })
  learningFocus: string;

  @Column({
    name: 'curriculum_type',
    type: 'enum',
    enum: CurriculumType,
    nullable: true,
  })
  curriculumType: CurriculumType;

  @Column({ type: 'int', nullable: true })
  hoursPerWeek: number;

  @Column({ name: 'subject_order', type: 'int', default: 0 })
  order: number;

  @Column({ name: 'minimum_passing_score', type: 'float', default: 75 })
  minimumPassingScore: number;

  @Column({ name: 'is_mandatory', default: true })
  isMandatory: boolean;

  @Column({ name: 'is_elective', default: false })
  isElective: boolean;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  color: string;

  @Column()
  instansiId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToMany(() => Teacher, (teacher) => teacher.subjects)
  teachers: Teacher[];

  @OneToMany(() => Schedule, (schedule) => schedule.subject)
  schedules: Schedule[];

  @OneToMany(() => Syllabus, (syllabus) => syllabus.subject)
  syllabi: Syllabus[];
}

