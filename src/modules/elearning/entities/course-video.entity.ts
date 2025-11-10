import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Course } from './course.entity';
import { CourseVideoProgress } from './course-video-progress.entity';

export enum VideoSource {
  YOUTUBE = 'youtube',
  VIMEO = 'vimeo',
  SELF_HOSTED = 'self_hosted',
}

@Entity('course_videos')
export class CourseVideo {
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
    enum: VideoSource,
  })
  source: VideoSource;

  @Column({ type: 'text', nullable: true })
  videoUrl: string;

  @Column({ type: 'text', nullable: true })
  videoId: string;

  @Column({ type: 'int', nullable: true })
  duration: number;

  @Column({ type: 'text', nullable: true })
  thumbnail: string;

  @Column({ type: 'text', nullable: true })
  subtitleUrl: string;

  @Column({ type: 'int', default: 0 })
  order: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Course, (course) => course.videos, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'course_id' })
  course: Course;

  @OneToMany(() => CourseVideoProgress, (progress) => progress.video)
  progresses: CourseVideoProgress[];
}

