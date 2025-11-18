import {
  IsString,
  IsEnum,
  IsArray,
  IsOptional,
  IsDateString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class AttachmentDto {
  @IsString()
  filename: string;

  @IsString()
  originalName: string;

  @IsString()
  url: string;

  @IsOptional()
  size?: number;

  @IsOptional()
  mimeType?: string;
}

export class CreateSuperAdminAnnouncementDto {
  @IsString()
  title: string;

  @IsString()
  content: string;

  @IsEnum(['low', 'medium', 'high', 'urgent'])
  @IsOptional()
  priority?: string;

  @IsEnum(['draft', 'published', 'archived'])
  @IsOptional()
  status?: string;

  // Filter untuk target tenant
  @IsArray()
  @IsOptional()
  targetTenantIds?: number[];

  // Filter untuk jenjang
  @IsArray()
  @IsOptional()
  targetJenjang?: string[];

  // Filter untuk jenis
  @IsArray()
  @IsOptional()
  targetJenis?: string[];

  // Lampiran
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttachmentDto)
  @IsOptional()
  attachments?: AttachmentDto[];

  @IsDateString()
  @IsOptional()
  publishAt?: string;

  @IsDateString()
  @IsOptional()
  expiresAt?: string;
}

