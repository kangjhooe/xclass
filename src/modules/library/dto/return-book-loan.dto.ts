import { IsString, IsOptional, IsNumber } from 'class-validator';

export class ReturnBookLoanDto {
  @IsString()
  @IsOptional()
  returnNotes?: string;

  @IsNumber()
  @IsOptional()
  fineAmount?: number;
}

