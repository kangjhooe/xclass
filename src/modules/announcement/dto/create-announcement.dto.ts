import {
  IsString,
  IsEnum,
  IsArray,
  IsOptional,
  IsDateString,
} from 'class-validator';

export class CreateAnnouncementDto {
  @IsString()
  title: string;

  @IsString()
  content: string;

  @IsEnum(['low', 'medium', 'high', 'urgent'])
  priority: string;

  @IsEnum(['draft', 'published', 'archived'])
  status: string;

  @IsArray()
  @IsEnum(['all', 'teachers', 'students', 'parents'], { each: true })
  targetAudience: string[];

  @IsDateString()
  @IsOptional()
  publishAt?: string;

  @IsDateString()
  @IsOptional()
  expiresAt?: string;
}

