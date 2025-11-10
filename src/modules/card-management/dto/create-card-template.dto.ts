import { IsString, IsEnum, IsBoolean, IsOptional, IsObject } from 'class-validator';
import { TemplateType } from '../entities/card-template.entity';

export class CreateCardTemplateDto {
  @IsString()
  name: string;

  @IsEnum(TemplateType)
  type: TemplateType;

  @IsString()
  template: string;

  @IsString()
  @IsOptional()
  backgroundImage?: string;

  @IsString()
  @IsOptional()
  logo?: string;

  @IsObject()
  @IsOptional()
  layout?: Record<string, any>;

  @IsObject()
  @IsOptional()
  fields?: Record<string, any>;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}

