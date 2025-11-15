import { IsString, IsEnum, IsArray, IsNotEmpty, IsOptional } from 'class-validator';
import { TemplateType } from '../entities/notification-template.entity';

export class CreateTemplateDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(TemplateType)
  type: TemplateType;

  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  variables?: string[];
}

