import { IsString, IsEmail, IsOptional, IsBoolean, IsDateString, IsNumber } from 'class-validator';

export class CreateStudentDto {
  @IsString()
  name: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsDateString()
  @IsOptional()
  birthDate?: string;

  @IsString()
  @IsOptional()
  birthPlace?: string;

  @IsString()
  @IsOptional()
  gender?: string;

  @IsString()
  @IsOptional()
  religion?: string;

  @IsNumber()
  @IsOptional()
  classId?: number;

  @IsString()
  @IsOptional()
  studentNumber?: string;

  @IsString()
  @IsOptional()
  nisn?: string;

  @IsString()
  @IsOptional()
  parentName?: string;

  @IsString()
  @IsOptional()
  parentPhone?: string;

  @IsEmail()
  @IsOptional()
  parentEmail?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

