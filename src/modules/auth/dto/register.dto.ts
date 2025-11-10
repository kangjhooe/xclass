import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional } from 'class-validator';

export class RegisterDto {
  @IsNotEmpty({ message: 'NPSN wajib diisi' })
  @IsString()
  @MinLength(8, { message: 'NPSN harus minimal 8 karakter' })
  npsn: string;

  @IsNotEmpty({ message: 'Nama Instansi wajib diisi' })
  @IsString()
  name: string;

  @IsNotEmpty({ message: 'Jenis Instansi wajib dipilih' })
  @IsString()
  jenisInstansi: string;

  @IsNotEmpty({ message: 'Jenjang wajib dipilih' })
  @IsString()
  jenjang: string;

  @IsNotEmpty({ message: 'Status wajib dipilih' })
  @IsString()
  status: string;

  @IsNotEmpty({ message: 'Email instansi wajib diisi' })
  @IsEmail({}, { message: 'Format email tidak valid' })
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsNotEmpty({ message: 'Password wajib diisi' })
  @IsString()
  @MinLength(8, { message: 'Password minimal 8 karakter' })
  password: string;

  @IsNotEmpty({ message: 'Konfirmasi password wajib diisi' })
  @IsString()
  password_confirmation: string;

  @IsNotEmpty({ message: 'Nama PIC wajib diisi' })
  @IsString()
  picName: string;

  @IsNotEmpty({ message: 'No WA PIC wajib diisi' })
  @IsString()
  picWhatsapp: string;
}

