import {
  IsNumber,
  IsDateString,
  IsEnum,
  IsString,
  IsOptional,
} from 'class-validator';
import { PaymentMethod, PaymentStatus } from '../entities/spp-payment.entity';

export class CreateSppPaymentDto {
  @IsNumber()
  studentId: number;

  @IsString()
  paymentPeriod: string;

  @IsNumber()
  paymentYear: number;

  @IsNumber()
  paymentMonth: number;

  @IsNumber()
  amount: number;

  @IsDateString()
  dueDate: string;

  @IsEnum(PaymentMethod)
  @IsOptional()
  paymentMethod?: PaymentMethod;

  @IsString()
  @IsOptional()
  paymentReference?: string;

  @IsEnum(PaymentStatus)
  @IsOptional()
  paymentStatus?: PaymentStatus;

  @IsString()
  @IsOptional()
  paymentNotes?: string;
}

