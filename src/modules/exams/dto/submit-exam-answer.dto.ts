import { IsNumber, IsString, IsObject, IsOptional } from 'class-validator';

export class SubmitExamAnswerDto {
  @IsNumber()
  questionId: number;

  @IsString()
  @IsOptional()
  answer?: string;

  @IsObject()
  @IsOptional()
  answerData?: Record<string, any>;

  @IsNumber()
  @IsOptional()
  timeSpent?: number; // in seconds
}

