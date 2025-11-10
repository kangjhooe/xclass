import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('data_pokok')
export class DataPokok {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  instansiId: number;

  @Column({ nullable: true })
  npsn: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  type: string; // 'sd', 'smp', 'sma', 'smk', etc.

  @Column({ nullable: true })
  jenjang: string; // 'SD', 'SMP', 'SMA', 'SMK'

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ nullable: true })
  village: string;

  @Column({ nullable: true })
  subDistrict: string;

  @Column({ nullable: true })
  district: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  province: string;

  @Column({ nullable: true })
  postalCode: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  website: string;

  @Column({ nullable: true })
  principalName: string;

  @Column({ nullable: true })
  principalNip: string;

  @Column({ nullable: true })
  principalPhone: string;

  @Column({ nullable: true })
  principalEmail: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  vision: string;

  @Column({ type: 'text', nullable: true })
  mission: string;

  @Column({ nullable: true })
  accreditation: string;

  @Column({ type: 'date', nullable: true })
  accreditationDate: Date;

  @Column({ nullable: true })
  licenseNumber: string;

  @Column({ type: 'date', nullable: true })
  licenseDate: Date;

  @Column({ type: 'date', nullable: true })
  establishedDate: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

