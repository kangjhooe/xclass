import {
  IsNumber,
  IsEnum,
  IsString,
  IsOptional,
  Min,
} from 'class-validator';
import { SavingsTransactionType } from '../entities/student-savings.entity';

export class CreateSavingsDto {
  @IsNumber()
  studentId: number;

  @IsEnum(SavingsTransactionType)
  transactionType: SavingsTransactionType;

  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  receiptNumber?: string;
}

