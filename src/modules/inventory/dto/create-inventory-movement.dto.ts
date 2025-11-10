import {
  IsNumber,
  IsEnum,
  IsString,
  IsOptional,
} from 'class-validator';
import { MovementType } from '../entities/inventory-movement.entity';

export class CreateInventoryMovementDto {
  @IsNumber()
  itemId: number;

  @IsEnum(MovementType)
  type: MovementType;

  @IsNumber()
  quantity: number;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  referenceNumber?: string;
}

