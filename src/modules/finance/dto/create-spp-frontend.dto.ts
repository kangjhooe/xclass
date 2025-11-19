import {
  IsNumber,
  IsDateString,
  IsString,
  IsOptional,
} from 'class-validator';

export class CreateSppFrontendDto {
  @IsNumber()
  studentId: number;

  @IsNumber()
  month: number;

  @IsNumber()
  year: number;

  @IsNumber()
  amount: number;

  @IsDateString()
  dueDate: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

