import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Regency } from './regency.entity';
import { Village } from './village.entity';

@Entity('districts')
export class District {
  @PrimaryColumn({ type: 'varchar', length: 8 })
  code: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 5 })
  regencyCode: string;

  @ManyToOne(() => Regency, (regency) => regency.districts)
  @JoinColumn({ name: 'regencyCode' })
  regency: Regency;

  @OneToMany(() => Village, (village) => village.district)
  villages: Village[];
}

