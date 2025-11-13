import { IsNumber, IsString, IsOptional, IsArray, IsDateString } from 'class-validator';

export class CreateStudentTransferDto {
  @IsNumber()
  studentId: number;

  @IsNumber()
  toTenantId: number;

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

