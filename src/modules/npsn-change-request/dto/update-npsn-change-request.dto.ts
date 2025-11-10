import { IsEnum, IsOptional, IsString } from 'class-validator';
import { NpsnChangeRequestStatus } from '../entities/npsn-change-request.entity';

export class UpdateNpsnChangeRequestDto {
  @IsEnum(NpsnChangeRequestStatus)
  status: NpsnChangeRequestStatus;

  @IsOptional()
  @IsString()
  reviewNote?: string;
}

