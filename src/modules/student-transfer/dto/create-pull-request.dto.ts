import { IsString, IsOptional, IsArray, IsDateString } from 'class-validator';

export class CreatePullRequestDto {
  @IsString()
  sourceTenantNpsn: string; // NPSN tenant B (sumber siswa)

  @IsString()
  studentNisn: string; // NISN siswa yang akan ditarik

  @IsString()
  @IsOptional()
  reason?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsDateString()
  @IsOptional()
  transferDate?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  documents?: string[];
}

