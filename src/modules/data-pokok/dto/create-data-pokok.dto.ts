import {
  IsString,
  IsOptional,
  IsDateString,
  IsEmail,
  IsNumber,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateDataPokokDto {
  @IsOptional()
  @Transform(({ value }) => (value === null || value === '' ? undefined : value))
  @IsString()
  npsn?: string;

  @IsString()
  name: string;

  @IsOptional()
  @Transform(({ value }) => (value === null || value === '' ? undefined : value))
  @IsString()
  type?: string;

  @IsOptional()
  @Transform(({ value }) => (value === null || value === '' ? undefined : value))
  @IsString()
  jenjang?: string;

  @IsOptional()
  @Transform(({ value }) => (value === null || value === '' ? undefined : value))
  @IsString()
  kurikulum?: string;

  @IsOptional()
  @Transform(({ value }) => (value === null || value === '' ? undefined : value))
  @IsString()
  tahunPelajaranAktif?: string;

  @IsOptional()
  @Transform(({ value }) => (value === null || value === '' ? undefined : value))
  @IsString()
  address?: string;

  @IsOptional()
  @Transform(({ value }) => (value === null || value === '' ? undefined : value))
  @IsString()
  village?: string;

  @IsOptional()
  @Transform(({ value }) => (value === null || value === '' ? undefined : value))
  @IsString()
  subDistrict?: string;

  @IsOptional()
  @Transform(({ value }) => (value === null || value === '' ? undefined : value))
  @IsString()
  district?: string;

  @IsOptional()
  @Transform(({ value }) => (value === null || value === '' ? undefined : value))
  @IsString()
  city?: string;

  @IsOptional()
  @Transform(({ value }) => (value === null || value === '' ? undefined : value))
  @IsString()
  province?: string;

  @IsOptional()
  @Transform(({ value }) => (value === null || value === '' ? undefined : value))
  @IsString()
  postalCode?: string;

  @IsOptional()
  @Transform(({ value }) => (value === null || value === '' ? undefined : value))
  @IsString()
  phone?: string;

  @IsOptional()
  @Transform(({ value }) => (value === null || value === '' ? undefined : value))
  @IsEmail()
  email?: string;

  @IsOptional()
  @Transform(({ value }) => (value === null || value === '' ? undefined : value))
  @IsString()
  website?: string;

  @IsOptional()
  @Transform(({ value }) => (value === null || value === '' ? undefined : value))
  @IsString()
  principalName?: string;

  @IsOptional()
  @Transform(({ value }) => (value === null || value === '' ? undefined : value))
  @IsString()
  principalNip?: string;

  @IsOptional()
  @Transform(({ value }) => (value === null || value === '' ? undefined : value))
  @IsString()
  principalPhone?: string;

  @IsOptional()
  @Transform(({ value }) => (value === null || value === '' ? undefined : value))
  @IsEmail()
  principalEmail?: string;

  @IsOptional()
  @Transform(({ value }) => (value === null || value === '' ? undefined : value))
  @IsString()
  description?: string;

  @IsOptional()
  @Transform(({ value }) => (value === null || value === '' ? undefined : value))
  @IsString()
  vision?: string;

  @IsOptional()
  @Transform(({ value }) => (value === null || value === '' ? undefined : value))
  @IsString()
  mission?: string;

  @IsOptional()
  @Transform(({ value }) => (value === null || value === '' ? undefined : value))
  @IsString()
  accreditation?: string;

  @IsOptional()
  @Transform(({ value }) => (value === null || value === '' ? undefined : value))
  @IsDateString()
  accreditationDate?: string;

  @IsOptional()
  @Transform(({ value }) => (value === null || value === '' ? undefined : value))
  @IsString()
  licenseNumber?: string;

  @IsOptional()
  @Transform(({ value }) => (value === null || value === '' ? undefined : value))
  @IsDateString()
  licenseDate?: string;

  @IsOptional()
  @Transform(({ value }) => (value === null || value === '' ? undefined : value))
  @IsDateString()
  establishedDate?: string;

  @IsOptional()
  @Transform(({ value }) => (value === null || value === '' ? undefined : value))
  @IsString()
  notes?: string;
}

