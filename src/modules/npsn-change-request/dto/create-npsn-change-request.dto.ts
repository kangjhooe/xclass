import { IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';

export class CreateNpsnChangeRequestDto {
  @IsNotEmpty({ message: 'NPSN baru wajib diisi' })
  @IsString({ message: 'NPSN baru harus berupa string' })
  @MinLength(8, { message: 'NPSN harus minimal 8 karakter' })
  @MaxLength(20, { message: 'NPSN maksimal 20 karakter' })
  requestedNpsn: string;

  @IsNotEmpty({ message: 'Alasan perubahan wajib diisi' })
  @IsString({ message: 'Alasan harus berupa string' })
  reason: string;
}

