import {
  IsNumber,
  IsEnum,
  IsDateString,
  IsString,
  IsOptional,
} from 'class-validator';
import {
  MaintenanceType,
  MaintenanceStatus,
} from '../entities/inventory-maintenance.entity';

export class CreateInventoryMaintenanceDto {
  @IsNumber()
  itemId: number;

  @IsEnum(MaintenanceType)
  maintenanceType: MaintenanceType;

  @IsDateString()
  maintenanceDate: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  cost?: number;

  @IsString()
  @IsOptional()
  technician?: string;

  @IsString()
  @IsOptional()
  technicianContact?: string;

  @IsEnum(MaintenanceStatus)
  @IsOptional()
  status?: MaintenanceStatus;

  @IsDateString()
  @IsOptional()
  completionDate?: string;

  @IsDateString()
  @IsOptional()
  nextMaintenanceDate?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

