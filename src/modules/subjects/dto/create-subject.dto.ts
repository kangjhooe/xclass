import { IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';

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

  @IsNumber()
  @IsOptional()
  hoursPerWeek?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

