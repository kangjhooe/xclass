import {
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  IsBoolean,
  IsNumber,
  IsObject,
} from 'class-validator';
import { ExamType, ExamStatus } from '../entities/exam.entity';

export class CreateExamDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(ExamType)
  @IsOptional()
  examType?: ExamType;

  @IsString()
  @IsOptional()
  semester?: string;

  @IsString()
  @IsOptional()
  academicYear?: string;

  @IsDateString()
  startTime: string;

  @IsDateString()
  endTime: string;

  @IsEnum(ExamStatus)
  @IsOptional()
  status?: ExamStatus;

  @IsString()
  @IsOptional()
  instructions?: string;

  @IsObject()
  @IsOptional()
  settings?: Record<string, any>;

  @IsNumber()
  @IsOptional()
  createdBy?: number;

  @IsBoolean()
  @IsOptional()
  allowReview?: boolean;

  @IsBoolean()
  @IsOptional()
  showCorrectAnswers?: boolean;

  @IsBoolean()
  @IsOptional()
  randomizeQuestions?: boolean;

  @IsBoolean()
  @IsOptional()
  randomizeAnswers?: boolean;

  @IsNumber()
  @IsOptional()
  maxAttempts?: number;
}

