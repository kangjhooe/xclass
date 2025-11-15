import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToMany,
  JoinTable,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ClassRoom } from '../../classes/entities/class-room.entity';
import { Schedule } from '../../schedules/entities/schedule.entity';
import { Subject } from '../../subjects/entities/subject.entity';
import { StudentGrade } from '../../grades/entities/student-grade.entity';
import { Attendance } from '../../attendance/entities/attendance.entity';
import { DisciplinaryAction } from '../../discipline/entities/disciplinary-action.entity';
import { CounselingSession } from '../../counseling/entities/counseling-session.entity';
import { Card } from '../../card-management/entities/card.entity';
import { EventRegistration } from '../../events/entities/event-registration.entity';
import { BookLoan } from '../../library/entities/book-loan.entity';
import { CurriculumSchedule } from '../../curriculum/entities/curriculum-schedule.entity';
import { Question } from '../../exams/entities/question.entity';
import { QuestionBank } from '../../exams/entities/question-bank.entity';
import { QuestionShare } from '../../exams/entities/question-share.entity';
import { GradeConversion } from '../../exams/entities/grade-conversion.entity';
import { Stimulus } from '../../exams/entities/stimulus.entity';
import { ExamSchedule } from '../../exams/entities/exam-schedule.entity';

@Entity('teachers')
export class Teacher {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  employeeNumber: string;

  @Column({ nullable: true })
  nip: string;

  @Column({ nullable: true })
  nik: string;

  @Column({ nullable: true })
  nuptk: string;

  @Column({ nullable: true })
  gender: string;

  @Column({ type: 'date', nullable: true })
  birthDate: Date;

  @Column({ nullable: true })
  birthPlace: string;

  @Column({ nullable: true })
  address: string;

  // Data Pribadi Tambahan
  @Column({ name: 'page_id', nullable: true })
  pageId: string;

  @Column({ nullable: true })
  npk: string; // Nomor Pegawai Kepegawaian

  @Column({ name: 'mother_name', nullable: true })
  motherName: string; // Nama Ibu Kandung

  // Detail Alamat
  @Column({ nullable: true })
  province: string;

  @Column({ name: 'city_district', nullable: true })
  cityDistrict: string; // Kab./Kota

  @Column({ name: 'sub_district', nullable: true })
  subDistrict: string; // Kecamatan

  @Column({ nullable: true })
  village: string; // Desa/Kelurahan

  @Column({ name: 'postal_code', nullable: true })
  postalCode: string; // Kode Pos

  // Data Pendidikan
  @Column({ name: 'education_level', nullable: true })
  educationLevel: string; // Jenjang

  @Column({ name: 'study_program_group', nullable: true })
  studyProgramGroup: string; // Kelompok Program Studi

  @Column({ nullable: true })
  education: string; // Pendidikan Terakhir

  // Status Kepegawaian
  @Column({ name: 'employment_status_ptk', nullable: true })
  employmentStatusPtk: string; // Status Kepegawaian Personal/PTK

  @Column({ name: 'employment_status', nullable: true })
  employmentStatus: string; // PNS / Non-PNS

  @Column({ name: 'employment_rank', nullable: true })
  employmentRank: string; // Golongan

  @Column({ name: 'tmt_sk_cpns', type: 'date', nullable: true })
  tmtSkCpns: Date; // TMT SK CPNS

  @Column({ name: 'tmt_sk_awal', type: 'date', nullable: true })
  tmtSkAwal: Date; // TMT SK Awal

  @Column({ name: 'tmt_sk_terakhir', type: 'date', nullable: true })
  tmtSkTerakhir: Date; // TMT SK Terakhir

  @Column({ name: 'appointing_institution', nullable: true })
  appointingInstitution: string; // Instansi yang Mengangkat

  @Column({ name: 'assignment_status', nullable: true })
  assignmentStatus: string; // Status Penugasan

  @Column({ name: 'base_salary', type: 'decimal', precision: 15, scale: 2, nullable: true })
  baseSalary: number; // Gaji Pokok per Bulan (Rp)

  @Column({ name: 'work_location_status', nullable: true })
  workLocationStatus: string; // Status Tempat Tugas

  @Column({ name: 'satminkal_type', nullable: true })
  satminkalType: string; // Jenis Satminkal

  @Column({ name: 'satminkal_npsn', nullable: true })
  satminkalNpsn: string; // NPSN Satminkal

  @Column({ name: 'satminkal_identity', nullable: true })
  satminkalIdentity: string; // Identitas Satminkal

  @Column({ name: 'inpassing_status', nullable: true })
  inpassingStatus: string; // Status Inpassing

  @Column({ name: 'tmt_inpassing', type: 'date', nullable: true })
  tmtInpassing: Date; // TMT Inpassing

  // Tugas dan Mengajar
  @Column({ name: 'main_duty_educator', nullable: true })
  mainDutyEducator: string; // Tugas Utama sebagai Pendidik

