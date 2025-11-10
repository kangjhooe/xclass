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
import { ClassRoom } from '../../classes/entities/class-room.entity';
import { Teacher } from '../../teachers/entities/teacher.entity';
import { Subject } from '../../subjects/entities/subject.entity';
import { Attendance } from '../../attendance/entities/attendance.entity';

@Entity('schedules')
export class Schedule {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  classId: number;

  @Column()
  subjectId: number;

  @Column()
  teacherId: number;

  @Column()
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.

  @Column({ type: 'time' })
  startTime: string;

  @Column({ type: 'time' })
  endTime: string;

  @Column({ nullable: true })
  room: string;

  @Column({ default: true })
  isActive: boolean;

  @Column()
  instansiId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => ClassRoom, (classRoom) => classRoom.schedules)
  @JoinColumn({ name: 'class_id' })
  classRoom: ClassRoom;

  @ManyToOne(() => Subject, (subject) => subject.schedules)
  @JoinColumn({ name: 'subject_id' })
  subject: Subject;

  @ManyToOne(() => Teacher, (teacher) => teacher.schedules)
  @JoinColumn({ name: 'teacher_id' })
  teacher: Teacher;

  @OneToMany(() => Attendance, (attendance) => attendance.schedule)
  attendances: Attendance[];
}

