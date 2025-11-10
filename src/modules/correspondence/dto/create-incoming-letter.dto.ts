import {
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  IsArray,
  IsObject,
} from 'class-validator';
import {
  LetterStatus,
  LetterPriority,
  LetterNature,
  LetterType,
} from '../entities/incoming-letter.entity';

export class CreateIncomingLetterDto {
  @IsString()
  nomorSurat: string;

  @IsDateString()
  tanggalTerima: string;

  @IsString()
  pengirim: string;

  @IsString()
  perihal: string;

  @IsArray()
  @IsOptional()
  lampiran?: string[];

  @IsString()
  @IsOptional()
  filePath?: string;

  @IsEnum(LetterStatus)
  @IsOptional()
  status?: LetterStatus;

  @IsString()
  @IsOptional()
  catatan?: string;

  @IsObject()
  @IsOptional()
  disposisi?: Record<string, any>;

  @IsString()
  @IsOptional()
  jenisSurat?: string;

  @IsEnum(LetterPriority)
  @IsOptional()
  prioritas?: LetterPriority;

  @IsEnum(LetterNature)
  @IsOptional()
  sifatSurat?: LetterNature;

  @IsString()
  @IsOptional()
  isiRingkas?: string;

  @IsString()
  @IsOptional()
  tindakLanjut?: string;

  @IsDateString()
  @IsOptional()
  tanggalDisposisi?: string;

  @IsString()
  @IsOptional()
  penerimaDisposisi?: string;
}
