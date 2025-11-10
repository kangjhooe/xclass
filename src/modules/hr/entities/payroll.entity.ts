import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Employee } from './employee.entity';
import { PayrollItem } from './payroll-item.entity';

@Entity('payrolls')
export class Payroll {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  instansiId: number;

  @Column()
  employeeId: number;

  @Column({
    type: 'enum',
    enum: ['employee', 'teacher', 'staff'],
    default: 'employee',
  })
  employeeType: string;

  @Column({ type: 'date' })
  payrollDate: Date;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  basicSalary: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalAllowances: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalDeductions: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  netSalary: number;

  @Column({
    type: 'enum',
    enum: ['pending', 'approved', 'paid', 'cancelled'],
    default: 'pending',
  })
  status: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ nullable: true })
  createdBy: number;

  @Column({ nullable: true })
  updatedBy: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Employee, (employee) => employee.payrolls)
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  @OneToMany(() => PayrollItem, (item) => item.payroll, { cascade: true })
  items: PayrollItem[];
}

