import { IsString, IsOptional, IsNumber, IsBoolean, IsEnum } from 'class-validator';
import { CurriculumType } from '../../curriculum/entities/curriculum.entity';

export class CreateSubjectDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  code?: string;

  @IsString()
  @IsOptional()
  description?: string;

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
  department?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  learningFocus?: string;

  @IsEnum(CurriculumType)
  @IsOptional()
  curriculumType?: CurriculumType;

  @IsNumber()
  @IsOptional()
  hoursPerWeek?: number;

  @IsNumber()
  @IsOptional()
  order?: number;

  @IsNumber()
  @IsOptional()
  minimumPassingScore?: number;

  @IsBoolean()
  @IsOptional()
  isMandatory?: boolean;

  @IsBoolean()
  @IsOptional()
  isElective?: boolean;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  color?: string;
}

