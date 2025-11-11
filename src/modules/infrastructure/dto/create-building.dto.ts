import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class CreateBuildingDto {
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  landId: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  floorCount: number;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  lengthM: number;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  widthM: number;

  @Type(() => Number)
  @IsInt()
  @Min(1900)
  @Max(new Date().getFullYear() + 1)
  builtYear: number;

  @IsOptional()
  @Transform(({ value }) => (value === null || value === '' ? undefined : value))
  @IsString()
  notes?: string;
}


