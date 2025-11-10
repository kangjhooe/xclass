import { IsString, IsNumber, IsDateString, IsBoolean, IsOptional } from 'class-validator';

export class CreateCourseAssignmentDto {
  @IsNumber()
  courseId: number;

  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  instructions?: string;

  @IsDateString()
  dueDate: string;

  @IsNumber()
  @IsOptional()
  maxScore?: number;

  @IsBoolean()
  @IsOptional()
  allowLateSubmission?: boolean;

  @IsNumber()
  @IsOptional()
  order?: number;
}

