import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { InventoryMovement } from './inventory-movement.entity';
import { InventoryMaintenance } from './inventory-maintenance.entity';

export enum ItemStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  MAINTENANCE = 'maintenance',
  DAMAGED = 'damaged',
  LOST = 'lost',
  DISPOSED = 'disposed',
}

export enum ItemCondition {
  EXCELLENT = 'excellent',
  GOOD = 'good',
  FAIR = 'fair',
  POOR = 'poor',
  DAMAGED = 'damaged',
}

@Entity('inventory_items')
export class InventoryItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  itemCode: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  category: string;

  @Column({ nullable: true })
  subcategory: string;

  @Column({ nullable: true })
  brand: string;

  @Column({ nullable: true })
  model: string;

  @Column({ nullable: true })
  serialNumber: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  unit: string;

  @Column({ type: 'int', default: 0 })
  quantity: number;

  @Column({ type: 'int', default: 0 })
  minimumStock: number;

  @Column({ type: 'int', nullable: true })
  maximumStock: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  unitPrice: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalValue: number;

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true })
  room: string;

  @Column({ nullable: true })
  shelf: string;

  @Column({
    type: 'enum',
    enum: ItemStatus,
    default: ItemStatus.ACTIVE,
  })
  status: ItemStatus;

  @Column({
    type: 'enum',
    enum: ItemCondition,
    nullable: true,
  })
  condition: ItemCondition;

  @Column({ type: 'date', nullable: true })
  purchaseDate: Date;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  purchasePrice: number;

  @Column({ nullable: true })
  supplier: string;

  @Column({ type: 'date', nullable: true })
  warrantyExpiry: Date;

  @Column({ type: 'int', nullable: true })
  maintenanceSchedule: number; // in days

  @Column({ type: 'date', nullable: true })
  lastMaintenance: Date;

  @Column({ type: 'date', nullable: true })
  nextMaintenance: Date;

  @Column({ nullable: true })
  responsiblePerson: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'json', nullable: true })
  images: string[];

  @Column()
  instansiId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => InventoryMovement, (movement) => movement.item)
  movements: InventoryMovement[];

  @OneToMany(() => InventoryMaintenance, (maintenance) => maintenance.item)
  maintenanceRecords: InventoryMaintenance[];
}