  @Column({ name: 'additional_duty', nullable: true })
  additionalDuty: string; // Tugas Tambahan di Madrasah Ini

  @Column({ name: 'main_duty_school', nullable: true })
  mainDutySchool: string; // Tugas Utama di Madrasah Ini

  @Column({ name: 'main_subject', nullable: true })
  mainSubject: string; // Mapel Utama yang Diampu

  @Column({ name: 'total_teaching_hours', type: 'int', nullable: true })
  totalTeachingHours: number; // Total Jam Tatap Muka/Minggu

  @Column({ name: 'duty_type', nullable: true })
  dutyType: string; // Jenis Tugas

  @Column({ name: 'teaching_hours_equivalent', type: 'int', nullable: true })
  teachingHoursEquivalent: number; // Ekuivalensi Jam Tatap Muka

  @Column({ name: 'teach_other_school', type: 'boolean', default: false })
  teachOtherSchool: boolean; // Tugas Mengajar di Satuan Pendidikan Lain

  @Column({ name: 'other_work_location_type', nullable: true })
  otherWorkLocationType: string; // Jenis Tempat Tugas Lain

  @Column({ name: 'other_work_location_npsn', nullable: true })
  otherWorkLocationNpsn: string; // NPSN Tempat Tugas Lain

  @Column({ name: 'other_school_subject', nullable: true })
  otherSchoolSubject: string; // Mapel yang Diampu (di luar Madrasah)

  @Column({ name: 'other_school_hours', type: 'int', nullable: true })
  otherSchoolHours: number; // Jam Tatap Muka/Minggu (di luar Madrasah)

  // Informasi Sertifikasi
  @Column({ name: 'certification_participation_status', nullable: true })
  certificationParticipationStatus: string; // Status Kepesertaan

  @Column({ name: 'certification_pass_status', nullable: true })
  certificationPassStatus: string; // Status Kelulusan

  @Column({ name: 'certification_year', type: 'int', nullable: true })
  certificationYear: number; // Tahun Lulus

  @Column({ name: 'certified_subject', nullable: true })
  certifiedSubject: string; // Mapel yang Disertifikasi

  @Column({ nullable: true })
  nrg: string; // NRG

  @Column({ name: 'nrg_sk_number', nullable: true })
  nrgSkNumber: string; // Nomor SK NRG

  @Column({ name: 'nrg_sk_date', type: 'date', nullable: true })
  nrgSkDate: Date; // Tanggal SK NRG

  @Column({ name: 'certification_participant_number', nullable: true })
  certificationParticipantNumber: string; // Nomor Peserta Sertifikasi

  @Column({ name: 'certification_type', nullable: true })
  certificationType: string; // Jenis / Jalur Sertifikasi

  @Column({ name: 'certification_pass_date', type: 'date', nullable: true })
  certificationPassDate: Date; // Tanggal Kelulusan Sertifikasi

  @Column({ name: 'educator_certificate_number', nullable: true })
  educatorCertificateNumber: string; // Nomor Sertifikat Pendidik

  @Column({ name: 'certificate_issue_date', type: 'date', nullable: true })
  certificateIssueDate: Date; // Tanggal Penerbitan Sertifikat

  @Column({ name: 'lptk_name', nullable: true })
  lptkName: string; // Nama LPTK

  // Informasi Tunjangan
  @Column({ name: 'tpg_recipient_status', nullable: true })
  tpgRecipientStatus: string; // Status Penerima TPG

  @Column({ name: 'tpg_start_year', type: 'int', nullable: true })
  tpgStartYear: number; // Menerima TPG Mulai Tahun

  @Column({ name: 'tpg_amount', type: 'decimal', precision: 15, scale: 2, nullable: true })
  tpgAmount: number; // Besarnya TPG per Bulan (Rp)

  @Column({ name: 'tfg_recipient_status', nullable: true })
  tfgRecipientStatus: string; // Status Penerima TFG

  @Column({ name: 'tfg_start_year', type: 'int', nullable: true })
  tfgStartYear: number; // Menerima TFG Mulai Tahun

  @Column({ name: 'tfg_amount', type: 'decimal', precision: 15, scale: 2, nullable: true })
  tfgAmount: number; // Besarnya TFG per Bulan (Rp)

  // Penghargaan dan Pelatihan
  @Column({ name: 'has_received_award', type: 'boolean', default: false })
  hasReceivedAward: boolean; // Apakah Pernah Memperoleh Penghargaan?

  @Column({ name: 'highest_award', nullable: true })
  highestAward: string; // Penghargaan Tertinggi yang Pernah Diperoleh

  @Column({ name: 'award_field', nullable: true })
  awardField: string; // Bidang Penghargaan

  @Column({ name: 'award_level', nullable: true })
  awardLevel: string; // Tingkat Penghargaan

  @Column({ name: 'award_year', type: 'int', nullable: true })
  awardYear: number; // Tahun Perolehan Penghargaan

