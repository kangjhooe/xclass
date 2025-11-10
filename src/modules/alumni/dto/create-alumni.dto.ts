import {
  IsNumber,
  IsDateString,
  IsString,
  IsOptional,
  IsEnum,
} from 'class-validator';

export class CreateAlumniDto {
  @IsNumber()
  studentId: number;

  @IsNumber()
  graduationYear: number;

  @IsDateString()
  graduationDate: string;

  @IsNumber()
  finalGrade: number;

  @IsNumber()
  @IsOptional()
  gpa?: number;

  @IsNumber()
  @IsOptional()
  rank?: number;

  @IsString()
  @IsOptional()
  currentOccupation?: string;

  @IsString()
  @IsOptional()
  company?: string;

  @IsString()
  @IsOptional()
  position?: string;

  @IsString()
  @IsOptional()
  industry?: string;

  @IsNumber()
  @IsOptional()
  salaryRange?: number;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsEnum(['employed', 'unemployed', 'studying', 'self_employed'])
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

