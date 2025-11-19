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

export enum ScholarshipType {
  FULL = 'full',              // Beasiswa Penuh
  PARTIAL = 'partial',        // Beasiswa Parsial
  TUITION = 'tuition',        // Bebas SPP
  BOOK = 'book',              // Bantuan Buku
  UNIFORM = 'uniform',        // Bantuan Seragam
  TRANSPORT = 'transport',    // Bantuan Transport
  MEAL = 'meal',              // Bantuan Makan
  OTHER = 'other',            // Bantuan Lainnya
}

export enum ScholarshipStatus {
  ACTIVE = 'active',          // Aktif
  EXPIRED = 'expired',        // Berakhir
  CANCELLED = 'cancelled',    // Dibatalkan
}

@Entity('scholarships')
export class Scholarship {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  studentId: number;

  @Column({
    type: 'enum',
    enum: ScholarshipType,
  })
  scholarshipType: ScholarshipType;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  amount: number; // Jumlah beasiswa per periode (jika ada)

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  percentage: number; // Persentase beasiswa (jika parsial)

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  endDate: Date;

  @Column({
    type: 'enum',
    enum: ScholarshipStatus,
    default: ScholarshipStatus.ACTIVE,
  })
  status: ScholarshipStatus;

  @Column({ nullable: true })
  sponsor: string; // Pemberi beasiswa

  @Column({ type: 'text', nullable: true })
  requirements: string; // Syarat beasiswa

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ nullable: true })
  documentFile: string; // File dokumen beasiswa

  @Column({ nullable: true })
  createdBy: number;

  @Column()
  instansiId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Student, (student) => student.scholarships)
  @JoinColumn({ name: 'student_id' })
  student: Student;
}

