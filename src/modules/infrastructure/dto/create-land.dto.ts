import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { LandOwnershipStatus } from '../entities/land.entity';

export class CreateLandDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  areaM2: number;

  @IsEnum(LandOwnershipStatus)
  ownershipStatus: LandOwnershipStatus;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  ownershipDocumentPath?: string;

  @IsOptional()
  @Transform(({ value }) => (value === null || value === '' ? undefined : value))
  @IsString()
  @MaxLength(500)
  address?: string;

  @IsOptional()
  @Transform(({ value }) => (value === null || value === '' ? undefined : value))
  @IsString()
  notes?: string;
}


