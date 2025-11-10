import {
  IsNumber,
  IsDateString,
  IsString,
  IsEnum,
  IsOptional,
} from 'class-validator';

export class CreateCounselingSessionDto {
  @IsNumber()
  studentId: number;

  @IsNumber()
  @IsOptional()
  counselorId?: number;

  @IsDateString()
  sessionDate: string;

  @IsString()
  issue: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsEnum(['scheduled', 'in_progress', 'completed', 'cancelled'])
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  followUp?: string;

  @IsDateString()
  @IsOptional()
  followUpDate?: string;
}

