import { IsNumber, IsString, IsOptional, IsDateString, IsBoolean } from 'class-validator';

export class CreateTeacherBranchRequestDto {
  @IsNumber()
  teacherId: number;

  @IsNumber()
  @IsOptional()
  toTenantId?: number; // Bisa pakai tenantId atau npsn

  @IsString()
  @IsOptional()
  toTenantNpsn?: string; // Untuk pencarian dengan NPSN

  @IsString()
  @IsOptional()
  reason?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsDateString()
  @IsOptional()
  branchDate?: string;

  @IsBoolean()
  @IsOptional()
  copyQuestionBanks?: boolean; // Opsi untuk copy bank soal ke tenant baru
}

