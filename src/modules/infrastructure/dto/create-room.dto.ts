import {
  IsEnum,
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
import { RoomCondition, RoomUsageType } from '../entities/room.entity';

export class CreateRoomDto {
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  buildingId: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name: string;

  @IsEnum(RoomUsageType)
  usageType: RoomUsageType;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  areaM2: number;

  @IsEnum(RoomCondition)
  condition: RoomCondition;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  floorNumber: number;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  @IsPositive()
  capacity?: number;

  @IsOptional()
  @Transform(({ value }) => (value === null || value === '' ? undefined : value))
  @IsString()
  notes?: string;
}


