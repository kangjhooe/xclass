import { IsNumber, IsEnum, IsString, IsOptional } from 'class-validator';
import { ShareType } from '../entities/question-share.entity';

export class CreateQuestionShareDto {
  @IsNumber()
  questionId: number;

  @IsNumber()
  toTeacherId: number;

  @IsNumber()
  toInstansiId: number;

  @IsEnum(ShareType)
  @IsOptional()
  shareType?: ShareType;

  @IsString()
  @IsOptional()
  message?: string;
}

