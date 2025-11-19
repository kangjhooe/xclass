import {
  IsNumber,
  IsDateString,
  IsString,
  IsOptional,
} from 'class-validator';

export class UpdateSppFrontendDto {
  @IsNumber()
  @IsOptional()
  studentId?: number;

  @IsNumber()
  @IsOptional()
  month?: number;

  @IsNumber()
  @IsOptional()
  year?: number;

  @IsNumber()
  @IsOptional()
  amount?: number;

  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

