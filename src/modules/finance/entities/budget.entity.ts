import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum BudgetCategory {
  OPERATIONAL = 'operational',           // Operasional
  SALARY = 'salary',                     // Gaji
  FACILITY = 'facility',                 // Fasilitas
  ACTIVITY = 'activity',                 // Kegiatan
  MAINTENANCE = 'maintenance',           // Maintenance
  UTILITIES = 'utilities',               // Listrik, Air, Internet
  SUPPLIES = 'supplies',                 // Perlengkapan
  EDUCATION = 'education',               // Pendidikan
  INFRASTRUCTURE = 'infrastructure',     // Infrastruktur
  OTHER = 'other',                       // Lainnya
}

export enum BudgetPeriod {
  MONTHLY = 'monthly',                   // Bulanan
  QUARTERLY = 'quarterly',               // Triwulan
  SEMESTER = 'semester',                 // Semester
  YEARLY = 'yearly',                     // Tahunan
}

export enum BudgetStatus {
  DRAFT = 'draft',                       // Draft
  APPROVED = 'approved',                 // Disetujui
  ACTIVE = 'active',                      // Aktif
  COMPLETED = 'completed',               // Selesai
  CANCELLED = 'cancelled',               // Dibatalkan
}

@Entity('budgets')
export class Budget {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: BudgetCategory,
  })
  category: BudgetCategory;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  plannedAmount: number; // Anggaran yang direncanakan

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  actualAmount: number; // Jumlah yang sudah digunakan

  @Column({
    type: 'enum',
    enum: BudgetPeriod,
  })
  period: BudgetPeriod;

  @Column({ type: 'int' })
  periodValue: number; // Nilai periode (bulan ke-, triwulan ke-, semester ke-, tahun)

  @Column({ type: 'int' })
  year: number; // Tahun anggaran

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date' })
  endDate: Date;

  @Column({
    type: 'enum',
    enum: BudgetStatus,
    default: BudgetStatus.DRAFT,
  })
  status: BudgetStatus;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ nullable: true })
  approvedBy: number; // User yang menyetujui

  @Column({ type: 'datetime', nullable: true })
  approvedAt: Date;

  @Column({ nullable: true })
  createdBy: number;

  @Column()
  instansiId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

