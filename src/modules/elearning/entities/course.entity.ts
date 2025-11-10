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
import { Subject } from '../../subjects/entities/subject.entity';
import { ClassRoom } from '../../classes/entities/class-room.entity';
import { Teacher } from '../../teachers/entities/teacher.entity';
import { CourseEnrollment } from './course-enrollment.entity';
import { CourseMaterial } from './course-material.entity';
import { CourseVideo } from './course-video.entity';
import { CourseAssignment } from './course-assignment.entity';
import { CourseQuiz } from './course-quiz.entity';
import { CourseProgress } from './course-progress.entity';
import { CourseAnnouncement } from './course-announcement.entity';

export enum CourseStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  syllabus: string;

  @Column({ nullable: true })
  level: string;

  @Column({ nullable: true })
  category: string;

  @Column({
    type: 'enum',
    enum: CourseStatus,
    default: CourseStatus.DRAFT,
  })
  status: CourseStatus;

  @Column({ nullable: true })
  subjectId: number;

  @Column({ nullable: true })
  classId: number;

  @Column()
  teacherId: number;

  @Column()
  instansiId: number;

  @Column({ type: 'int', default: 0 })
  order: number;

  @Column({ type: 'text', nullable: true })
  thumbnail: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Subject, { nullable: true })
  @JoinColumn({ name: 'subject_id' })
  subject: Subject;

  @ManyToOne(() => ClassRoom, { nullable: true })
  @JoinColumn({ name: 'class_id' })
  classRoom: ClassRoom;

  @ManyToOne(() => Teacher)
  @JoinColumn({ name: 'teacher_id' })
  teacher: Teacher;

  @OneToMany(() => CourseEnrollment, (enrollment) => enrollment.course)
  enrollments: CourseEnrollment[];

  @OneToMany(() => CourseMaterial, (material) => material.course)
  materials: CourseMaterial[];

  @OneToMany(() => CourseVideo, (video) => video.course)
  videos: CourseVideo[];

  @OneToMany(() => CourseAssignment, (assignment) => assignment.course)
  assignments: CourseAssignment[];

  @OneToMany(() => CourseQuiz, (quiz) => quiz.course)
  quizzes: CourseQuiz[];

  @OneToMany(() => CourseProgress, (progress) => progress.course)
  progresses: CourseProgress[];

  @OneToMany(() => CourseAnnouncement, (announcement) => announcement.course)
  announcements: CourseAnnouncement[];
}

