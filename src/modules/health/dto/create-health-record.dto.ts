import {
  IsNumber,
  IsDateString,
  IsString,
  IsEnum,
  IsOptional,
} from 'class-validator';

export class CreateHealthRecordDto {
  @IsNumber()
  studentId: number;

  @IsDateString()
  checkupDate: string;

  @IsEnum(['healthy', 'sick', 'recovering', 'chronic'])
  healthStatus: string;

  @IsNumber()
  @IsOptional()
  height?: number;

  @IsNumber()
  @IsOptional()
  weight?: number;

  @IsNumber()
  @IsOptional()
  temperature?: number;

  @IsString()
  @IsOptional()
  bloodPressure?: string;

  @IsString()
  @IsOptional()
  symptoms?: string;

  @IsString()
  @IsOptional()
  diagnosis?: string;

  @IsString()
  @IsOptional()
  treatment?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

