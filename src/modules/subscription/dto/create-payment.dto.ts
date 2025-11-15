import { IsEnum, IsNumber, IsString, IsOptional, Min } from 'class-validator';
import { PaymentGatewayMethod } from '../entities/payment-gateway-transaction.entity';

export class CreatePaymentDto {
  @IsEnum(PaymentGatewayMethod)
  paymentMethod: PaymentGatewayMethod;

  @IsNumber()
  @Min(1)
  amount: number;

  @IsString()
  @IsOptional()
  bankCode?: string; // For Virtual Account: BCA, BNI, BRI, MANDIRI, PERMATA

  @IsString()
  @IsOptional()
  channelCode?: string; // For E-Wallet: OVO, DANA, LINKAJA, SHOPEEPAY
}

