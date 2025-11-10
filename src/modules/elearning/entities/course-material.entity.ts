import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Course } from './course.entity';

export enum MaterialType {
  PDF = 'pdf',
  POWERPOINT = 'powerpoint',
  IMAGE = 'image',
  LINK = 'link',
  DOCUMENT = 'document',
}

@Entity('course_materials')
export class CourseMaterial {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  courseId: number;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: MaterialType,
  })
  type: MaterialType;

  @Column({ type: 'text', nullable: true })
  fileUrl: string;

  @Column({ type: 'text', nullable: true })
  linkUrl: string;

  @Column({ type: 'int', default: 0 })
  order: number;

  @Column({ type: 'int', nullable: true })
  chapter: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Course, (course) => course.materials, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'course_id' })
  course: Course;
}

