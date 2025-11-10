import {
  IsNumber,
  IsDateString,
  IsString,
  IsEnum,
  IsOptional,
} from 'class-validator';

export class CreateDisciplinaryActionDto {
  @IsNumber()
  studentId: number;

  @IsNumber()
  @IsOptional()
  reporterId?: number;

  @IsDateString()
  incidentDate: string;

  @IsString()
  description: string;

  @IsEnum(['warning', 'reprimand', 'suspension', 'expulsion'])
  sanctionType: string;

  @IsString()
  @IsOptional()
  sanctionDetails?: string;

  @IsEnum(['pending', 'active', 'completed', 'cancelled'])
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

