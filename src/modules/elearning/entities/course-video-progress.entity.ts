import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';
import { CourseVideo } from './course-video.entity';
import { Student } from '../../students/entities/student.entity';

@Entity('course_video_progress')
@Unique(['videoId', 'studentId'])
export class CourseVideoProgress {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  videoId: number;

  @Column()
  studentId: number;

  @Column({ type: 'int', default: 0 })
  currentTime: number;

  @Column({ type: 'int', nullable: true })
  duration: number;

  @Column({ default: false })
  isCompleted: boolean;

  @Column({ type: 'date', nullable: true })
  completedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => CourseVideo, (video) => video.progresses, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'video_id' })
  video: CourseVideo;

  @ManyToOne(() => Student, (student) => student.courseVideoProgresses, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'student_id' })
  student: Student;
}

