import {
  IsString,
  IsDateString,
  IsOptional,
} from 'class-validator';

export class CreateGuestBookDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  identity_number?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  institution?: string;

  @IsString()
  purpose: string;

  @IsDateString()
  @IsOptional()
  check_in?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  photo_url?: string;

  // Legacy fields untuk backward compatibility
  @IsDateString()
  @IsOptional()
  visitDate?: string;

  @IsString()
  @IsOptional()
  visitTime?: string;

  @IsString()
  @IsOptional()
  leaveTime?: string;
}

