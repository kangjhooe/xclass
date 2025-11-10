import { IsNumber, IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateScheduleDto {
  @IsNumber()
  classId: number;

  @IsNumber()
  subjectId: number;

  @IsNumber()
  teacherId: number;

  @IsNumber()
  dayOfWeek: number;

  @IsString()
  startTime: string;

  @IsString()
  endTime: string;

  @IsString()
  @IsOptional()
  room?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

