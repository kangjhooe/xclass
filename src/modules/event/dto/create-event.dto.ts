import {
  IsString,
  IsDateString,
  IsEnum,
  IsOptional,
  IsBoolean,
} from 'class-validator';

export class CreateEventDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsEnum(['academic', 'sports', 'cultural', 'other'])
  @IsOptional()
  type?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

