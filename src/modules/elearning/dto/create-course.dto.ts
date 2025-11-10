import { IsString, IsOptional, IsNumber, IsEnum, IsDateString } from 'class-validator';
import { CourseStatus } from '../entities/course.entity';

export class CreateCourseDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  syllabus?: string;

  @IsString()
  @IsOptional()
  level?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsEnum(CourseStatus)
  @IsOptional()
  status?: CourseStatus;

  @IsNumber()
  @IsOptional()
  subjectId?: number;

  @IsNumber()
  @IsOptional()
  classId?: number;

  @IsNumber()
  teacherId: number;

  @IsNumber()
  @IsOptional()
  order?: number;

  @IsString()
  @IsOptional()
  thumbnail?: string;
}

