import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional, MaxLength, Matches } from 'class-validator';
import { MatchPassword } from '../../../common/validators/match-password.validator';

export class RegisterDto {
  @IsNotEmpty({ message: 'NPSN wajib diisi' })
  @IsString()
  @MinLength(8, { message: 'NPSN harus minimal 8 karakter' })
  @MaxLength(8, { message: 'NPSN harus 8 karakter' })
  @Matches(/^\d{8}$/, { message: 'NPSN harus 8 digit angka' })
  npsn: string;

  @IsNotEmpty({ message: 'Nama Instansi wajib diisi' })
  @IsString()
  @MinLength(3, { message: 'Nama Instansi minimal 3 karakter' })
  @MaxLength(255, { message: 'Nama Instansi maksimal 255 karakter' })
  name: string;

  @IsNotEmpty({ message: 'Jenis Instansi wajib dipilih' })
  @IsString()
  @MaxLength(50, { message: 'Jenis Instansi maksimal 50 karakter' })
  jenisInstansi: string;

  @IsNotEmpty({ message: 'Jenjang wajib dipilih' })
  @IsString()
  @MaxLength(50, { message: 'Jenjang maksimal 50 karakter' })
  jenjang: string;

  @IsNotEmpty({ message: 'Status wajib dipilih' })
  @IsString()
  @MaxLength(50, { message: 'Status maksimal 50 karakter' })
  status: string;

  @IsNotEmpty({ message: 'Email instansi wajib diisi' })
  @IsEmail({}, { message: 'Format email tidak valid' })
  @MaxLength(255, { message: 'Email maksimal 255 karakter' })
  email: string;

  @IsOptional()
  @IsString()
  @MaxLength(20, { message: 'Nomor telepon maksimal 20 karakter' })
  @Matches(/^[0-9+\-\s()]*$/, { message: 'Format nomor telepon tidak valid' })
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Alamat maksimal 500 karakter' })
  address?: string;

  @IsNotEmpty({ message: 'Password wajib diisi' })
  @IsString()
  @MinLength(8, { message: 'Password minimal 8 karakter' })
  @MaxLength(100, { message: 'Password maksimal 100 karakter' })
  password: string;

  @IsNotEmpty({ message: 'Konfirmasi password wajib diisi' })
  @IsString()
  @MatchPassword('password', { message: 'Password dan konfirmasi password tidak cocok' })
  password_confirmation: string;

  @IsNotEmpty({ message: 'Nama PIC wajib diisi' })
  @IsString()
  @MinLength(3, { message: 'Nama PIC minimal 3 karakter' })
  @MaxLength(255, { message: 'Nama PIC maksimal 255 karakter' })
  picName: string;

  @IsNotEmpty({ message: 'No WA PIC wajib diisi' })
  @IsString()
  @MaxLength(20, { message: 'No WA PIC maksimal 20 karakter' })
  @Matches(/^[0-9+\-\s()]*$/, { message: 'Format nomor WhatsApp tidak valid' })
  picWhatsapp: string;

  @IsOptional()
  @IsString()
  recaptcha_token?: string;
}

