import { IsEmail, IsString, IsNotEmpty, IsOptional, ValidateIf, Matches, MaxLength } from 'class-validator';

export class LoginDto {
  @IsOptional()
  @IsEmail({}, { message: 'Format email tidak valid' })
  @ValidateIf((o) => !o.nik)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(16, { message: 'NIK maksimal 16 karakter' })
  @ValidateIf((o) => o.nik !== undefined && o.nik !== null && o.nik !== '')
  @Matches(/^\d{16}$/, { message: 'NIK harus 16 digit angka' })
  nik?: string; // Untuk siswa atau guru

  @IsString()
  @IsNotEmpty({ message: 'Password wajib diisi' })
  password: string;
}

