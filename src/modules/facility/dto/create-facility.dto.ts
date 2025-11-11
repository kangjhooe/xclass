import {
  IsString,
  IsEnum,
  IsOptional,
  IsNumber,
  IsBoolean,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateFacilityDto {
  @IsString()
  name: string;

  @IsEnum(['building', 'room', 'land', 'equipment'])
  type: string;

  @IsOptional()
  @Transform(({ value }) => (value === null || value === '' ? undefined : value))
  @IsString()
  description?: string;

  @IsOptional()
  @Transform(({ value }) => (value === null || value === '' ? undefined : value))
  @IsString()
  location?: string;

  @IsNumber()
  @IsOptional()
  capacity?: number;

  @IsOptional()
  metadata?: any; // Data spesifik berdasarkan tipe

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

