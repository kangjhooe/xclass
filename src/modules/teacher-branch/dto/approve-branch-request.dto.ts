import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class ApproveBranchRequestDto {
  @IsString()
  @IsOptional()
  notes?: string;

  @IsBoolean()
  @IsOptional()
  copyQuestionBanks?: boolean; // Opsi untuk copy bank soal ke tenant baru (override dari request)
}

