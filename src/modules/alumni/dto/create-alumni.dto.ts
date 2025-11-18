import {
  IsNumber,
  IsDateString,
  IsString,
  IsOptional,
  IsEnum,
  IsEmail,
  Min,
  Max,
  MinLength,
  MaxLength,
} from 'class-validator';

export class CreateAlumniDto {
  @IsNumber()
  studentId: number;

  @IsNumber()
  @Min(1900)
  @Max(2100)
  graduationYear: number;

  @IsDateString()
  graduationDate: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  finalGrade: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(4)
  gpa?: number;

  @IsNumber()
  @IsOptional()
  @Min(1)
  rank?: number;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  currentOccupation?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  company?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  position?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  industry?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  salaryRange?: number;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  address?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  phone?: string;

  @IsEmail({}, { message: 'Format email tidak valid' })
  @IsOptional()
  @MaxLength(255)
  email?: string;

  @IsEnum(['employed', 'unemployed', 'studying', 'self_employed'], {
    message: 'Status harus salah satu dari: employed, unemployed, studying, self_employed',
  })
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

