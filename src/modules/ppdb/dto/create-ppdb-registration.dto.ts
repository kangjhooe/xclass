import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsBoolean,
  IsDateString,
  IsEmail,
  IsObject,
} from 'class-validator';
import { RegistrationStatus, RegistrationPath } from '../entities/ppdb-registration.entity';

export class CreatePpdbRegistrationDto {
  @IsString()
  studentName: string;

  @IsString()
  studentNisn: string;

  @IsString()
  studentNik: string;

  @IsString()
  birthPlace: string;

  @IsDateString()
  birthDate: string;

  @IsEnum(['male', 'female'])
  gender: string;

  @IsString()
  religion: string;

  @IsString()
  address: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  parentName: string;

  @IsString()
  parentPhone: string;

  @IsString()
  parentOccupation: string;

  @IsNumber()
  parentIncome: number;

  @IsString()
  previousSchool: string;

  @IsString()
  previousSchoolAddress: string;

  @IsEnum(RegistrationPath)
  registrationPath: RegistrationPath;

  @IsEnum(RegistrationStatus)
  @IsOptional()
  status?: RegistrationStatus;

  @IsNumber()
  @IsOptional()
  selectionScore?: number;

  @IsNumber()
  @IsOptional()
  interviewScore?: number;

  @IsNumber()
  @IsOptional()
  documentScore?: number;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsObject()
  @IsOptional()
  documents?: Record<string, any>;
}

