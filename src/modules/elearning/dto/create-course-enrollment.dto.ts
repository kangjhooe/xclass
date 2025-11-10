import { IsNumber, IsDateString, IsOptional } from 'class-validator';

export class CreateCourseEnrollmentDto {
  @IsNumber()
  courseId: number;

  @IsNumber()
  studentId: number;

  @IsDateString()
  @IsOptional()
  enrolledAt?: string;
}

