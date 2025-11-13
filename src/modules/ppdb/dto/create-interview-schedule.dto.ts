import { IsNotEmpty, IsString, IsDateString, IsTimeZone, IsOptional, IsInt, Min, IsEnum } from 'class-validator';
import { ScheduleStatus } from '../entities/ppdb-interview-schedule.entity';

export class CreateInterviewScheduleDto {
  @IsNotEmpty({ message: 'Tanggal jadwal wajib diisi' })
  @IsDateString()
  scheduleDate: string;

  @IsNotEmpty({ message: 'Waktu mulai wajib diisi' })
  @IsString()
  startTime: string;

  @IsNotEmpty({ message: 'Waktu selesai wajib diisi' })
  @IsString()
  endTime: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxParticipants?: number;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsEnum(ScheduleStatus)
  status?: ScheduleStatus;
}

export class BookInterviewScheduleDto {
  @IsNotEmpty({ message: 'ID jadwal wajib diisi' })
  @IsInt()
  scheduleId: number;
}

