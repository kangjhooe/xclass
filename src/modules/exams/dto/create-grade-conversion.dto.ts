import { IsNumber, IsEnum, IsOptional, IsObject } from 'class-validator';
import { ConversionType } from '../entities/grade-conversion.entity';

export class CreateGradeConversionDto {
  @IsNumber()
  examId: number;

  @IsNumber()
  @IsOptional()
  subjectId?: number;

  @IsNumber()
  @IsOptional()
  classId?: number;

  @IsNumber()
  minScore: number;

  @IsNumber()
  maxScore: number;

  @IsEnum(ConversionType)
  @IsOptional()
  conversionType?: ConversionType;

  @IsObject()
  @IsOptional()
  conversionRules?: Record<string, any>;
}

