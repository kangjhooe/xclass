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
  phone?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  institution?: string;

  @IsString()
  @IsOptional()
  purpose?: string;

  @IsDateString()
  visitDate: string;

  @IsString()
  @IsOptional()
  visitTime?: string;

  @IsString()
  @IsOptional()
  leaveTime?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

