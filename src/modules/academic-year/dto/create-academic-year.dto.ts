
import { IsString, IsDateString, IsOptional, IsBoolean, IsNumber } from 'class-validator';

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

  @IsString()
  @IsOptional()
  description?: string;
}

