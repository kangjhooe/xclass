import { IsNumber, IsEnum, IsString, IsOptional } from 'class-validator';
import { ExamType } from '../entities/exam.entity';

export class CreateExamWeightDto {
  @IsNumber()
  subjectId: number;

  @IsNumber()
  classId: number;

  @IsEnum(ExamType)
  examType: ExamType;

  @IsNumber()
  weight: number; // 0-100

  @IsString()
  @IsOptional()
  semester?: string;

  @IsString()
  @IsOptional()
  academicYear?: string;
}

