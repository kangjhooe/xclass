import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { Position } from './position.entity';
import { Department } from './department.entity';
import { Payroll } from './payroll.entity';
import { EmployeeAttendance } from './employee-attendance.entity';
// import { PerformanceReview } from './performance-review.entity';

@Entity('employees')
export class Employee {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  instansiId: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  employeeNumber: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ nullable: true })
  positionId: number;

  @Column({ nullable: true })
  departmentId: number;

  @Column({ type: 'date', nullable: true })
  hireDate: Date;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  salary: number;

  @Column({
    type: 'enum',
    enum: ['active', 'inactive', 'terminated'],
    default: 'active',
  })
  status: string;

  @Column({ nullable: true })
  createdBy: number;

  @Column({ nullable: true })
  updatedBy: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @ManyToOne(() => Position, (position) => position.employees)
  @JoinColumn({ name: 'position_id' })
  position: Position;

  @ManyToOne(() => Department, (department) => department.employees)
  @JoinColumn({ name: 'department_id' })
  department: Department;

  @OneToMany(() => Payroll, (payroll) => payroll.employee)
  payrolls: Payroll[];

  @OneToMany(() => EmployeeAttendance, (attendance) => attendance.employee)
  attendances: EmployeeAttendance[];

  // @OneToMany(() => PerformanceReview, (review) => review.employee)
  // performanceReviews: PerformanceReview[];
}

