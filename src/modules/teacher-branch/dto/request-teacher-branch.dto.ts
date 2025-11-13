import { IsString, IsOptional, IsDateString, IsBoolean } from 'class-validator';

export class RequestTeacherBranchDto {
  @IsString()
  sourceTenantNpsn: string; // NPSN tenant induk

  @IsString()
  teacherNik: string; // NIK guru yang ingin dicabangkan

  @IsString()
  @IsOptional()
  reason?: string;

  @IsDateString()
  @IsOptional()
  branchDate?: string;

  @IsBoolean()
  @IsOptional()
  copyQuestionBanks?: boolean; // Opsi untuk copy bank soal ke tenant baru
}

