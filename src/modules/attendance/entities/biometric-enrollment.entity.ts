import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Student } from '../../students/entities/student.entity';
import { BiometricDevice } from './biometric-device.entity';

export enum EnrollmentStatus {
  PENDING = 'pending',
  ENROLLED = 'enrolled',
  FAILED = 'failed',
  DELETED = 'deleted',
}

@Entity('biometric_enrollments')
@Index(['studentId', 'deviceId'])
@Index(['instansiId', 'status'])
export class BiometricEnrollment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  instansiId: number;

  @Column()
  studentId: number;

  @Column()
  deviceId: number;

  @Column({ type: 'varchar', length: 50 })
  biometricId: string; // Fingerprint ID or face ID from device

  @Column({ default: EnrollmentStatus.PENDING })
  status: EnrollmentStatus;

  @Column({ type: 'json', nullable: true })
  biometricData: Record<string, any>; // Encrypted biometric template

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @Column({ type: 'timestamp', nullable: true })
  enrolledAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt: Date;

  @ManyToOne(() => Student, (student) => student.biometricEnrollments)
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @ManyToOne(() => BiometricDevice)
  @JoinColumn({ name: 'device_id' })
  device: BiometricDevice;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

