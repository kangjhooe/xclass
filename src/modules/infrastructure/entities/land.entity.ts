import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Building } from './building.entity';

export enum LandOwnershipStatus {
  OWNED = 'milik_sendiri',
  LEASED = 'sewa',
  GRANT = 'hibah',
  OTHER = 'lainnya',
}

@Entity('lands')
export class Land {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  instansiId: number;

  @Column({ type: 'varchar', length: 150 })
  name: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  areaM2: number;

  @Column({
    type: 'enum',
    enum: LandOwnershipStatus,
  })
  ownershipStatus: LandOwnershipStatus;

  @Column({ type: 'varchar', length: 255, nullable: true })
  ownershipDocumentPath: string | null;

  @Column({ type: 'text', nullable: true })
  address: string | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Building, (building) => building.land)
  buildings: Building[];
}


