import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsDateString,
} from 'class-validator';
import { CardType, CardStatus } from '../entities/card.entity';

export class CreateCardDto {
  @IsEnum(CardType)
  type: CardType;

  @IsNumber()
  @IsOptional()
  studentId?: number;

  @IsNumber()
  @IsOptional()
  teacherId?: number;

  @IsString()
  cardNumber: string;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  photo?: string;

  @IsString()
  @IsOptional()
  nisn?: string;

  @IsString()
  @IsOptional()
  nip?: string;

  @IsDateString()
  @IsOptional()
  birthDate?: string;

  @IsString()
  @IsOptional()
  birthPlace?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  classRoom?: string;

  @IsString()
  @IsOptional()
  position?: string;

  @IsEnum(CardStatus)
  @IsOptional()
  status?: CardStatus;

  @IsDateString()
  @IsOptional()
  validFrom?: string;

  @IsDateString()
  @IsOptional()
  validUntil?: string;

  @IsNumber()
  @IsOptional()
  templateId?: number;

  @IsString()
  @IsOptional()
  templateData?: string;
}

