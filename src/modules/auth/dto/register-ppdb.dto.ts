import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength, Matches } from 'class-validator';
import { MatchPassword } from '../../../common/validators/match-password.validator';

export class RegisterPpdbDto {
  @IsNotEmpty({ message: 'Nama lengkap wajib diisi' })
  @IsString()
  @MinLength(3, { message: 'Nama lengkap minimal 3 karakter' })
  @MaxLength(255, { message: 'Nama lengkap maksimal 255 karakter' })
  name: string;

  @IsNotEmpty({ message: 'Email wajib diisi' })
  @IsEmail({}, { message: 'Format email tidak valid' })
  @MaxLength(255, { message: 'Email maksimal 255 karakter' })
  email: string;

  @IsNotEmpty({ message: 'Password wajib diisi' })
  @IsString()
  @MinLength(8, { message: 'Password minimal 8 karakter' })
  @MaxLength(100, { message: 'Password maksimal 100 karakter' })
  password: string;

  @IsNotEmpty({ message: 'Konfirmasi password wajib diisi' })
  @IsString()
  @MatchPassword('password', { message: 'Password dan konfirmasi password tidak cocok' })
  password_confirmation: string;

  @IsNotEmpty({ message: 'NPSN sekolah tujuan wajib diisi' })
  @IsString()
  @MinLength(8, { message: 'NPSN harus minimal 8 karakter' })
  @MaxLength(8, { message: 'NPSN harus 8 karakter' })
  @Matches(/^\d{8}$/, { message: 'NPSN harus 8 digit angka' })
  npsn: string;
}

