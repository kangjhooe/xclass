import {
  IsNumber,
  IsDateString,
  IsString,
  IsOptional,
  IsBoolean,
  IsEnum,
} from 'class-validator';

export class CreateGraduationDto {
  @IsNumber()
  student_id: number;

  @IsNumber()
  @IsOptional()
  academic_year_id?: number;

  @IsNumber()
  @IsOptional()
  class_id?: number;

  @IsNumber()
  @IsOptional()
  graduationYear?: number;

  @IsDateString()
  @IsOptional()
  graduation_date?: string;

  @IsNumber()
  @IsOptional()
  finalGrade?: number;

  @IsNumber()
  @IsOptional()
  rank?: number;

  @IsEnum(['pending', 'approved', 'graduated'])
  @IsOptional()
  status?: string;

  @IsBoolean()
  @IsOptional()
  certificateGenerated?: boolean;

  @IsString()
  @IsOptional()
  certificate_number?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

