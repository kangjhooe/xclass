import {
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  IsArray,
} from 'class-validator';
import {
  OutgoingLetterStatus,
  LetterPriority,
  LetterNature,
} from '../entities/outgoing-letter.entity';

export class CreateOutgoingLetterDto {
  @IsString()
  nomorSurat: string;

  @IsDateString()
  tanggalSurat: string;

  @IsString()
  jenisSurat: string;

  @IsString()
  tujuan: string;

  @IsString()
  perihal: string;

  @IsString()
  isiSurat: string;

  @IsString()
  @IsOptional()
  filePath?: string;

  @IsEnum(OutgoingLetterStatus)
  @IsOptional()
  status?: OutgoingLetterStatus;

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
  tanggalKirim?: string;

  @IsString()
  @IsOptional()
  pengirim?: string;

  @IsArray()
  @IsOptional()
  lampiran?: string[];
}
