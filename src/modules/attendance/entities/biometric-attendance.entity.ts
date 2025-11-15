import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { Student } from '../../students/entities/student.entity';
import { BiometricDevice } from './biometric-device.entity';

export enum BiometricType {
  FINGERPRINT = 'fingerprint',
  FACE = 'face',
  CARD = 'card',
}

export enum SyncStatus {
  PENDING = 'pending',
  SYNCED = 'synced',
  FAILED = 'failed',
}

@Entity('biometric_attendances')
@Index(['deviceId', 'timestamp'])
@Index(['studentId', 'date'])
@Index(['instansiId', 'date'])
export class BiometricAttendance {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  instansiId: number;

  @Column()
  deviceId: number; // Reference to biometric_devices.id

  @Column()
  studentId: number;

  @Column({ type: 'varchar', length: 50 })
  biometricId: string; // Fingerprint ID or face ID from device

  @Column()
  type: BiometricType;

  @Column({ type: 'timestamp' })
  timestamp: Date; // Timestamp from device

  @Column({ type: 'date' })
  date: Date; // Date extracted from timestamp

  @Column({ type: 'time' })
  time: string; // Time extracted from timestamp

  @Column({ default: SyncStatus.PENDING })
  syncStatus: SyncStatus;

  @Column({ type: 'json', nullable: true })
  rawData: Record<string, any>; // Raw data from device

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @Column({ type: 'timestamp', nullable: true })
  syncedAt: Date;

  @ManyToOne(() => Student, (student) => student.biometricAttendances)
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @ManyToOne(() => BiometricDevice)
  @JoinColumn({ name: 'device_id' })
  device: BiometricDevice;

  @CreateDateColumn()
  createdAt: Date;
}

