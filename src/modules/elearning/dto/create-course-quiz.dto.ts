import { IsString, IsNumber, IsBoolean, IsOptional } from 'class-validator';

export class CreateCourseQuizDto {
  @IsNumber()
  courseId: number;

  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  timeLimit?: number;

  @IsNumber()
  @IsOptional()
  maxAttempts?: number;

  @IsBoolean()
  @IsOptional()
  showAnswers?: boolean;

  @IsBoolean()
  @IsOptional()
  allowReview?: boolean;

  @IsNumber()
  @IsOptional()
  passingScore?: number;

  @IsNumber()
  @IsOptional()
  order?: number;
}

