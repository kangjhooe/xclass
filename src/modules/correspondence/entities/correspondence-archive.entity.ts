import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum ArchiveSourceType {
  INCOMING = 'incoming',
  OUTGOING = 'outgoing',
  GENERATED = 'generated',
}

@Entity('correspondence_archive')
@Index(['instansiId', 'sourceType', 'sourceId'], { unique: true })
export class CorrespondenceArchive {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  instansiId: number;

  @Column({
    type: 'enum',
    enum: ArchiveSourceType,
  })
  sourceType: ArchiveSourceType;

  @Column()
  sourceId: number;

  @Column({ nullable: true })
  referenceNumber: string;

  @Column()
  subject: string;

  @Column({ nullable: true })
  category: string;

  @Column({ nullable: true })
  fromName: string;

  @Column({ nullable: true })
  toName: string;

  @Column({ type: 'date', nullable: true })
  letterDate: Date | null;

  @Column({ nullable: true })
  status: string;

  @Column({ nullable: true })
  type: string;

  @Column({ nullable: true })
  filePath: string;

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}


