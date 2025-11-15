import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { BiometricAttendance } from './biometric-attendance.entity';

export enum DeviceType {
  FINGERPRINT = 'fingerprint',
  FACE_RECOGNITION = 'face_recognition',
  CARD_READER = 'card_reader',
}

export enum DeviceStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  MAINTENANCE = 'maintenance',
  ERROR = 'error',
}

@Entity('biometric_devices')
export class BiometricDevice {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  instansiId: number;

  @Column()
  name: string;

  @Column()
  deviceId: string; // Unique device identifier from hardware

  @Column()
  type: DeviceType;

  @Column({ default: DeviceStatus.ACTIVE })
  status: DeviceStatus;

  @Column({ nullable: true })
  location: string; // Location/room where device is placed

  @Column({ type: 'json', nullable: true })
  config: Record<string, any>; // Device-specific configuration

  @Column({ nullable: true })
  ipAddress: string; // IP address for network devices

  @Column({ nullable: true })
  port: number; // Port for network devices

  @Column({ nullable: true })
  apiUrl: string; // API URL for cloud-based devices

  @Column({ nullable: true })
  apiKey: string; // API key for authentication

  @Column({ type: 'timestamp', nullable: true })
  lastSyncAt: Date; // Last successful sync timestamp

  @Column({ type: 'text', nullable: true })
  lastError: string; // Last error message

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'text', nullable: true })
  description: string;

  @OneToMany(() => BiometricAttendance, (attendance) => attendance.device)
  attendances: BiometricAttendance[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

