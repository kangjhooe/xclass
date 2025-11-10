import {
  IsString,
  IsOptional,
  IsDateString,
  IsEmail,
  IsNumber,
} from 'class-validator';

export class CreateDataPokokDto {
  @IsString()
  @IsOptional()
  npsn?: string;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  type?: string;

  @IsString()
  @IsOptional()
  jenjang?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  village?: string;

  @IsString()
  @IsOptional()
  subDistrict?: string;

  @IsString()
  @IsOptional()
  district?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  province?: string;

  @IsString()
  @IsOptional()
  postalCode?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  website?: string;

  @IsString()
  @IsOptional()
  principalName?: string;

  @IsString()
  @IsOptional()
  principalNip?: string;

  @IsString()
  @IsOptional()
  principalPhone?: string;

  @IsEmail()
  @IsOptional()
  principalEmail?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  vision?: string;

  @IsString()
  @IsOptional()
  mission?: string;

  @IsString()
  @IsOptional()
  accreditation?: string;

  @IsDateString()
  @IsOptional()
  accreditationDate?: string;

  @IsString()
  @IsOptional()
  licenseNumber?: string;

  @IsDateString()
  @IsOptional()
  licenseDate?: string;

  @IsDateString()
  @IsOptional()
  establishedDate?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

