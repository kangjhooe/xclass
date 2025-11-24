import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Province } from './province.entity';
import { District } from './district.entity';

@Entity('regencies')
export class Regency {
  @PrimaryColumn({ type: 'varchar', length: 5 })
  code: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 2 })
  provinceCode: string;

  @ManyToOne(() => Province, (province) => province.regencies)
  @JoinColumn({ name: 'provinceCode' })
  province?: Province;

  @OneToMany(() => District, (district) => district.regency)
  districts: District[];
}

