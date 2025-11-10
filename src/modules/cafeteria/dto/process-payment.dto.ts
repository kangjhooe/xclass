import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class ProcessPaymentDto {
  @IsEnum(['cash', 'card', 'transfer', 'qris'])
  paymentMethod: string;

  @IsNumber()
  @Min(0)
  paymentAmount: number;

  @IsString()
  @IsOptional()
  paymentReference?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

