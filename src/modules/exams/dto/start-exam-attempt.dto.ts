import { IsNumber, IsOptional, IsString } from 'class-validator';

export class StartExamAttemptDto {
  @IsNumber()
  examId: number;

  @IsNumber()
  @IsOptional()
  studentId?: number;

  @IsString()
  @IsOptional()
  ipAddress?: string;

  @IsString()
  @IsOptional()
  userAgent?: string;
}

