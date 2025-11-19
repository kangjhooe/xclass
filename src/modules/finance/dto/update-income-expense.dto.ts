import { PartialType } from '@nestjs/mapped-types';
import { CreateIncomeExpenseDto } from './create-income-expense.dto';

export class UpdateIncomeExpenseDto extends PartialType(CreateIncomeExpenseDto) {}

