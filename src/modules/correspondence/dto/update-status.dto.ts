import { IsString, IsEnum } from 'class-validator';

export class UpdateStatusDto {
  @IsString()
  @IsEnum(['baru', 'diproses', 'selesai'], {
    message: 'Status must be one of: baru, diproses, selesai',
  })
  status: string;
}

