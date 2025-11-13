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
import { ClassRoom } from '../../classes/entities/class-room.entity';
import { Attendance } from '../../attendance/entities/attendance.entity';
import { StudentGrade } from '../../grades/entities/student-grade.entity';
import { HealthRecord } from '../../health/entities/health-record.entity';
import { DisciplinaryAction } from '../../discipline/entities/disciplinary-action.entity';
import { CounselingSession } from '../../counseling/entities/counseling-session.entity';
import { ExtracurricularParticipant } from '../../extracurricular/entities/extracurricular-participant.entity';
import { CourseEnrollment } from '../../elearning/entities/course-enrollment.entity';
import { CourseProgress } from '../../elearning/entities/course-progress.entity';
import { ExamAttempt } from '../../exams/entities/exam-attempt.entity';
import { Alumni } from '../../alumni/entities/alumni.entity';
import { Graduation } from '../../graduation/entities/graduation.entity';
import { StudentTransfer } from '../../student-transfer/entities/student-transfer.entity';

@Entity('students')
export class Student {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 8, nullable: true })
  npsn: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ type: 'date', nullable: true })
  birthDate: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  birthPlace: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  gender: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  religion: string;

  @Column({ nullable: true })
  classId: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  studentNumber: string;

  @Column({ type: 'varchar', length: 20, nullable: true, unique: true })
  nisn: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  parentName: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  parentPhone: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  parentEmail: string;

  @Column({ default: true })
  isActive: boolean;

  @Column()
  instansiId: number;

  @Column({ type: 'varchar', length: 16, nullable: true })
  nik: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  nationality: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  ethnicity: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  language: string;

  @Column({ type: 'varchar', length: 5, nullable: true })
  bloodType: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  disabilityType: string;

  @Column({ type: 'text', nullable: true })
  disabilityDescription: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  rt: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  rw: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  village: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  subDistrict: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  district: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  province: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  postalCode: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  residenceType: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  transportation: string;

  @Column({ type: 'text', nullable: true })
  previousSchool: string;

  @Column({ type: 'text', nullable: true })
  previousSchoolAddress: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  previousSchoolCity: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  previousSchoolProvince: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  previousSchoolPhone: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  previousSchoolPrincipal: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  previousSchoolGraduationYear: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  previousSchoolCertificateNumber: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  fatherName: string;

  @Column({ type: 'varchar', length: 16, nullable: true })
  fatherNik: string;

  @Column({ type: 'date', nullable: true })
  fatherBirthDate: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  fatherBirthPlace: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  fatherEducation: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  fatherOccupation: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  fatherCompany: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  fatherPhone: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  fatherEmail: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  fatherIncome: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  motherName: string;

  @Column({ type: 'varchar', length: 16, nullable: true })
  motherNik: string;

  @Column({ type: 'date', nullable: true })
  motherBirthDate: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  motherBirthPlace: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  motherEducation: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  motherOccupation: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  motherCompany: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  motherPhone: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  motherEmail: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  motherIncome: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  guardianName: string;

  @Column({ type: 'varchar', length: 16, nullable: true })
  guardianNik: string;

  @Column({ type: 'date', nullable: true })
  guardianBirthDate: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  guardianBirthPlace: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  guardianEducation: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  guardianOccupation: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  guardianCompany: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  guardianPhone: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  guardianEmail: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  guardianIncome: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  guardianRelationship: string;

  @Column({ type: 'int', nullable: true })
  height: number;

  @Column({ type: 'int', nullable: true })
  weight: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  healthCondition: string;

  @Column({ type: 'text', nullable: true })
  healthNotes: string;

  @Column({ type: 'text', nullable: true })
  allergies: string;

  @Column({ type: 'text', nullable: true })
  medications: string;

  @Column({ type: 'date', nullable: true })
  enrollmentDate: Date;

  @Column({ type: 'varchar', length: 20, nullable: true })
  enrollmentSemester: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  enrollmentYear: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  studentStatus: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  academicLevel: string; // 'SD', 'SMP', 'SMA', 'SMK'

  @Column({ type: 'varchar', length: 10, nullable: true })
  currentGrade: string; // '1', '2', '3', '4', '5', '6' untuk SD, '7', '8', '9' untuk SMP, '10', '11', '12' untuk SMA

  @Column({ type: 'varchar', length: 10, nullable: true })
  academicYear: string; // Tahun ajaran saat ini, e.g., '2024/2025'

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  emergencyContactName: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  emergencyContactPhone: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  emergencyContactRelationship: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => ClassRoom, (classRoom) => classRoom.students)
  @JoinColumn({ name: 'class_id' })
  classRoom: ClassRoom;

  @OneToMany(() => Attendance, (attendance) => attendance.student)
  attendances: Attendance[];

  @OneToMany(() => StudentGrade, (grade) => grade.student)
  grades: StudentGrade[];

  @OneToMany(() => HealthRecord, (healthRecord) => healthRecord.student)
  healthRecords: HealthRecord[];

  @OneToMany(() => DisciplinaryAction, (disciplinaryAction) => disciplinaryAction.student)
  disciplinaryActions: DisciplinaryAction[];

  @OneToMany(() => CounselingSession, (counselingSession) => counselingSession.student)
  counselingSessions: CounselingSession[];

  @OneToMany(() => ExtracurricularParticipant, (participant) => participant.student)
  extracurricularParticipants: ExtracurricularParticipant[];

  @OneToMany(() => CourseEnrollment, (enrollment) => enrollment.student)
  courseEnrollments: CourseEnrollment[];

  @OneToMany(() => CourseProgress, (progress) => progress.student)
  courseProgresses: CourseProgress[];

  @OneToMany(() => ExamAttempt, (examAttempt) => examAttempt.student)
  examAttempts: ExamAttempt[];

  @OneToMany(() => Alumni, (alumni) => alumni.student)
  alumniRecords: Alumni[];

  @OneToMany(() => Graduation, (graduation) => graduation.student)
  graduations: Graduation[];

  @OneToMany(() => StudentTransfer, (transfer) => transfer.student)
  transfers: StudentTransfer[];
}

