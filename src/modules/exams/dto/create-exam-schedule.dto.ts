import {
  IsNumber,
  IsDateString,
  IsEnum,
  IsString,
  IsBoolean,
  IsObject,
  IsOptional,
} from 'class-validator';
import { ScheduleStatus } from '../entities/exam-schedule.entity';

export class CreateExamScheduleDto {
  @IsNumber()
  examId: number;

  @IsNumber()
  classId: number;

  @IsNumber()
  subjectId: number;

  @IsNumber()
  teacherId: number;

  @IsDateString()
  startTime: string;

  @IsDateString()
  endTime: string;

  @IsNumber()
  duration: number;

  @IsNumber()
  @IsOptional()
  totalQuestions?: number;

  @IsNumber()
  @IsOptional()
  totalScore?: number;

  @IsNumber()
  @IsOptional()
  passingScore?: number;

  @IsEnum(ScheduleStatus)
  @IsOptional()
  status?: ScheduleStatus;

  @IsString()
  @IsOptional()
  instructions?: string;

  @IsObject()
  @IsOptional()
  settings?: Record<string, any>;

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

