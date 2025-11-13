import { Type } from 'class-transformer';
import {
  IsNumber,
  IsString,
  IsOptional,
  IsDateString,
  IsEnum,
  Min,
  Max,
  Length,
} from 'class-validator';
import { AssessmentType } from '../entities/student-grade.entity';

export class CreateStudentGradeDto {
  @IsNumber()
  @Type(() => Number)
  studentId: number;

  @IsNumber()
  @Type(() => Number)
  subjectId: number;

  @IsNumber()
  @Type(() => Number)
  @Min(0)
  @Max(100)
  score: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  teacherId?: number;

  @IsEnum(AssessmentType)
  @IsOptional()
  assessmentType?: AssessmentType;

  @IsString()
  @IsOptional()
  @Length(0, 100)
  customAssessmentLabel?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  @Max(100)
  weight?: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  @IsOptional()
  date?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  competencyId?: number;

  @IsString()
  @IsOptional()
  learningOutcome?: string;
}

