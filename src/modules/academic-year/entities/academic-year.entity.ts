import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum SemesterType {
  GANJIL = 'ganjil',
  GENAP = 'genap',
}

@Entity('academic_years')
export class AcademicYear {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  instansiId: number;

  @Column()
  name: string;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date' })
  endDate: Date;

  @Column({ default: false })
  isActive: boolean;

  @Column({ type: 'int', default: 1 })
  currentSemester: number;

  @Column({
    type: 'enum',
    enum: SemesterType,
    default: SemesterType.GANJIL,
  })
  currentSemesterType: SemesterType;

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

