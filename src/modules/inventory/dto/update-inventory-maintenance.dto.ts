import { PartialType } from '@nestjs/mapped-types';
import { CreateInventoryMaintenanceDto } from './create-inventory-maintenance.dto';

export class UpdateInventoryMaintenanceDto extends PartialType(
  CreateInventoryMaintenanceDto,
) {}

