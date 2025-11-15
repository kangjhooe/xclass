import {
  IsString,
  IsEmail,
  IsOptional,
  IsBoolean,
  IsDateString,
  IsNumber,
  IsInt,
  MinLength,
  MaxLength,
  Matches,
  ValidateIf,
  IsNotEmpty,
} from 'class-validator';

export class CreateStudentDto {
  @IsString()
  @IsOptional()
  @MaxLength(8)
  npsn?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name: string;

  @IsEmail()
  @IsOptional()
  @MaxLength(255)
  email?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  phone?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsDateString()
  @IsOptional()
  birthDate?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  birthPlace?: string;

  @IsString()
  @IsOptional()
  @MaxLength(10)
  gender?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  religion?: string;

  @IsNumber()
  @IsOptional()
  classId?: number;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  studentNumber?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  @ValidateIf((o) => o.nisn !== undefined && o.nisn !== null && o.nisn !== '')
  @Matches(/^\d{10}$/, { message: 'NISN harus 10 digit angka' })
  nisn?: string;

  @IsString()
  @IsNotEmpty({ message: 'NIK wajib diisi' })
  @MaxLength(16, { message: 'NIK maksimal 16 karakter' })
  @Matches(/^\d{16}$/, { message: 'NIK harus 16 digit angka' })
  nik: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  nationality?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  ethnicity?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  language?: string;

  @IsString()
  @IsOptional()
  @MaxLength(5)
  bloodType?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  disabilityType?: string;

  @IsString()
  @IsOptional()
  disabilityDescription?: string;

  // Alamat lengkap
  @IsString()
  @IsOptional()
  @MaxLength(10)
  rt?: string;

  @IsString()
  @IsOptional()
  @MaxLength(10)
  rw?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  village?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  subDistrict?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  district?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  city?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  province?: string;

  @IsString()
  @IsOptional()
  @MaxLength(10)
  postalCode?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  residenceType?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  transportation?: string;

  // Data sekolah sebelumnya
  @IsString()
  @IsOptional()
  previousSchool?: string;

  @IsString()
  @IsOptional()
  previousSchoolAddress?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  previousSchoolCity?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  previousSchoolProvince?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  previousSchoolPhone?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  previousSchoolPrincipal?: string;

  @IsString()
  @IsOptional()
  @MaxLength(10)
  previousSchoolGraduationYear?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  previousSchoolCertificateNumber?: string;

  // Data orangtua (ayah)
  @IsString()
  @IsOptional()
  @MaxLength(255)
  fatherName?: string;

  @IsString()
  @IsOptional()
  @MaxLength(16)
  @ValidateIf((o) => o.fatherNik !== undefined && o.fatherNik !== null && o.fatherNik !== '')
  @Matches(/^\d{16}$/, { message: 'NIK Ayah harus 16 digit angka' })
  fatherNik?: string;

  @IsDateString()
  @IsOptional()
  fatherBirthDate?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  fatherBirthPlace?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  fatherEducation?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  fatherOccupation?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  fatherCompany?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  fatherPhone?: string;

  @IsEmail()
  @IsOptional()
  @MaxLength(255)
  fatherEmail?: string;

  @IsNumber()
  @IsOptional()
  fatherIncome?: number;

  // Data orangtua (ibu)
  @IsString()
  @IsOptional()
  @MaxLength(255)
  motherName?: string;

  @IsString()
  @IsOptional()
  @MaxLength(16)
  @ValidateIf((o) => o.motherNik !== undefined && o.motherNik !== null && o.motherNik !== '')
  @Matches(/^\d{16}$/, { message: 'NIK Ibu harus 16 digit angka' })
  motherNik?: string;

  @IsDateString()
  @IsOptional()
  motherBirthDate?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  motherBirthPlace?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  motherEducation?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  motherOccupation?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  motherCompany?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  motherPhone?: string;

  @IsEmail()
  @IsOptional()
  @MaxLength(255)
  motherEmail?: string;

  @IsNumber()
  @IsOptional()
  motherIncome?: number;

  // Data wali
  @IsString()
  @IsOptional()
  @MaxLength(255)
  parentName?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  parentPhone?: string;

  @IsEmail()
  @IsOptional()
  @MaxLength(255)
  parentEmail?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  guardianName?: string;

  @IsString()
  @IsOptional()
  @MaxLength(16)
  @ValidateIf((o) => o.guardianNik !== undefined && o.guardianNik !== null && o.guardianNik !== '')
  @Matches(/^\d{16}$/, { message: 'NIK Wali harus 16 digit angka' })
  guardianNik?: string;

  @IsDateString()
  @IsOptional()
  guardianBirthDate?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  guardianBirthPlace?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  guardianEducation?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  guardianOccupation?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  guardianCompany?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  guardianPhone?: string;

  @IsEmail()
  @IsOptional()
  @MaxLength(255)
  guardianEmail?: string;

  @IsNumber()
  @IsOptional()
  guardianIncome?: number;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  guardianRelationship?: string;

  // Data kesehatan
  @IsInt()
  @IsOptional()
  height?: number;

  @IsInt()
  @IsOptional()
  weight?: number;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  healthCondition?: string;

  @IsString()
  @IsOptional()
  healthNotes?: string;

  @IsString()
  @IsOptional()
  allergies?: string;

  @IsString()
  @IsOptional()
  medications?: string;

  // Data pendaftaran & akademik
  @IsDateString()
  @IsOptional()
  enrollmentDate?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  enrollmentSemester?: string;

  @IsString()
  @IsOptional()
  @MaxLength(10)
  enrollmentYear?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  studentStatus?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  academicLevel?: string;

  @IsString()
  @IsOptional()
  @MaxLength(10)
  currentGrade?: string;

  @IsString()
  @IsOptional()
  @MaxLength(10)
  academicYear?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  // Kontak darurat
  @IsString()
  @IsOptional()
  @MaxLength(255)
  emergencyContactName?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  emergencyContactPhone?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  emergencyContactRelationship?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