  @Column({ name: 'competency_training', type: 'text', nullable: true })
  competencyTraining: string; // Pelatihan Peningkatan Kompetensi

  @Column({ name: 'training_participation_1', nullable: true })
  trainingParticipation1: string; // Keikutsertaan Pelatihan (1)

  @Column({ name: 'training_year_1', type: 'int', nullable: true })
  trainingYear1: number; // Tahun Mengikuti (1)

  @Column({ name: 'training_participation_2', nullable: true })
  trainingParticipation2: string; // Keikutsertaan Pelatihan (2)

  @Column({ name: 'training_year_2', type: 'int', nullable: true })
  trainingYear2: number; // Tahun Mengikuti (2)

  @Column({ name: 'training_participation_3', nullable: true })
  trainingParticipation3: string; // Keikutsertaan Pelatihan (3)

  @Column({ name: 'training_year_3', type: 'int', nullable: true })
  trainingYear3: number; // Tahun Mengikuti (3)

  @Column({ name: 'training_participation_4', nullable: true })
  trainingParticipation4: string; // Keikutsertaan Pelatihan (4)

  @Column({ name: 'training_year_4', type: 'int', nullable: true })
  trainingYear4: number; // Tahun Mengikuti (4)

  @Column({ name: 'training_participation_5', nullable: true })
  trainingParticipation5: string; // Keikutsertaan Pelatihan (5)

  @Column({ name: 'training_year_5', type: 'int', nullable: true })
  trainingYear5: number; // Tahun Mengikuti (5)

  // Kompetensi Kepala Madrasah (Khusus)
  @Column({ name: 'personality_competency', type: 'decimal', precision: 5, scale: 2, nullable: true })
  personalityCompetency: number; // Kompetensi Kepribadian

  @Column({ name: 'managerial_competency', type: 'decimal', precision: 5, scale: 2, nullable: true })
  managerialCompetency: number; // Kompetensi Manajerial

  @Column({ name: 'entrepreneurship_competency', type: 'decimal', precision: 5, scale: 2, nullable: true })
  entrepreneurshipCompetency: number; // Kompetensi Kewirausahaan

  @Column({ name: 'supervision_competency', type: 'decimal', precision: 5, scale: 2, nullable: true })
  supervisionCompetency: number; // Kompetensi Supervisi

  @Column({ name: 'social_competency', type: 'decimal', precision: 5, scale: 2, nullable: true })
  socialCompetency: number; // Kompetensi Sosial

  @Column({ nullable: true })
  specialization: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isMainTenant: boolean; // true = tenant induk, false = tenant cabang

  @Column()
  instansiId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => ClassRoom, (classRoom) => classRoom.homeroomTeacher)
  classRooms: ClassRoom[];

  @OneToMany(() => Schedule, (schedule) => schedule.teacher)
  schedules: Schedule[];

  @ManyToMany(() => Subject, (subject) => subject.teachers)
  @JoinTable({
    name: 'teacher_subjects',
    joinColumn: { name: 'teacher_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'subject_id', referencedColumnName: 'id' },
  })
  subjects: Subject[];

  @OneToMany(() => StudentGrade, (grade) => grade.teacher)
  grades: StudentGrade[];

  @OneToMany(() => Attendance, (attendance) => attendance.teacher)
  attendances: Attendance[];

  @OneToMany(() => DisciplinaryAction, (action) => action.reporter)
  reportedDisciplinaryActions: DisciplinaryAction[];

  @OneToMany(() => CounselingSession, (session) => session.counselor)
  counselingSessions: CounselingSession[];

  @OneToMany(() => Card, (card) => card.teacher)
  cards: Card[];

  @OneToMany(() => EventRegistration, (registration) => registration.teacher)
  eventRegistrations: EventRegistration[];

  @OneToMany(() => BookLoan, (loan) => loan.teacher)
  bookLoans: BookLoan[];

  @OneToMany(() => CurriculumSchedule, (schedule) => schedule.teacher)
  curriculumSchedules: CurriculumSchedule[];

  @OneToMany(() => Question, (question) => question.teacher)
  questions: Question[];

  @OneToMany(() => QuestionBank, (bank) => bank.teacher)
  questionBanks: QuestionBank[];

  @OneToMany(() => QuestionShare, (share) => share.fromTeacher)
  sentQuestionShares: QuestionShare[];

  @OneToMany(() => QuestionShare, (share) => share.toTeacher)
  receivedQuestionShares: QuestionShare[];

  @OneToMany(() => GradeConversion, (conversion) => conversion.teacher)
  gradeConversions: GradeConversion[];

  @OneToMany(() => Stimulus, (stimulus) => stimulus.teacher)
  stimuli: Stimulus[];

  @OneToMany(() => ExamSchedule, (schedule) => schedule.teacher)
  examSchedules: ExamSchedule[];
}

