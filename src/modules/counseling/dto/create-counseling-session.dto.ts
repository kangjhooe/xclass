import {
  IsNumber,
  IsDateString,
  IsString,
  IsEnum,
  IsOptional,
  IsNotEmpty,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCounselingSessionDto {
  @ApiProperty({ description: 'ID siswa yang akan dikonseling', example: 1 })
  @IsNumber()
  @IsNotEmpty({ message: 'ID siswa wajib diisi' })
  studentId: number;

  @ApiPropertyOptional({ description: 'ID konselor (opsional)', example: 5 })
  @IsNumber()
  @IsOptional()
  counselorId?: number;

  @ApiProperty({ description: 'Tanggal dan waktu sesi konseling (ISO format)', example: '2024-12-20T10:00:00Z' })
  @IsDateString({}, { message: 'Format tanggal sesi tidak valid' })
  @IsNotEmpty({ message: 'Tanggal sesi wajib diisi' })
  sessionDate: string;

  @ApiProperty({ description: 'Masalah yang akan dikonseling (min 10 karakter)', example: 'Siswa mengalami kesulitan dalam memahami pelajaran matematika' })
  @IsString()
  @IsNotEmpty({ message: 'Masalah wajib diisi' })
  @MinLength(10, { message: 'Masalah minimal 10 karakter' })
  @MaxLength(2000, { message: 'Masalah maksimal 2000 karakter' })
  issue: string;

  @ApiPropertyOptional({ description: 'Catatan tambahan tentang sesi konseling', example: 'Siswa menunjukkan minat yang baik selama sesi' })
  @IsString()
  @IsOptional()
  @MaxLength(5000, { message: 'Catatan maksimal 5000 karakter' })
  notes?: string;

  @ApiPropertyOptional({ 
    description: 'Status sesi konseling', 
    enum: ['scheduled', 'in_progress', 'completed', 'cancelled'],
    default: 'scheduled',
    example: 'scheduled'
  })
  @IsEnum(['scheduled', 'in_progress', 'completed', 'cancelled'], {
    message: 'Status tidak valid',
  })
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ description: 'Tindak lanjut yang perlu dilakukan', example: 'Memberikan latihan tambahan dan follow-up dalam 1 minggu' })
  @IsString()
  @IsOptional()
  @MaxLength(2000, { message: 'Tindak lanjut maksimal 2000 karakter' })
  followUp?: string;

  @ApiPropertyOptional({ description: 'Tanggal tindak lanjut (ISO format)', example: '2024-12-27T10:00:00Z' })
  @IsDateString({}, { message: 'Format tanggal tindak lanjut tidak valid' })
  @IsOptional()
  followUpDate?: string;
}

