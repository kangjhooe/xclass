import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Payroll } from './payroll.entity';

@Entity('payroll_items')
export class PayrollItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  payrollId: number;

  @Column()
  name: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({
    type: 'enum',
    enum: ['allowance', 'deduction'],
  })
  type: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Payroll, (payroll) => payroll.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'payroll_id' })
  payroll: Payroll;
}

