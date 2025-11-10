import {
  IsNumber,
  IsEnum,
  IsString,
  IsOptional,
  IsDateString,
} from 'class-validator';
import { ParticipantStatus } from '../entities/extracurricular-participant.entity';

export class CreateExtracurricularParticipantDto {
  @IsNumber()
  extracurricularId: number;

  @IsNumber()
  studentId: number;

  @IsEnum(ParticipantStatus)
  @IsOptional()
  status?: ParticipantStatus;

  @IsDateString()
  @IsOptional()
  joinedAt?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

