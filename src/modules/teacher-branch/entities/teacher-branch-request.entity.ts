import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Teacher } from '../../teachers/entities/teacher.entity';

export enum BranchRequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  COMPLETED = 'completed',
}

@Entity('teacher_branch_requests')
export class TeacherBranchRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  teacherId: number;

  @Column()
  fromTenantId: number; // Tenant induk (dimana guru aktif)

  @Column()
  toTenantId: number; // Tenant cabang (tujuan)

  @Column({
    type: 'enum',
    enum: BranchRequestStatus,
    default: BranchRequestStatus.PENDING,
  })
  status: BranchRequestStatus;

  @Column({ type: 'text', nullable: true })
  reason: string;

  @Column({ type: 'text', nullable: true })
  rejectionReason: string;

  @Column({ nullable: true })
  processedBy: number;

  @Column({ type: 'timestamp', nullable: true })
  processedAt: Date;

  @Column({ type: 'json', nullable: true })
  teacherData: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ nullable: true })
  initiatedByTenantId: number; // Tenant yang initiate request

  @Column({ type: 'varchar', length: 20, default: 'push' })
  requestType: string; // 'push' = dari tenant induk, 'pull' = dari tenant cabang

  @Column({ type: 'date', nullable: true })
  branchDate: Date;

  @Column({ name: 'copy_question_banks', type: 'boolean', default: false })
  copyQuestionBanks: boolean; // Opsi untuk copy bank soal ke tenant baru

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Teacher, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'teacher_id' })
  teacher: Teacher;
}

