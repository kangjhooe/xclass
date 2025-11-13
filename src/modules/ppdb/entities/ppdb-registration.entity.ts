import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum RegistrationStatus {
  PENDING = 'pending',
  REGISTERED = 'registered',
  SELECTION = 'selection',
  ANNOUNCED = 'announced',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
}

export enum RegistrationPath {
  ZONASI = 'zonasi',
  AFFIRMATIVE = 'affirmative',
  TRANSFER = 'transfer',
  ACHIEVEMENT = 'achievement',
  ACADEMIC = 'academic',
}

@Entity('ppdb_registrations')
export class PpdbRegistration {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  registrationNumber: string;

  @Column()
  studentName: string;

  @Column({ unique: true })
  studentNisn: string;

  @Column()
  studentNik: string;

  @Column()
  birthPlace: string;

  @Column({ type: 'date' })
  birthDate: Date;

  @Column({ type: 'enum', enum: ['male', 'female'] })
  gender: string;

  @Column()
  religion: string;

  @Column({ type: 'text' })
  address: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  email: string;

  @Column()
  parentName: string;

  @Column()
  parentPhone: string;

  @Column()
  parentOccupation: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  parentIncome: number;

  @Column()
  previousSchool: string;

  @Column({ type: 'text' })
  previousSchoolAddress: string;

  @Column({
    type: 'enum',
    enum: RegistrationPath,
  })
  registrationPath: RegistrationPath;

  @Column({
    type: 'enum',
    enum: RegistrationStatus,
    default: RegistrationStatus.PENDING,
  })
  status: RegistrationStatus;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  selectionScore: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  interviewScore: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  documentScore: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  totalScore: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'datetime' })
  registrationDate: Date;

  @Column({ type: 'datetime', nullable: true })
  selectionDate: Date;

  @Column({ type: 'datetime', nullable: true })
  announcementDate: Date;

  @Column({ type: 'datetime', nullable: true })
  acceptedDate: Date;

  @Column({ type: 'text', nullable: true })
  rejectedReason: string;

  @Column({ type: 'json', nullable: true })
  documents: Record<string, any>;

  @Column({ default: false })
  paymentStatus: boolean;

  @Column({ type: 'datetime', nullable: true })
  paymentDate: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  paymentAmount: number;

  @Column({ nullable: true })
  paymentReceipt: string;

  @Column()
  instansiId: number;

  @Column({ nullable: true })
  userId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

