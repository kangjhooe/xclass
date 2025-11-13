import { IsString, IsOptional, IsEnum, IsObject } from 'class-validator';
import { StimulusType } from '../entities/stimulus.entity';

export class CreateStimulusDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsEnum(StimulusType)
  @IsOptional()
  contentType?: StimulusType;

  @IsString()
  @IsOptional()
  fileUrl?: string;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}

