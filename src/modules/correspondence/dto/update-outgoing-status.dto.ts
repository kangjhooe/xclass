import { IsString, IsEnum } from 'class-validator';

export class UpdateOutgoingStatusDto {
  @IsString()
  @IsEnum(['draft', 'menunggu_ttd', 'terkirim', 'arsip'], {
    message: 'Status must be one of: draft, menunggu_ttd, terkirim, arsip',
  })
  status: string;
}

