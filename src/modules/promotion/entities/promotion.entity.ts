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
import { ClassRoom } from '../../classes/entities/class-room.entity';

@Entity('promotions')
export class Promotion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  instansiId: number;

  @Column()
  studentId: number;

  @Column({ nullable: true })
  fromClassId: number;

  @Column({ nullable: true })
  toClassId: number;

  @Column({ type: 'int' })
  academicYear: number;

  @Column({
    type: 'enum',
    enum: ['pending', 'approved', 'completed', 'cancelled'],
    default: 'pending',
  })
  status: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  finalGrade: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ nullable: true })
  approvedBy: number;

  @Column({ type: 'datetime', nullable: true })
  approvedAt: Date;

  @Column({ type: 'datetime', nullable: true })
  completedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Student, (student) => student.promotions)
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @ManyToOne(() => ClassRoom)
  @JoinColumn({ name: 'from_class_id' })
  fromClass: ClassRoom;

  @ManyToOne(() => ClassRoom)
  @JoinColumn({ name: 'to_class_id' })
  toClass: ClassRoom;
}

