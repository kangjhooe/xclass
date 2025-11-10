import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsDateString,
  IsArray,
} from 'class-validator';
import { ItemStatus, ItemCondition } from '../entities/inventory-item.entity';

export class CreateInventoryItemDto {
  @IsString()
  itemCode: string;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  subcategory?: string;

  @IsString()
  @IsOptional()
  brand?: string;

  @IsString()
  @IsOptional()
  model?: string;

  @IsString()
  @IsOptional()
  serialNumber?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  unit?: string;

  @IsNumber()
  @IsOptional()
  quantity?: number;

  @IsNumber()
  @IsOptional()
  minimumStock?: number;

  @IsNumber()
  @IsOptional()
  maximumStock?: number;

  @IsNumber()
  @IsOptional()
  unitPrice?: number;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  room?: string;

  @IsString()
  @IsOptional()
  shelf?: string;

  @IsEnum(ItemStatus)
  @IsOptional()
  status?: ItemStatus;

  @IsEnum(ItemCondition)
  @IsOptional()
  condition?: ItemCondition;

  @IsDateString()
  @IsOptional()
  purchaseDate?: string;

  @IsNumber()
  @IsOptional()
  purchasePrice?: number;

  @IsString()
  @IsOptional()
  supplier?: string;

  @IsDateString()
  @IsOptional()
  warrantyExpiry?: string;

  @IsNumber()
  @IsOptional()
  maintenanceSchedule?: number;

  @IsDateString()
  @IsOptional()
  lastMaintenance?: string;

  @IsDateString()
  @IsOptional()
  nextMaintenance?: string;

  @IsNumber()
  @IsOptional()
  responsiblePerson?: number;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsArray()
  @IsOptional()
  images?: string[];
}

