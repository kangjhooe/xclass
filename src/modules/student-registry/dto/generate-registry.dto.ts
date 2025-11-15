import { IsOptional, IsString, IsNumber, IsBoolean, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GenerateRegistryDto {
  @ApiProperty({ description: 'NIK siswa' })
  @IsString()
  nik: string;

  @ApiPropertyOptional({ description: 'Tahun ajaran (opsional, default: tahun ajaran aktif)' })
  @IsOptional()
  @IsString()
  academicYear?: string;

  @ApiPropertyOptional({ description: 'Include digital signature' })
  @IsOptional()
  @IsBoolean()
  includeSignature?: boolean;

  @ApiPropertyOptional({ description: 'Signature ID (jika includeSignature = true)' })
  @IsOptional()
  @IsNumber()
  signatureId?: number;

  @ApiPropertyOptional({ description: 'Filter kategori data yang ditampilkan', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categories?: string[];

  @ApiPropertyOptional({ description: 'Format output', enum: ['pdf', 'json', 'html'] })
  @IsOptional()
  @IsString()
  format?: 'pdf' | 'json' | 'html';
}

export class BatchGenerateRegistryDto {
  @ApiProperty({ description: 'Array of NIK siswa', type: [String] })
  @IsArray()
  @IsString({ each: true })
  niks: string[];

  @ApiPropertyOptional({ description: 'Tahun ajaran' })
  @IsOptional()
  @IsString()
  academicYear?: string;

  @ApiPropertyOptional({ description: 'Include digital signature' })
  @IsOptional()
  @IsBoolean()
  includeSignature?: boolean;

  @ApiPropertyOptional({ description: 'Format output', enum: ['pdf', 'zip'] })
  @IsOptional()
  @IsString()
  format?: 'pdf' | 'zip';
}

export class RegistryFilterDto {
  @ApiPropertyOptional({ description: 'Filter berdasarkan kelas' })
  @IsOptional()
  @IsNumber()
  classId?: number;

  @ApiPropertyOptional({ description: 'Filter berdasarkan tahun ajaran' })
  @IsOptional()
  @IsString()
  academicYear?: string;

  @ApiPropertyOptional({ description: 'Filter berdasarkan level akademik', enum: ['SD', 'SMP', 'SMA', 'SMK'] })
  @IsOptional()
  @IsString()
  academicLevel?: string;

  @ApiPropertyOptional({ description: 'Filter berdasarkan status siswa' })
  @IsOptional()
  @IsString()
  status?: string;
}

