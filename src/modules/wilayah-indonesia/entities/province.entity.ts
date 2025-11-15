import {
  Entity,
  PrimaryColumn,
  Column,
  OneToMany,
} from 'typeorm';
import { Regency } from './regency.entity';

@Entity('provinces')
export class Province {
  @PrimaryColumn({ type: 'varchar', length: 2 })
  code: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @OneToMany(() => Regency, (regency) => regency.province)
  regencies: Regency[];
}

