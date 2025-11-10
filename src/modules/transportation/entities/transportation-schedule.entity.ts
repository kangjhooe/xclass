import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TransportationRoute } from './transportation-route.entity';

@Entity('transportation_schedules')
export class TransportationSchedule {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  instansiId: number;

  @Column()
  routeId: number;

  @Column({ type: 'time' })
  departureTime: string;

  @Column({ type: 'time' })
  arrivalTime: string;

  @Column({ type: 'int', nullable: true })
  currentPassengers: number;

  @Column({
    type: 'enum',
    enum: ['scheduled', 'in_transit', 'completed', 'cancelled'],
    default: 'scheduled',
  })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => TransportationRoute, (route) => route.schedules)
  @JoinColumn({ name: 'route_id' })
  route: TransportationRoute;
}

