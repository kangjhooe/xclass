import { IsDateString, IsOptional, IsString, MaxLength } from 'class-validator';

export class ApproveAccessRequestDto {
  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}

