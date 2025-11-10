import {
  IsNumber,
  IsDateString,
  IsEnum,
  IsString,
  IsObject,
  IsOptional,
} from 'class-validator';
import { AttemptStatus } from '../entities/exam-attempt.entity';

export class CreateExamAttemptDto {
  @IsNumber()
  examId: number;

  @IsNumber()
  studentId: number;

  @IsDateString()
  @IsOptional()
  startedAt?: string;

  @IsEnum(AttemptStatus)
  @IsOptional()
  status?: AttemptStatus;

  @IsString()
  @IsOptional()
  ipAddress?: string;

  @IsString()
  @IsOptional()
  userAgent?: string;

  @IsObject()
  @IsOptional()
  questionOrder?: number[];

  @IsObject()
  @IsOptional()
  answerOrder?: Record<string, any>;
}

