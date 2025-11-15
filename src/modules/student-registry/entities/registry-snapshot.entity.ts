import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Student } from '../../students/entities/student.entity';

@Entity('registry_snapshots')
export class RegistrySnapshot {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  studentId: number;

  @Column()
  instansiId: number;

  @Column({ type: 'varchar', length: 16 })
  nik: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  nisn: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  academicYear: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  academicLevel: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  currentGrade: string;

  @Column({ type: 'text', nullable: true })
  pdfPath: string;

  @Column({ type: 'text', nullable: true })
  pdfUrl: string;

  @Column({ type: 'longtext', nullable: true })
  registryData: string; // JSON string of complete registry data

  @Column({ type: 'varchar', length: 255, nullable: true })
  generatedBy: string;

  @Column({ type: 'int', nullable: true })
  generatedById: number;

  @Column({ type: 'varchar', length: 64, nullable: true })
  fileHash: string; // SHA-256 hash for integrity verification

  @Column({ default: false })
  isSigned: boolean;

  @Column({ type: 'int', nullable: true })
  signatureId: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Student, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_id' })
  student: Student;
}

