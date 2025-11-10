import { IsString, IsDateString, IsOptional } from 'class-validator';

export class AddDispositionDto {
  @IsString()
  penerima: string;

  @IsString()
  catatan: string;

  @IsDateString()
  @IsOptional()
  tanggal?: string;
}
