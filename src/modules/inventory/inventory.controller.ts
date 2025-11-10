import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto';
import { UpdateInventoryItemDto } from './dto/update-inventory-item.dto';
import { CreateInventoryMovementDto } from './dto/create-inventory-movement.dto';
import { CreateInventoryMaintenanceDto } from './dto/create-inventory-maintenance.dto';
import { UpdateInventoryMaintenanceDto } from './dto/update-inventory-maintenance.dto';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { ItemStatus } from './entities/inventory-item.entity';
import { MovementType } from './entities/inventory-movement.entity';
import { MaintenanceStatus } from './entities/inventory-maintenance.entity';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  // ========== Items ==========
  @Post('items')
  createItem(
    @Body() createDto: CreateInventoryItemDto,
    @TenantId() instansiId: number,
  ) {
    return this.inventoryService.create(createDto, instansiId);
  }

  @Get('items')
  findAllItems(
    @TenantId() instansiId: number,
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('status') status?: ItemStatus,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.inventoryService.findAll({
      search,
      category,
      status,
      page: +page,
      limit: +limit,
      instansiId,
    });
  }

  @Get('items/:id')
  findOneItem(@Param('id') id: string, @TenantId() instansiId: number) {
    return this.inventoryService.findOne(+id, instansiId);
  }

  @Patch('items/:id')
  updateItem(
    @Param('id') id: string,
    @Body() updateDto: UpdateInventoryItemDto,
    @TenantId() instansiId: number,
  ) {
    return this.inventoryService.update(+id, updateDto, instansiId);
  }

  @Delete('items/:id')
  removeItem(@Param('id') id: string, @TenantId() instansiId: number) {
    return this.inventoryService.remove(+id, instansiId);
  }

  // ========== Movements ==========
  @Post('movements')
  createMovement(
    @Body() createDto: CreateInventoryMovementDto,
    @TenantId() instansiId: number,
    @Query('createdBy') createdBy?: number,
  ) {
    return this.inventoryService.createMovement(
      createDto,
      instansiId,
      createdBy ? +createdBy : undefined,
    );
  }

  @Get('movements')
  findAllMovements(
    @TenantId() instansiId: number,
    @Query('itemId') itemId?: number,
    @Query('type') type?: MovementType,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.inventoryService.findAllMovements({
      itemId: itemId ? +itemId : undefined,
      type,
      page: +page,
      limit: +limit,
      instansiId,
    });
  }

  // ========== Maintenance ==========
  @Post('maintenances')
  createMaintenance(
    @Body() createDto: CreateInventoryMaintenanceDto,
    @TenantId() instansiId: number,
    @Query('createdBy') createdBy?: number,
  ) {
    return this.inventoryService.createMaintenance(
      createDto,
      instansiId,
      createdBy ? +createdBy : undefined,
    );
  }

  @Get('maintenances')
  findAllMaintenances(
    @TenantId() instansiId: number,
    @Query('itemId') itemId?: number,
    @Query('status') status?: MaintenanceStatus,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.inventoryService.findAllMaintenances({
      itemId: itemId ? +itemId : undefined,
      status,
      page: +page,
      limit: +limit,
      instansiId,
    });
  }

  @Get('maintenances/:id')
  findOneMaintenance(
    @Param('id') id: string,
    @TenantId() instansiId: number,
  ) {
    return this.inventoryService.findOneMaintenance(+id, instansiId);
  }

  @Patch('maintenances/:id')
  updateMaintenance(
    @Param('id') id: string,
    @Body() updateDto: UpdateInventoryMaintenanceDto,
    @TenantId() instansiId: number,
  ) {
    return this.inventoryService.updateMaintenance(+id, updateDto, instansiId);
  }

  // ========== Reports ==========
  @Get('items/low-stock')
  getLowStockItems(@TenantId() instansiId: number) {
    return this.inventoryService.getLowStockItems(instansiId);
  }

  @Get('items/needing-maintenance')
  getItemsNeedingMaintenance(@TenantId() instansiId: number) {
    return this.inventoryService.getItemsNeedingMaintenance(instansiId);
  }

  @Get('statistics')
  getStatistics(@TenantId() instansiId: number) {
    return this.inventoryService.getStatistics(instansiId);
  }
}

