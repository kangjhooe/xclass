import { IsString, IsOptional, IsArray, IsDateString } from 'class-validator';

export class RequestStudentTransferDto {
  @IsString()
  sourceTenantNpsn: string;

  @IsString()
  studentNisn: string; // NIK siswa yang akan ditransfer (field name tetap studentNisn untuk backward compatibility)

  @IsString()
  @IsOptional()
  reason?: string;

  @IsDateString()
  @IsOptional()
  transferDate?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  documents?: string[];
}


