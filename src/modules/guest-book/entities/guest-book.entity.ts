import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('guest_books')
export class GuestBook {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  instansiId: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  institution: string;

  @Column({ type: 'text', nullable: true })
  purpose: string;

  @Column({ type: 'datetime' })
  visitDate: Date;

  @Column({ type: 'time', nullable: true })
  visitTime: string;

  @Column({ type: 'time', nullable: true })
  leaveTime: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

