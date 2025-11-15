import { IsString, IsEmail, IsOptional, IsBoolean, IsDateString, IsNumber, IsInt, MinLength, MaxLength, Matches } from 'class-validator';

export class CreateTeacherDto {
  @IsString()
  @MinLength(2, { message: 'Nama minimal 2 karakter' })
  @MaxLength(100, { message: 'Nama maksimal 100 karakter' })
  name: string;

  @IsEmail({}, { message: 'Format email tidak valid' })
  @IsOptional()
  email?: string;

  @IsString()
  @Matches(/^[0-9+\-\s()]*$/, { message: 'Format nomor telepon tidak valid' })
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  employeeNumber?: string;

  @IsString()
  @IsOptional()
  nip?: string;

  @IsString()
  @Matches(/^[0-9]{16}$/, { message: 'NIK harus 16 digit angka' })
  @IsOptional()
  nik?: string;

  @IsString()
  @IsOptional()
  nuptk?: string;

  @IsString()
  @IsOptional()
  gender?: string;

  @IsDateString()
  @IsOptional()
  birthDate?: string;

  @IsString()
  @IsOptional()
  birthPlace?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  education?: string;

  @IsString()
  @IsOptional()
  specialization?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  isMainTenant?: boolean; // true = tenant induk, false = tenant cabang

  // Data Pribadi Tambahan
  @IsString()
  @IsOptional()
  pageId?: string;

  @IsString()
  @IsOptional()
  npk?: string;

  @IsString()
  @IsOptional()
  motherName?: string;

  // Detail Alamat
  @IsString()
  @IsOptional()
  province?: string;

  @IsString()
  @IsOptional()
  cityDistrict?: string;

  @IsString()
  @IsOptional()
  subDistrict?: string;

  @IsString()
  @IsOptional()
  village?: string;

  @IsString()
  @IsOptional()
  postalCode?: string;

  // Data Pendidikan
  @IsString()
  @IsOptional()
  educationLevel?: string;

  @IsString()
  @IsOptional()
  studyProgramGroup?: string;

  // Status Kepegawaian
  @IsString()
  @IsOptional()
  employmentStatusPtk?: string;

  @IsString()
  @IsOptional()
  employmentStatus?: string;

  @IsString()
  @IsOptional()
  employmentRank?: string;

  @IsDateString()
  @IsOptional()
  tmtSkCpns?: string;

  @IsDateString()
  @IsOptional()
  tmtSkAwal?: string;

  @IsDateString()
  @IsOptional()
  tmtSkTerakhir?: string;

  @IsString()
  @IsOptional()
  appointingInstitution?: string;

  @IsString()
  @IsOptional()
  assignmentStatus?: string;

  @IsNumber()
  @IsOptional()
  baseSalary?: number;

  @IsString()
  @IsOptional()
  workLocationStatus?: string;

  @IsString()
  @IsOptional()
  satminkalType?: string;

  @IsString()
  @IsOptional()
  satminkalNpsn?: string;

  @IsString()
  @IsOptional()
  satminkalIdentity?: string;

  @IsString()
  @IsOptional()
  inpassingStatus?: string;

  @IsDateString()
  @IsOptional()
  tmtInpassing?: string;

  // Tugas dan Mengajar
  @IsString()
  @IsOptional()
  mainDutyEducator?: string;

  @IsString()
  @IsOptional()
  additionalDuty?: string;

  @IsString()
  @IsOptional()
  mainDutySchool?: string;

  @IsString()
  @IsOptional()
  mainSubject?: string;

  @IsInt()
  @IsOptional()
  totalTeachingHours?: number;

  @IsString()
  @IsOptional()
  dutyType?: string;

  @IsInt()
  @IsOptional()
  teachingHoursEquivalent?: number;

  @IsBoolean()
  @IsOptional()
  teachOtherSchool?: boolean;

  @IsString()
  @IsOptional()
  otherWorkLocationType?: string;

  @IsString()
  @IsOptional()
  otherWorkLocationNpsn?: string;

  @IsString()
  @IsOptional()
  otherSchoolSubject?: string;

  @IsInt()
  @IsOptional()
  otherSchoolHours?: number;

  // Informasi Sertifikasi
  @IsString()
  @IsOptional()
  certificationParticipationStatus?: string;

  @IsString()
  @IsOptional()
  certificationPassStatus?: string;

  @IsInt()
  @IsOptional()
  certificationYear?: number;

  @IsString()
  @IsOptional()
  certifiedSubject?: string;

  @IsString()
  @IsOptional()
  nrg?: string;

  @IsString()
  @IsOptional()
  nrgSkNumber?: string;

  @IsDateString()
  @IsOptional()
  nrgSkDate?: string;

  @IsString()
  @IsOptional()
  certificationParticipantNumber?: string;

  @IsString()
  @IsOptional()
  certificationType?: string;

  @IsDateString()
  @IsOptional()
  certificationPassDate?: string;

  @IsString()
  @IsOptional()
  educatorCertificateNumber?: string;

  @IsDateString()
  @IsOptional()
  certificateIssueDate?: string;

  @IsString()
  @IsOptional()
  lptkName?: string;

  // Informasi Tunjangan
  @IsString()
  @IsOptional()
  tpgRecipientStatus?: string;

  @IsInt()
  @IsOptional()
  tpgStartYear?: number;

  @IsNumber()
  @IsOptional()
  tpgAmount?: number;

  @IsString()
  @IsOptional()
  tfgRecipientStatus?: string;

  @IsInt()
  @IsOptional()
  tfgStartYear?: number;

  @IsNumber()
  @IsOptional()
  tfgAmount?: number;

  // Penghargaan dan Pelatihan
  @IsBoolean()
  @IsOptional()
  hasReceivedAward?: boolean;

  @IsString()
  @IsOptional()
  highestAward?: string;

  @IsString()
  @IsOptional()
  awardField?: string;

  @IsString()
  @IsOptional()
  awardLevel?: string;

  @IsInt()
  @IsOptional()
  awardYear?: number;

  @IsString()
  @IsOptional()
  competencyTraining?: string;

  @IsString()
  @IsOptional()
  trainingParticipation1?: string;

  @IsInt()
  @IsOptional()
  trainingYear1?: number;

  @IsString()
  @IsOptional()
  trainingParticipation2?: string;

  @IsInt()
  @IsOptional()
  trainingYear2?: number;

  @IsString()
  @IsOptional()
  trainingParticipation3?: string;

  @IsInt()
  @IsOptional()
  trainingYear3?: number;

  @IsString()
  @IsOptional()
  trainingParticipation4?: string;

  @IsInt()
  @IsOptional()
  trainingYear4?: number;

  @IsString()
  @IsOptional()
  trainingParticipation5?: string;

  @IsInt()
  @IsOptional()
  trainingYear5?: number;

  // Kompetensi Kepala Madrasah
  @IsNumber()
  @IsOptional()
  personalityCompetency?: number;

  @IsNumber()
  @IsOptional()
  managerialCompetency?: number;

  @IsNumber()
  @IsOptional()
  entrepreneurshipCompetency?: number;

  @IsNumber()
  @IsOptional()
  supervisionCompetency?: number;

  @IsNumber()
  @IsOptional()
  socialCompetency?: number;
}

