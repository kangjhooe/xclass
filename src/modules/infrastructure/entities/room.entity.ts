import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Building } from './building.entity';

export enum RoomUsageType {
  CLASSROOM = 'ruang_kelas',
  OFFICE = 'kantor',
  LAB = 'laboratorium',
  LIBRARY = 'perpustakaan',
  STORAGE = 'gudang',
  MULTIPURPOSE = 'aula',
  OTHER = 'lainnya',
}

export enum RoomCondition {
  GOOD = 'baik',
  MINOR_DAMAGE = 'rusak_ringan',
  MODERATE_DAMAGE = 'rusak_sedang',
  MAJOR_DAMAGE = 'rusak_berat',
  TOTAL_DAMAGE = 'rusak_total',
}

@Entity('rooms')
export class Room {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  instansiId: number;

  @Column()
  buildingId: number;

  @Column({ type: 'varchar', length: 150 })
  name: string;

  @Column({
    type: 'enum',
    enum: RoomUsageType,
  })
  usageType: RoomUsageType;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  areaM2: number;

  @Column({
    name: 'room_condition',
    type: 'enum',
    enum: RoomCondition,
  })
  condition: RoomCondition;

  @Column({ type: 'int' })
  floorNumber: number;

  @Column({ type: 'int', nullable: true })
  capacity: number | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Building, (building) => building.rooms, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'buildingId' })
  building: Building;
}


