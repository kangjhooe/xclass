import { IsString, IsEmail, IsOptional, IsBoolean, IsDateString, MinLength, MaxLength, Matches } from 'class-validator';

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
}

