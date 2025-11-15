import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Teacher } from '../../teachers/entities/teacher.entity';
import { Subject } from '../../subjects/entities/subject.entity';
import { ClassRoom } from '../../classes/entities/class-room.entity';
import { Question } from './question.entity';

@Entity('question_banks')
export class QuestionBank {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column()
  teacherId: number;

  @Column({ nullable: true })
  subjectId: number;

  @Column({ nullable: true })
  classId: number;

  @Column({ default: false })
  isShared: boolean; // Shared dalam tenant

  @Column()
  instansiId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Teacher, (teacher) => teacher.questionBanks)
  @JoinColumn({ name: 'teacher_id' })
  teacher: Teacher;

  @ManyToOne(() => Subject, { nullable: true })
  @JoinColumn({ name: 'subject_id' })
  subject: Subject;

  @ManyToOne(() => ClassRoom, { nullable: true })
  @JoinColumn({ name: 'class_id' })
  classRoom: ClassRoom;

  @ManyToMany(() => Question, (question) => question.banks)
  @JoinTable({
    name: 'question_bank_questions',
    joinColumn: { name: 'question_bank_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'question_id', referencedColumnName: 'id' },
  })
  questions: Question[];
}

