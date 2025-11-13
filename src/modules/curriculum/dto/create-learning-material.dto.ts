import { IsString, IsOptional, IsNumber, IsBoolean, IsEnum } from 'class-validator';
import { MaterialType } from '../entities/learning-material.entity';

export class CreateLearningMaterialDto {
  @IsNumber()
  syllabusId: number;

  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsEnum(MaterialType)
  @IsOptional()
  type?: MaterialType;

  @IsNumber()
  @IsOptional()
  meetingNumber?: number;

  @IsNumber()
  @IsOptional()
  estimatedHours?: number;

  @IsString()
  @IsOptional()
  fileUrl?: string;

  @IsString()
  @IsOptional()
  videoUrl?: string;

  @IsString()
  @IsOptional()
  linkUrl?: string;

  @IsNumber()
  @IsOptional()
  order?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

