
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
import { Student } from '../../students/entities/student.entity';
import { CafeteriaOrderItem } from './cafeteria-order-item.entity';
import { CafeteriaPayment } from './cafeteria-payment.entity';
import { CafeteriaOutlet } from './cafeteria-outlet.entity';

@Entity('cafeteria_orders')
export class CafeteriaOrder {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  instansiId: number;

  @Column({ name: 'canteen_id', nullable: true })
  canteenId: number;

  @Column()
  studentId: number;

  @Column({
    type: 'enum',
    enum: ['pending', 'preparing', 'ready', 'completed', 'cancelled'],
    default: 'pending',
  })
  status: string;

  @Column({
    type: 'enum',
    enum: ['unpaid', 'paid', 'refunded'],
    default: 'unpaid',
  })
  paymentStatus: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalAmount: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Student, (student) => student.cafeteriaOrders)
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @OneToMany(() => CafeteriaOrderItem, (orderItem) => orderItem.order, {
    cascade: true,
  })
  orderItems: CafeteriaOrderItem[];

  @OneToMany(() => CafeteriaPayment, (payment) => payment.order)
  payments: CafeteriaPayment[];

  @ManyToOne(() => CafeteriaOutlet, (canteen) => canteen.orders, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'canteen_id' })
  canteen: CafeteriaOutlet;
}

