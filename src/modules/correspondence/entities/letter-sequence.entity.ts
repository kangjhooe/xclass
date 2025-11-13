import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';

export enum SequenceResetPeriod {
  NONE = 'none',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
}

@Entity('letter_sequences')
@Unique(['instansiId', 'code'])
export class LetterSequence {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  instansiId: number;

  @Column()
  code: string;

  @Column()
  name: string;

  @Column({ default: '{{counter}}/{{month_roman}}/{{year}}' })
  pattern: string;

  @Column({ type: 'int', default: 0 })
  counter: number;

  @Column({ type: 'int', default: 3 })
  padding: number;

  @Column({
    type: 'enum',
    enum: SequenceResetPeriod,
    default: SequenceResetPeriod.YEARLY,
  })
  resetPeriod: SequenceResetPeriod;

  @Column({ type: 'date', nullable: true })
  lastResetAt: Date | null;

  @Column({ nullable: true })
  description?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}


