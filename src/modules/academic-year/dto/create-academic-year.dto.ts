import { IsString, IsDateString, IsOptional, IsBoolean, IsNumber, IsEnum } from 'class-validator';
import { SemesterType } from '../entities/academic-year.entity';

export class CreateAcademicYearDto {
  @IsString()
  name: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsNumber()
  @IsOptional()
  currentSemester?: number;

  @IsEnum(SemesterType)
  @IsOptional()
  currentSemesterType?: SemesterType;

  @IsString()
  @IsOptional()
  description?: string;
}

