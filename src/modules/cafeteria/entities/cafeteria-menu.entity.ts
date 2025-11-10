import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CafeteriaOrderItem } from './cafeteria-order-item.entity';

@Entity('cafeteria_menus')
export class CafeteriaMenu {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  instansiId: number;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: ['food', 'drink', 'snack'],
  })
  category: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  price: number;

  @Column({ type: 'int', nullable: true })
  stock: number;

  @Column({ default: true })
  isAvailable: boolean;

  @Column({ nullable: true })
  image: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => CafeteriaOrderItem, (orderItem) => orderItem.menu)
  orderItems: CafeteriaOrderItem[];
}

