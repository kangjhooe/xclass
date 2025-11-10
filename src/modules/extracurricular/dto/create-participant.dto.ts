import {
  IsNumber,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateParticipantDto {
  @IsNumber()
  activityId: number;

  @IsNumber()
  studentId: number;

  @IsDateString()
  @IsOptional()
  joinDate?: string;

  @IsEnum(['active', 'inactive', 'graduated'])
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

