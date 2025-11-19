import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { CafeteriaOrderItem } from './cafeteria-order-item.entity';
import { CafeteriaOutlet } from './cafeteria-outlet.entity';

@Entity('cafeteria_menus')
export class CafeteriaMenu {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  instansiId: number;

  @Column({ name: 'canteen_id', nullable: true })
  canteenId: number;

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

  @ManyToOne(() => CafeteriaOutlet, (canteen) => canteen.menus, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'canteen_id' })
  canteen: CafeteriaOutlet;
}

