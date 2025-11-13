import { IsEmail, IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class ForgotPasswordDto {
  @IsNotEmpty({ message: 'Email wajib diisi' })
  @IsEmail({}, { message: 'Format email tidak valid' })
  email: string;
}

export class ResetPasswordDto {
  @IsNotEmpty({ message: 'Email wajib diisi' })
  @IsEmail({}, { message: 'Format email tidak valid' })
  email: string;

  @IsNotEmpty({ message: 'Password baru wajib diisi' })
  @IsString()
  newPassword: string;

  @IsNotEmpty({ message: 'Konfirmasi password wajib diisi' })
  @IsString()
  confirmPassword: string;

  @IsOptional()
  @IsString()
  resetToken?: string;
}

