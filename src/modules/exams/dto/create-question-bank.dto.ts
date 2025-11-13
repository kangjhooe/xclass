import { IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';

export class CreateQuestionBankDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  subjectId?: number;

  @IsNumber()
  @IsOptional()
  classId?: number;

  @IsBoolean()
  @IsOptional()
  isShared?: boolean;
}

