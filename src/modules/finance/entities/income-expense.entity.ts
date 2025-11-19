import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum TransactionType {
  INCOME = 'income',    // Pemasukan
  EXPENSE = 'expense',  // Pengeluaran
}

export enum IncomeCategory {
  DONATION = 'donation',              // Donasi
  SPONSOR = 'sponsor',                // Sponsor
  ACTIVITY_REVENUE = 'activity_revenue', // Hasil Kegiatan
  TUITION = 'tuition',                // Uang Pangkal/SPP
  GRANT = 'grant',                    // Bantuan Pemerintah
  OTHER_INCOME = 'other_income',      // Pemasukan Lainnya
}

export enum ExpenseCategory {
  SALARY = 'salary',                  // Gaji
  OPERATIONAL = 'operational',        // Operasional
  MAINTENANCE = 'maintenance',        // Maintenance
  UTILITIES = 'utilities',            // Listrik, Air, Internet
  SUPPLIES = 'supplies',              // Perlengkapan
  ACTIVITY = 'activity',              // Kegiatan
  FACILITY = 'facility',              // Fasilitas
  OTHER_EXPENSE = 'other_expense',    // Pengeluaran Lainnya
}

@Entity('income_expenses')
export class IncomeExpense {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: TransactionType,
  })
  transactionType: TransactionType;

  @Column({ type: 'varchar', length: 100, nullable: true })
  category: string; // IncomeCategory atau ExpenseCategory

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({ type: 'date' })
  transactionDate: Date;

  @Column({ nullable: true })
  referenceNumber: string;

  @Column({ nullable: true })
  receiptFile: string;

  @Column({ nullable: true })
  vendor: string; // Untuk pengeluaran

  @Column({ nullable: true })
  recipient: string; // Untuk pemasukan

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ nullable: true })
  createdBy: number;

  @Column()
  instansiId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

