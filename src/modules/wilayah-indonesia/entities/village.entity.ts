import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { District } from './district.entity';

@Entity('villages')
export class Village {
  @PrimaryColumn({ type: 'varchar', length: 13 })
  code: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 8 })
  districtCode: string;

  @ManyToOne(() => District, (district) => district.villages)
  @JoinColumn({ name: 'districtCode' })
  district: District;
}

