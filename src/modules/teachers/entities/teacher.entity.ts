import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToMany,
  JoinTable,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ClassRoom } from '../../classes/entities/class-room.entity';
import { Schedule } from '../../schedules/entities/schedule.entity';
import { Subject } from '../../subjects/entities/subject.entity';

@Entity('teachers')
export class Teacher {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  employeeNumber: string;

  @Column({ nullable: true })
  nip: string;

  @Column({ nullable: true })
  nik: string;

  @Column({ nullable: true })
  nuptk: string;

  @Column({ nullable: true })
  gender: string;

  @Column({ type: 'date', nullable: true })
  birthDate: Date;

  @Column({ nullable: true })
  birthPlace: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  education: string;

  @Column({ nullable: true })
  specialization: string;

  @Column({ default: true })
  isActive: boolean;

  @Column()
  instansiId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => ClassRoom, (classRoom) => classRoom.homeroomTeacher)
  classRooms: ClassRoom[];

  @OneToMany(() => Schedule, (schedule) => schedule.teacher)
  schedules: Schedule[];

  @ManyToMany(() => Subject, (subject) => subject.teachers)
  @JoinTable({
    name: 'teacher_subjects',
    joinColumn: { name: 'teacher_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'subject_id', referencedColumnName: 'id' },
  })
  subjects: Subject[];
}

