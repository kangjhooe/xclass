import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum PPDBFormStatus {
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  WAITLISTED = 'waitlisted',
}

@Entity('ppdb_forms')
@Index(['instansiId', 'status'])
@Index(['instansiId', 'createdAt'])
@Index(['email'])
@Index(['phone'])
export class PPDBForm {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  instansiId: number;

  // Student Information
  @Column()
  studentName: string;

  @Column()
  studentNIK: string;

  @Column({ type: 'date' })
  studentBirthDate: Date;

  @Column()
  studentBirthPlace: string;

  @Column()
  studentGender: string;

  @Column()
  studentAddress: string;

  // Parent Information
  @Column()
  parentName: string;

  @Column()
  parentPhone: string;

  @Column()
  parentEmail: string;

  @Column({ nullable: true })
  parentOccupation: string;

  // Application Information
  @Column()
  desiredClass: string; // Class yang diinginkan

  @Column({ nullable: true })
  previousSchool: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ default: PPDBFormStatus.SUBMITTED })
  status: PPDBFormStatus;

  @Column({ type: 'text', nullable: true })
  reviewNotes: string;

  @Column({ type: 'timestamp', nullable: true })
  reviewedAt: Date;

  @Column({ nullable: true })
  reviewedBy: number; // User ID

  @Column({ type: 'json', nullable: true })
  documents: Record<string, string>; // Document paths (KTP, KK, dll)

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

