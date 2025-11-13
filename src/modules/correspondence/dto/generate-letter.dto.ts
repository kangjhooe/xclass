import {
  IsInt,
  IsString,
  IsOptional,
  IsEnum,
  IsObject,
} from 'class-validator';
import { GeneratedLetterStatus } from '../entities/generated-letter.entity';

export class GenerateLetterDto {
  @IsInt()
  templateId: number;

  @IsString()
  subject: string;

  @IsOptional()
  @IsString()
  recipient?: string;

  @IsOptional()
  @IsString()
  letterDate?: string;

  @IsOptional()
  @IsEnum(GeneratedLetterStatus)
  status?: GeneratedLetterStatus;

  @IsObject()
  variables: Record<string, any>;
}


