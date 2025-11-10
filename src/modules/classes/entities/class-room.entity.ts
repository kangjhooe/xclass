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
import { Teacher } from '../../teachers/entities/teacher.entity';
import { Student } from '../../students/entities/student.entity';
import { Schedule } from '../../schedules/entities/schedule.entity';
import { Room } from './room.entity';

@Entity('class_rooms')
export class ClassRoom {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  level: string;

  @Column({ nullable: true })
  roomNumber: string;

  @Column({ type: 'int', nullable: true })
  capacity: number;

  @Column({ nullable: true })
  homeroomTeacherId: number;

  @Column({ type: 'int', nullable: true })
  roomId: number;

  @Column({ nullable: true })
  academicYear: string;

  @Column({ default: true })
  isActive: boolean;

  @Column()
  instansiId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Teacher, (teacher) => teacher.classRooms)
  @JoinColumn({ name: 'homeroom_teacher_id' })
  homeroomTeacher: Teacher;

  @OneToMany(() => Student, (student) => student.classRoom)
  students: Student[];

  @OneToMany(() => Schedule, (schedule) => schedule.classRoom)
  schedules: Schedule[];

  @ManyToOne(() => Room, (room) => room.classRooms, { nullable: true })
  @JoinColumn({ name: 'room_id' })
  room: Room;
}

