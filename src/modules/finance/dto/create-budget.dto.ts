import {
  IsNumber,
  IsDateString,
  IsEnum,
  IsString,
  IsOptional,
  Min,
} from 'class-validator';
import { BudgetCategory, BudgetPeriod, BudgetStatus } from '../entities/budget.entity';

export class CreateBudgetDto {
  @IsEnum(BudgetCategory)
  category: BudgetCategory;

  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  plannedAmount: number;

  @IsEnum(BudgetPeriod)
  period: BudgetPeriod;

  @IsNumber()
  periodValue: number;

  @IsNumber()
  year: number;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsEnum(BudgetStatus)
  @IsOptional()
  status?: BudgetStatus;

  @IsString()
  @IsOptional()
  notes?: string;
}

