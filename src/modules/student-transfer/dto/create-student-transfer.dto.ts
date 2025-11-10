import { IsNumber, IsString, IsOptional } from 'class-validator';

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
}

