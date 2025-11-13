import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsBoolean,
  IsObject,
} from 'class-validator';
import { QuestionType, QuestionDifficulty } from '../entities/question.entity';

export class CreateQuestionDto {
  @IsNumber()
  @IsOptional()
  questionBankId?: number;

  @IsNumber()
  @IsOptional()
  stimulusId?: number;

  @IsString()
  questionText: string;

  @IsEnum(QuestionType)
  @IsOptional()
  questionType?: QuestionType;

  @IsObject()
  @IsOptional()
  options?: Record<string, any>;

  @IsString()
  @IsOptional()
  correctAnswer?: string;

  @IsString()
  @IsOptional()
  explanation?: string;

  @IsNumber()
  @IsOptional()
  points?: number;

  @IsEnum(QuestionDifficulty)
  @IsOptional()
  difficulty?: QuestionDifficulty;

  @IsNumber()
  @IsOptional()
  order?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}

