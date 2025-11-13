import { IsString, IsOptional, IsNumber, IsBoolean, IsDateString } from 'class-validator';

export class CreateCurriculumScheduleDto {
  @IsNumber()
  curriculumId: number;

  @IsNumber()
  syllabusId: number;

  @IsNumber()
  @IsOptional()
  learningMaterialId?: number;

  @IsNumber()
  classId: number;

  @IsNumber()
  subjectId: number;

  @IsNumber()
  teacherId: number;

  @IsDateString()
  scheduleDate: string;

  @IsString()
  startTime: string;

  @IsString()
  endTime: string;

  @IsString()
  @IsOptional()
  room?: string;

  @IsNumber()
  @IsOptional()
  meetingNumber?: number;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  homework?: string;

  @IsBoolean()
  @IsOptional()
  isCompleted?: boolean;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

