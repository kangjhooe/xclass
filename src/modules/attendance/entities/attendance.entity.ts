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
import { Schedule } from '../../schedules/entities/schedule.entity';
import { Teacher } from '../../teachers/entities/teacher.entity';

@Entity('attendances')
export class Attendance {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  studentId: number;

  @Column()
  scheduleId: number;

  @Column({ type: 'date' })
  date: Date;

  @Column({ default: 'present' })
  status: string; // 'present', 'absent', 'late', 'excused'

  @Column({ nullable: true })
  notes: string;

  @Column({ nullable: true })
  teacherId: number;

  @Column()
  instansiId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Student, (student) => student.attendances)
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @ManyToOne(() => Schedule, (schedule) => schedule.attendances)
  @JoinColumn({ name: 'schedule_id' })
  schedule: Schedule;

  @ManyToOne(() => Teacher)
  @JoinColumn({ name: 'teacher_id' })
  teacher: Teacher;
}

