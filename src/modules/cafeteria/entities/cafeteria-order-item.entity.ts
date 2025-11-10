
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { CafeteriaOrder } from './cafeteria-order.entity';
import { CafeteriaMenu } from './cafeteria-menu.entity';

@Entity('cafeteria_order_items')
export class CafeteriaOrderItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  orderId: number;

  @Column()
  menuId: number;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  price: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  subtotal: number;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => CafeteriaOrder, (order) => order.orderItems, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'order_id' })
  order: CafeteriaOrder;

  @ManyToOne(() => CafeteriaMenu, (menu) => menu.orderItems)
  @JoinColumn({ name: 'menu_id' })
  menu: CafeteriaMenu;
}

