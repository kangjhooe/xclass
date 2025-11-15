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

export enum CardType {
  STUDENT = 'student',
  TEACHER = 'teacher',
  STAFF = 'staff',
  VISITOR = 'visitor',
}

export enum CardStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  EXPIRED = 'expired',
}

@Entity('cards')
export class Card {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  instansiId: number;

  @Column({
    type: 'enum',
    enum: CardType,
  })
  type: CardType;

  @Column({ nullable: true })
  studentId: number;

  @Column({ nullable: true })
  teacherId: number;

  @Column()
  cardNumber: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  photo: string;

  @Column({ nullable: true })
  nisn: string;

  @Column({ nullable: true })
  nip: string;

  @Column({ type: 'date', nullable: true })
  birthDate: Date;

  @Column({ nullable: true })
  birthPlace: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  classRoom: string;

  @Column({ nullable: true })
  position: string;

  @Column({
    type: 'enum',
    enum: CardStatus,
    default: CardStatus.ACTIVE,
  })
  status: CardStatus;

  @Column({ type: 'date', nullable: true })
  validFrom: Date;

  @Column({ type: 'date', nullable: true })
  validUntil: Date;

  @Column({ type: 'int', nullable: true })
  templateId: number;

  @Column({ type: 'text', nullable: true })
  templateData: string; // JSON data for template customization

  @Column({ type: 'text', nullable: true })
  qrCode: string;

  @Column({ type: 'text', nullable: true })
  barcode: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Student, (student) => student.cards, { nullable: true })
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @ManyToOne(() => Teacher, (teacher) => teacher.cards, { nullable: true })
  @JoinColumn({ name: 'teacher_id' })
  teacher: Teacher;
}

