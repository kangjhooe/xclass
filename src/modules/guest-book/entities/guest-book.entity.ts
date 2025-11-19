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
  identity_number: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  institution: string;

  @Column({ type: 'text', nullable: true })
  purpose: string;

  @Column({ type: 'datetime', nullable: true })
  check_in: Date;

  @Column({ type: 'datetime', nullable: true })
  check_out: Date;

  @Column({ 
    type: 'varchar',
    length: 20,
    default: 'checked_in'
  })
  status: 'checked_in' | 'checked_out';

  // Legacy fields untuk backward compatibility
  @Column({ type: 'datetime', nullable: true })
  visitDate: Date;

  @Column({ type: 'time', nullable: true })
  visitTime: string;

  @Column({ type: 'time', nullable: true })
  leaveTime: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  photo_url?: string;

  @Column({ nullable: true })
  created_by: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

