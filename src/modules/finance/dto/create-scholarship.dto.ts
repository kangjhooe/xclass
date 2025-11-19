import {
  IsNumber,
  IsDateString,
  IsEnum,
  IsString,
  IsOptional,
  Min,
  Max,
} from 'class-validator';
import { ScholarshipType, ScholarshipStatus } from '../entities/scholarship.entity';

export class CreateScholarshipDto {
  @IsNumber()
  studentId: number;

  @IsEnum(ScholarshipType)
  scholarshipType: ScholarshipType;

  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  amount?: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  percentage?: number;

  @IsDateString()
  startDate: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsEnum(ScholarshipStatus)
  @IsOptional()
  status?: ScholarshipStatus;

  @IsString()
  @IsOptional()
  sponsor?: string;

  @IsString()
  @IsOptional()
  requirements?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

