import { IsNotEmpty, IsArray, IsEnum, IsOptional, IsString } from 'class-validator';
import { RegistrationStatus } from '../entities/ppdb-registration.entity';

export class BulkUpdateStatusDto {
  @IsNotEmpty({ message: 'ID pendaftaran wajib diisi' })
  @IsArray()
  registrationIds: number[];

  @IsNotEmpty({ message: 'Status wajib diisi' })
  @IsEnum(RegistrationStatus)
  status: RegistrationStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class BulkExportDto {
  @IsOptional()
  @IsArray()
  registrationIds?: number[];

  @IsOptional()
  @IsEnum(RegistrationStatus)
  status?: RegistrationStatus;

  @IsOptional()
  @IsString()
  format?: 'excel' | 'pdf';
}

export class BulkImportScoreDto {
  @IsNotEmpty({ message: 'Data skor wajib diisi' })
  @IsArray()
  scores: Array<{
    registrationId: number;
    selectionScore?: number;
    interviewScore?: number;
    documentScore?: number;
  }>;
}

export class BulkSendNotificationDto {
  @IsNotEmpty({ message: 'ID pendaftaran wajib diisi' })
  @IsArray()
  registrationIds: number[];

  @IsNotEmpty({ message: 'Subjek email wajib diisi' })
  @IsString()
  subject: string;

  @IsNotEmpty({ message: 'Isi email wajib diisi' })
  @IsString()
  message: string;
}

