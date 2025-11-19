import {
  IsNumber,
  IsDateString,
  IsEnum,
  IsString,
  IsOptional,
  Min,
} from 'class-validator';
import { BillCategory } from '../entities/other-bill.entity';
import { PaymentMethod, PaymentStatus } from '../entities/spp-payment.entity';

export class CreateOtherBillDto {
  @IsNumber()
  studentId: number;

  @IsEnum(BillCategory)
  category: BillCategory;

  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsDateString()
  dueDate: string;

  @IsEnum(PaymentMethod)
  @IsOptional()
  paymentMethod?: PaymentMethod;

  @IsEnum(PaymentStatus)
  @IsOptional()
  paymentStatus?: PaymentStatus;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  receiptNumber?: string;
}

