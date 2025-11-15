import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Curriculum } from './curriculum.entity';
import { Syllabus } from './syllabus.entity';
import { LearningMaterial } from './learning-material.entity';
import { ClassRoom } from '../../classes/entities/class-room.entity';
import { Teacher } from '../../teachers/entities/teacher.entity';
import { Subject } from '../../subjects/entities/subject.entity';

@Entity('curriculum_schedules')
export class CurriculumSchedule {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  instansiId: number;

  @Column()
  curriculumId: number;

  @Column()
  syllabusId: number;

  @Column({ nullable: true })
  learningMaterialId: number; // Materi yang akan diajarkan

  @Column()
  classId: number;

  @Column()
  subjectId: number;

  @Column()
  teacherId: number;

  @Column({ type: 'date' })
  scheduleDate: Date; // Tanggal pembelajaran

  @Column({ type: 'time' })
  startTime: string;

  @Column({ type: 'time' })
  endTime: string;

  @Column({ nullable: true })
  room: string;

  @Column({ type: 'int', default: 1 })
  meetingNumber: number; // Pertemuan ke berapa

  @Column({ type: 'text', nullable: true })
  notes: string; // Catatan pembelajaran

  @Column({ type: 'text', nullable: true })
  homework: string; // Tugas rumah

  @Column({ default: false })
  isCompleted: boolean; // Apakah sudah selesai diajarkan

  @Column({ type: 'date', nullable: true })
  completedAt: Date; // Tanggal selesai

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Curriculum)
  @JoinColumn({ name: 'curriculum_id' })
  curriculum: Curriculum;

  @ManyToOne(() => Syllabus)
  @JoinColumn({ name: 'syllabus_id' })
  syllabus: Syllabus;

  @ManyToOne(() => LearningMaterial, { nullable: true })
  @JoinColumn({ name: 'learning_material_id' })
  learningMaterial: LearningMaterial;

  @ManyToOne(() => ClassRoom)
  @JoinColumn({ name: 'class_id' })
  classRoom: ClassRoom;

  @ManyToOne(() => Subject)
  @JoinColumn({ name: 'subject_id' })
  subject: Subject;

  @ManyToOne(() => Teacher, (teacher) => teacher.curriculumSchedules)
  @JoinColumn({ name: 'teacher_id' })
  teacher: Teacher;
}

