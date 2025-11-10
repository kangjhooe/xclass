import { IsEnum, IsString, IsOptional, IsNumber } from 'class-validator';
import { PaymentMethod } from '../entities/spp-payment.entity';

export class MarkPaymentPaidDto {
  @IsEnum(PaymentMethod)
  @IsOptional()
  paymentMethod?: PaymentMethod;

  @IsString()
  @IsOptional()
  paymentReference?: string;

  @IsString()
  @IsOptional()
  paymentNotes?: string;

  @IsString()
  @IsOptional()
  receiptNumber?: string;
}

