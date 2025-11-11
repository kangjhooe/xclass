import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { IncomingLetter } from './incoming-letter.entity';
import { OutgoingLetter } from './outgoing-letter.entity';

@Entity('letter_activity_logs')
export class LetterActivityLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  instansiId: number;

  @Column({
    type: 'enum',
    enum: ['incoming', 'outgoing'],
  })
  letterType: string;

  @Column()
  letterId: number;

  @Column()
  action: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  userId: number;

  @Column({ nullable: true })
  ipAddress: string;

  @Column({ nullable: true })
  userAgent: string;

  @Column({ type: 'json', nullable: true })
  oldValues: any;

  @Column({ type: 'json', nullable: true })
  newValues: any;

  @CreateDateColumn()
  createdAt: Date;

  // Relasi tanpa foreign key constraint karena letter_id bisa merujuk ke incoming_letters atau outgoing_letters
  // tergantung nilai letterType (polymorphic relationship)
  @ManyToOne(() => IncomingLetter, (letter) => letter.activityLogs, {
    nullable: true,
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'letter_id' })
  incomingLetter: IncomingLetter;

  @ManyToOne(() => OutgoingLetter, (letter) => letter.activityLogs, {
    nullable: true,
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'letter_id' })
  outgoingLetter: OutgoingLetter;
}

