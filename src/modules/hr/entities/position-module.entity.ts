import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Position } from './position.entity';

@Entity('position_modules')
@Index(['positionId', 'moduleKey'], { unique: true })
export class PositionModule {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'position_id' })
  positionId: number;

  @ManyToOne(() => Position, (position) => position.positionModules, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'position_id' })
  position: Position;

  @Column({ name: 'module_key', type: 'varchar', length: 100 })
  moduleKey: string;

  @Column({ name: 'module_name', type: 'varchar', length: 255 })
  moduleName: string;

  @Column({ name: 'can_view', type: 'boolean', default: true })
  canView: boolean;

  @Column({ name: 'can_create', type: 'boolean', default: false })
  canCreate: boolean;

  @Column({ name: 'can_update', type: 'boolean', default: false })
  canUpdate: boolean;

  @Column({ name: 'can_delete', type: 'boolean', default: false })
  canDelete: boolean;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

