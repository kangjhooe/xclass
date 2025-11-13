import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Subject } from '../../subjects/entities/subject.entity';
import { ClassRoom } from '../../classes/entities/class-room.entity';
import { ExamType } from './exam.entity';

@Entity('exam_weights')
export class ExamWeight {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  subjectId: number;

  @Column()
  classId: number;

  @Column({
    type: 'enum',
    enum: ExamType,
  })
  examType: ExamType;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  weight: number; // Persentase (0-100)

  @Column({ nullable: true })
  semester: string;

  @Column({ nullable: true })
  academicYear: string;

  @Column()
  instansiId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Subject)
  @JoinColumn({ name: 'subject_id' })
  subject: Subject;

  @ManyToOne(() => ClassRoom)
  @JoinColumn({ name: 'class_id' })
  classRoom: ClassRoom;
}

