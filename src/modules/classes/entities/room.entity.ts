import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ClassRoom } from './class-room.entity';

@Entity('rooms')
export class Room {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  type: string; // 'classroom', 'facility', etc.

  @Column({ nullable: true })
  building: string;

  @Column({ nullable: true })
  floor: string;

  @Column({ type: 'int', nullable: true })
  capacity: number;

  @Column({ default: 'active' })
  status: string;

  @Column()
  instansiId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => ClassRoom, (classRoom) => classRoom.room)
  classRooms: ClassRoom[];
}

