import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { InventoryItem } from './inventory-item.entity';

export enum MaintenanceType {
  PREVENTIVE = 'preventive',
  CORRECTIVE = 'corrective',
  EMERGENCY = 'emergency',
  UPGRADE = 'upgrade',
}

export enum MaintenanceStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('inventory_maintenances')
export class InventoryMaintenance {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  itemId: number;

  @Column({
    type: 'enum',
    enum: MaintenanceType,
  })
  maintenanceType: MaintenanceType;

  @Column({ type: 'date' })
  maintenanceDate: Date;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  cost: number;

  @Column({ nullable: true })
  technician: string;

  @Column({ nullable: true })
  technicianContact: string;

  @Column({
    type: 'enum',
    enum: MaintenanceStatus,
    default: MaintenanceStatus.SCHEDULED,
  })
  status: MaintenanceStatus;

  @Column({ type: 'date', nullable: true })
  completionDate: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'date', nullable: true })
  nextMaintenanceDate: Date;

  @Column({ nullable: true })
  createdBy: number;

  @Column()
  instansiId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => InventoryItem, (item) => item.maintenanceRecords)
  @JoinColumn({ name: 'item_id' })
  item: InventoryItem;
}

