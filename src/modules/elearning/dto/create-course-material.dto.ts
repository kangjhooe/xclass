import { IsString, IsNumber, IsEnum, IsOptional } from 'class-validator';
import { MaterialType } from '../entities/course-material.entity';

export class CreateCourseMaterialDto {
  @IsNumber()
  courseId: number;

  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(MaterialType)
  type: MaterialType;

  @IsString()
  @IsOptional()
  fileUrl?: string;

  @IsString()
  @IsOptional()
  linkUrl?: string;

  @IsNumber()
  @IsOptional()
  order?: number;

  @IsNumber()
  @IsOptional()
  chapter?: number;
}

