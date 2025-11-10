import {
  IsNumber,
  IsDateString,
  IsEnum,
  IsString,
  IsOptional,
} from 'class-validator';
import { LoanStatus } from '../entities/book-loan.entity';

export class CreateBookLoanDto {
  @IsNumber()
  bookId: number;

  @IsNumber()
  @IsOptional()
  studentId?: number;

  @IsNumber()
  @IsOptional()
  teacherId?: number;

  @IsNumber()
  @IsOptional()
  staffId?: number;

  @IsDateString()
  @IsOptional()
  loanDate?: string;

  @IsDateString()
  dueDate: string;

  @IsEnum(LoanStatus)
  @IsOptional()
  status?: LoanStatus;

  @IsString()
  @IsOptional()
  loanNotes?: string;
}

