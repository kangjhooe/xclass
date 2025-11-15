import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exam } from './exam.entity';
import { Subject } from '../../subjects/entities/subject.entity';
import { ClassRoom } from '../../classes/entities/class-room.entity';
import { Teacher } from '../../teachers/entities/teacher.entity';

export enum ConversionType {
  PER_STUDENT = 'per_student',
  PER_CLASS = 'per_class',
}

@Entity('grade_conversions')
export class GradeConversion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  examId: number;

  @Column({ nullable: true })
  subjectId: number;

  @Column({ nullable: true })
  classId: number;

  @Column({ type: 'int' })
  minScore: number; // Nilai terendah

  @Column({ type: 'int' })
  maxScore: number; // Nilai tertinggi

  @Column({
    type: 'enum',
    enum: ConversionType,
    default: ConversionType.PER_CLASS,
  })
  conversionType: ConversionType;

  @Column({ type: 'json', nullable: true })
  conversionRules: Record<string, any>; // Untuk rule khusus

  @Column()
  createdBy: number; // teacherId

  @Column()
  instansiId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Exam)
  @JoinColumn({ name: 'exam_id' })
  exam: Exam;

  @ManyToOne(() => Subject, { nullable: true })
  @JoinColumn({ name: 'subject_id' })
  subject: Subject;

  @ManyToOne(() => ClassRoom, { nullable: true })
  @JoinColumn({ name: 'class_id' })
  classRoom: ClassRoom;

  @ManyToOne(() => Teacher, (teacher) => teacher.gradeConversions)
  @JoinColumn({ name: 'created_by' })
  teacher: Teacher;
}

