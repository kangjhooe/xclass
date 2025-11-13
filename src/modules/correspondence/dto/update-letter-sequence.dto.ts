import {
  IsString,
  IsOptional,
  IsInt,
  Min,
  IsEnum,
} from 'class-validator';
import { SequenceResetPeriod } from '../entities/letter-sequence.entity';

export class UpdateLetterSequenceDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  pattern?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  counter?: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  padding?: number;

  @IsEnum(SequenceResetPeriod)
  @IsOptional()
  resetPeriod?: SequenceResetPeriod;

  @IsString()
  @IsOptional()
  description?: string;
}


