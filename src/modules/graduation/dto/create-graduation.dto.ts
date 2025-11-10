import {
  IsNumber,
  IsDateString,
  IsString,
  IsOptional,
  IsBoolean,
} from 'class-validator';

export class CreateGraduationDto {
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
  rank?: number;

  @IsBoolean()
  @IsOptional()
  certificateGenerated?: boolean;

  @IsString()
  @IsOptional()
  certificateNumber?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

