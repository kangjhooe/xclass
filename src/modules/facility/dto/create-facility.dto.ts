import {
  IsString,
  IsEnum,
  IsOptional,
  IsNumber,
  IsBoolean,
} from 'class-validator';

export class CreateFacilityDto {
  @IsString()
  name: string;

  @IsEnum(['building', 'room', 'land', 'equipment'])
  type: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
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

