import {
  IsBoolean,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateCafeteriaOutletDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  contactPerson?: string;

  @IsString()
  @IsOptional()
  contactPhone?: string;

  @IsString()
  @IsOptional()
  openingHours?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}


