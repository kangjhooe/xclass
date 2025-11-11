import { IsDateString, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateAccessRequestDto {
  @IsInt()
  @Min(1)
  tenantId: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  reason?: string;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}

