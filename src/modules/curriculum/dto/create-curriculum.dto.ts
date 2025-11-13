import { IsString, IsOptional, IsNumber, IsBoolean, IsEnum } from 'class-validator';
import { CurriculumType } from '../entities/curriculum.entity';

export class CreateCurriculumDto {
  @IsString()
  name: string;

  @IsEnum(CurriculumType)
  @IsOptional()
  type?: CurriculumType;

  @IsNumber()
  @IsOptional()
  academicYearId?: number;

  @IsString()
  @IsOptional()
  level?: string;

  @IsString()
  @IsOptional()
  grade?: string;

  @IsNumber()
  @IsOptional()
  semester?: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

