import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UploadPaymentDto {
  @IsNotEmpty({ message: 'Jumlah pembayaran wajib diisi' })
  @IsNumber()
  @Min(0, { message: 'Jumlah pembayaran harus lebih dari 0' })
  paymentAmount: number;

  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @IsOptional()
  @IsString()
  paymentReference?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class VerifyPaymentDto {
  @IsNotEmpty({ message: 'Status verifikasi wajib diisi' })
  @IsString()
  status: 'verified' | 'rejected';

  @IsOptional()
  @IsString()
  rejectionReason?: string;
}

