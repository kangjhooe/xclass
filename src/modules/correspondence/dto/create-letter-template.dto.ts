import {
  IsString,
  IsOptional,
  IsBoolean,
  IsArray,
  ValidateNested,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TemplateVariableDefinition } from '../entities/letter-template.entity';

class TemplateVariableDto implements TemplateVariableDefinition {
  @IsString()
  key: string;

  @IsString()
  label: string;

  @IsString()
  @IsIn(['text', 'textarea', 'number', 'date', 'select', 'email', 'phone'])
  type: string;

  @IsOptional()
  @IsBoolean()
  required?: boolean;

  @IsOptional()
  @IsString()
  placeholder?: string;

  @IsOptional()
  @IsArray()
  options?: Array<{ label: string; value: string }>;

  @IsOptional()
  @IsString()
  helperText?: string;

  @IsOptional()
  @IsString()
  defaultValue?: string;

  @IsOptional()
  @IsString()
  source?: string;
}

export class CreateLetterTemplateDto {
  @IsString()
  code: string;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  jenisSurat?: string;

  @IsString()
  content: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => TemplateVariableDto)
  variables?: TemplateVariableDto[];

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  description?: string;
}

