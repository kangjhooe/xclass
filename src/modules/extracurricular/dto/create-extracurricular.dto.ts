import {
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  IsNumber,
  IsArray,
  IsObject,
} from 'class-validator';
import {
  ExtracurricularStatus,
  ExtracurricularCategory,
} from '../entities/extracurricular.entity';

export class CreateExtracurricularDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(ExtracurricularCategory)
  category: ExtracurricularCategory;

  @IsNumber()
  @IsOptional()
  supervisorId?: number;

  @IsNumber()
  @IsOptional()
  assistantSupervisorId?: number;

  @IsObject()
  @IsOptional()
  schedule?: Record<string, any>;

  @IsString()
  @IsOptional()
  venue?: string;

  @IsNumber()
  @IsOptional()
  maxParticipants?: number;

  @IsEnum(ExtracurricularStatus)
  @IsOptional()
  status?: ExtracurricularStatus;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsArray()
  @IsOptional()
  requirements?: string[];

  @IsArray()
  @IsOptional()
  equipmentNeeded?: string[];

  @IsNumber()
  @IsOptional()
  cost?: number;

  @IsString()
  @IsOptional()
  notes?: string;
}

