import { IsEmail, IsNotEmpty, IsString, IsOptional, MinLength, MaxLength } from 'class-validator';
import { MatchPassword } from '../../../common/validators/match-password.validator';

export class ForgotPasswordDto {
  @IsNotEmpty({ message: 'Email wajib diisi' })
  @IsEmail({}, { message: 'Format email tidak valid' })
  @MaxLength(255, { message: 'Email maksimal 255 karakter' })
  email: string;
}

export class ResetPasswordDto {
  @IsNotEmpty({ message: 'Email wajib diisi' })
  @IsEmail({}, { message: 'Format email tidak valid' })
  @MaxLength(255, { message: 'Email maksimal 255 karakter' })
  email: string;

  @IsNotEmpty({ message: 'Password baru wajib diisi' })
  @IsString()
  @MinLength(8, { message: 'Password minimal 8 karakter' })
  @MaxLength(100, { message: 'Password maksimal 100 karakter' })
  newPassword: string;

  @IsNotEmpty({ message: 'Konfirmasi password wajib diisi' })
  @IsString()
  @MatchPassword('newPassword', { message: 'Password dan konfirmasi password tidak cocok' })
  confirmPassword: string;

  @IsOptional()
  @IsString()
  @MaxLength(255, { message: 'Reset token maksimal 255 karakter' })
  resetToken?: string;
}

