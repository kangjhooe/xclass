import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Student } from '../../students/entities/student.entity';
import { Teacher } from '../../teachers/entities/teacher.entity';

@Entity('disciplinary_actions')
export class DisciplinaryAction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  instansiId: number;

  @Column()
  studentId: number;

  @Column({ nullable: true })
  reporterId: number;

  @Column({ type: 'date' })
  incidentDate: Date;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'enum',
    enum: ['warning', 'reprimand', 'suspension', 'expulsion'],
    default: 'warning',
  })
  sanctionType: string;

  @Column({ type: 'text', nullable: true })
  sanctionDetails: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'active', 'completed', 'cancelled'],
    default: 'pending',
  })
  status: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Student, (student) => student.disciplinaryActions)
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @ManyToOne(() => Teacher, (teacher) => teacher.reportedDisciplinaryActions)
  @JoinColumn({ name: 'reporter_id' })
  reporter: Teacher;
}

