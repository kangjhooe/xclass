import {
  IsEnum,
  IsString,
  IsNumber,
  IsDateString,
  IsOptional,
  Min,
} from 'class-validator';
import { TransactionType, IncomeCategory, ExpenseCategory } from '../entities/income-expense.entity';

export class CreateIncomeExpenseDto {
  @IsEnum(TransactionType)
  transactionType: TransactionType;

  @IsString()
  category: string; // IncomeCategory atau ExpenseCategory

  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsDateString()
  transactionDate: string;

  @IsString()
  @IsOptional()
  referenceNumber?: string;

  @IsString()
  @IsOptional()
  vendor?: string;

  @IsString()
  @IsOptional()
  recipient?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

