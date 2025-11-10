import {
  IsNumber,
  IsString,
  IsEnum,
  IsDateString,
  IsOptional,
} from 'class-validator';
import {
  ActivityType,
  ActivityStatus,
} from '../entities/extracurricular-activity.entity';

export class CreateExtracurricularActivityDto {
  @IsNumber()
  extracurricularId: number;

  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  activityDate: string;

  @IsDateString()
  @IsOptional()
  startTime?: string;

  @IsDateString()
  @IsOptional()
  endTime?: string;

  @IsString()
  @IsOptional()
  venue?: string;

  @IsEnum(ActivityType)
  @IsOptional()
  type?: ActivityType;

  @IsEnum(ActivityStatus)
  @IsOptional()
  status?: ActivityStatus;

  @IsString()
  @IsOptional()
  notes?: string;
}
