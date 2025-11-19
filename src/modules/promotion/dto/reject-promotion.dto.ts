import { IsString, IsOptional } from 'class-validator';

export class RejectPromotionDto {
  @IsString()
  @IsOptional()
  reason?: string;
}

