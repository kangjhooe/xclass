import { IsString, IsOptional } from 'class-validator';

export class ApproveTransferDto {
  @IsString()
  @IsOptional()
  notes?: string;
}

