import { IsString } from 'class-validator';

export class RejectTransferDto {
  @IsString()
  rejectionReason: string;
}

