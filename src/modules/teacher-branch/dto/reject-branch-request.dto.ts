import { IsString } from 'class-validator';

export class RejectBranchRequestDto {
  @IsString()
  rejectionReason: string;
}

