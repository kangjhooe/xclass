import { IsNumber, IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateStudentGradeDto {
  @IsNumber()
  studentId: number;

  @IsNumber()
  subjectId: number;

  @IsNumber()
  score: number;

  @IsNumber()
  @IsOptional()
  teacherId?: number;

  @IsString()
  @IsOptional()
  assignmentType?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  @IsOptional()
  date?: string;
}

