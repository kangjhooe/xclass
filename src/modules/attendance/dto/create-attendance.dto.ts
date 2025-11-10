import { IsNumber, IsString, IsDateString, IsOptional } from 'class-validator';

export class CreateAttendanceDto {
  @IsNumber()
  studentId: number;

  @IsNumber()
  scheduleId: number;

  @IsDateString()
  date: string;

  @IsString()
  @IsOptional()
  status?: string; // 'present', 'absent', 'late', 'excused'

  @IsString()
  @IsOptional()
  notes?: string;

  @IsNumber()
  @IsOptional()
  teacherId?: number;
}
