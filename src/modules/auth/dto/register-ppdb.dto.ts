import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterPpdbDto {
  @IsNotEmpty({ message: 'Nama lengkap wajib diisi' })
  @IsString()
  name: string;

  @IsNotEmpty({ message: 'Email wajib diisi' })
  @IsEmail({}, { message: 'Format email tidak valid' })
  email: string;

  @IsNotEmpty({ message: 'Password wajib diisi' })
  @IsString()
  @MinLength(8, { message: 'Password minimal 8 karakter' })
  password: string;

  @IsNotEmpty({ message: 'Konfirmasi password wajib diisi' })
  @IsString()
  password_confirmation: string;

  @IsNotEmpty({ message: 'NPSN sekolah tujuan wajib diisi' })
  @IsString()
  npsn: string;
}

