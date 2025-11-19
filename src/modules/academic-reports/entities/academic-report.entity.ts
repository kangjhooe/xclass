import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum ReportType {
  STUDENT_GRADE = 'student_grade',
  CLASS_SUMMARY = 'class_summary',
  ATTENDANCE_REPORT = 'attendance_report',
  FINAL_REPORT = 'final_report',
  TRANSCRIPT = 'transcript',
}

@Entity('academic_reports')
@Index(['instansiId', 'report_type'])
@Index(['instansiId', 'created_at'])
export class AcademicReport {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  instansiId: number;

  @Column({
    type: 'enum',
    enum: ReportType,
  })
  report_type: ReportType;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'int', nullable: true })
  academic_year_id: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  academic_year_name: string;

  @Column({ type: 'int', nullable: true })
  class_id: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  class_name: string;

  @Column({ type: 'int', nullable: true })
  student_id: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  student_name: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  period: string;

  @Column({ type: 'text', nullable: true })
  file_url: string;

  @Column({ type: 'text', nullable: true })
  file_path: string;

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'timestamp', nullable: true })
  generated_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

