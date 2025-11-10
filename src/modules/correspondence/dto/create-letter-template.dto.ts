import { IsString, IsOptional, IsBoolean, IsArray } from 'class-validator';

export class CreateLetterTemplateDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  jenisSurat?: string;

  @IsString()
  content: string;

  @IsArray()
  @IsOptional()
  variables?: string[];

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  description?: string;
}

