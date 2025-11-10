import {
  IsNumber,
  IsDateString,
  IsEnum,
  IsOptional,
  IsArray,
  ValidateNested,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class PayrollItemDto {
  @IsString()
  name: string;

  @IsNumber()
  amount: number;

  @IsEnum(['allowance', 'deduction'])
  type: string;
}

export class CreatePayrollDto {
  @IsNumber()
  employeeId: number;

  @IsEnum(['employee', 'teacher', 'staff'])
  employeeType: string;

  @IsDateString()
  payrollDate: string;

  @IsNumber()
  basicSalary: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PayrollItemDto)
  @IsOptional()
  allowances?: PayrollItemDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PayrollItemDto)
  @IsOptional()
  deductions?: PayrollItemDto[];

  @IsString()
  @IsOptional()
  notes?: string;
}

