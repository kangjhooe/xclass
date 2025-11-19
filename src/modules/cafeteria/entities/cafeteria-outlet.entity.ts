import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CafeteriaMenu } from './cafeteria-menu.entity';
import { CafeteriaOrder } from './cafeteria-order.entity';

@Entity('cafeteria_outlets')
export class CafeteriaOutlet {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  instansiId: number;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true })
  contactPerson: string;

  @Column({ nullable: true })
  contactPhone: string;

  @Column({ nullable: true })
  openingHours: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => CafeteriaMenu, (menu) => menu.canteen)
  menus: CafeteriaMenu[];

  @OneToMany(() => CafeteriaOrder, (order) => order.canteen)
  orders: CafeteriaOrder[];
}


