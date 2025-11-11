import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Land } from './land.entity';
import { Room } from './room.entity';

@Entity('buildings')
export class Building {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  instansiId: number;

  @Column()
  landId: number;

  @Column({ type: 'varchar', length: 150 })
  name: string;

  @Column({ type: 'int' })
  floorCount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  lengthM: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  widthM: number;

  @Column({ type: 'int' })
  builtYear: number;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Land, (land) => land.buildings, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'landId' })
  land: Land;

  @OneToMany(() => Room, (room) => room.building)
  rooms: Room[];
}


