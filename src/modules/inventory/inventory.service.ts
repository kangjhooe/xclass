import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import {
  InventoryItem,
  ItemStatus,
} from './entities/inventory-item.entity';
import {
  InventoryMovement,
  MovementType,
} from './entities/inventory-movement.entity';
import {
  InventoryMaintenance,
  MaintenanceStatus,
} from './entities/inventory-maintenance.entity';
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto';
import { UpdateInventoryItemDto } from './dto/update-inventory-item.dto';
import { CreateInventoryMovementDto } from './dto/create-inventory-movement.dto';
import { CreateInventoryMaintenanceDto } from './dto/create-inventory-maintenance.dto';
import { UpdateInventoryMaintenanceDto } from './dto/update-inventory-maintenance.dto';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(InventoryItem)
    private itemsRepository: Repository<InventoryItem>,
    @InjectRepository(InventoryMovement)
    private movementsRepository: Repository<InventoryMovement>,
    @InjectRepository(InventoryMaintenance)
    private maintenancesRepository: Repository<InventoryMaintenance>,
  ) {}

  // ========== Inventory Items ==========
  async create(
    createDto: CreateInventoryItemDto,
    instansiId: number,
  ): Promise<InventoryItem> {
    // Check if item code already exists
    const existing = await this.itemsRepository.findOne({
      where: {
        itemCode: createDto.itemCode,
        instansiId,
      },
    });

    if (existing) {
      throw new BadRequestException('Item code already exists');
    }

    const item = this.itemsRepository.create({
      ...createDto,
      instansiId,
      quantity: createDto.quantity || 0,
      minimumStock: createDto.minimumStock || 0,
      status: createDto.status || ItemStatus.ACTIVE,
      purchaseDate: createDto.purchaseDate
        ? new Date(createDto.purchaseDate)
        : null,
      warrantyExpiry: createDto.warrantyExpiry
        ? new Date(createDto.warrantyExpiry)
        : null,
      lastMaintenance: createDto.lastMaintenance
        ? new Date(createDto.lastMaintenance)
        : null,
      nextMaintenance: createDto.nextMaintenance
        ? new Date(createDto.nextMaintenance)
        : null,
    });

    // Calculate total value
    if (item.quantity && item.unitPrice) {
      item.totalValue = item.quantity * item.unitPrice;
    }

    return await this.itemsRepository.save(item);
  }

  async findAll(filters: {
    search?: string;
    category?: string;
    status?: ItemStatus;
    page?: number;
    limit?: number;
    instansiId: number;
  }) {
    const {
      search,
      category,
      status,
      page = 1,
      limit = 20,
      instansiId,
    } = filters;

    const queryBuilder = this.itemsRepository
      .createQueryBuilder('item')
      .where('item.instansiId = :instansiId', { instansiId })
      .leftJoinAndSelect('item.movements', 'movements')
      .leftJoinAndSelect('item.maintenanceRecords', 'maintenanceRecords');

    if (search) {
      queryBuilder.andWhere(
        '(item.name LIKE :search OR item.itemCode LIKE :search OR item.serialNumber LIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (category) {
      queryBuilder.andWhere('item.category = :category', { category });
    }

    if (status) {
      queryBuilder.andWhere('item.status = :status', { status });
    }

    queryBuilder.orderBy('item.name', 'ASC');

    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number, instansiId: number) {
    const item = await this.itemsRepository.findOne({
      where: { id, instansiId },
      relations: ['movements', 'maintenanceRecords'],
    });

    if (!item) {
      throw new NotFoundException(`Inventory item with ID ${id} not found`);
    }

    return item;
  }

  async update(
    id: number,
    updateDto: UpdateInventoryItemDto,
    instansiId: number,
  ) {
    const item = await this.findOne(id, instansiId);

    if (updateDto.purchaseDate) {
      item.purchaseDate = new Date(updateDto.purchaseDate);
    }
    if (updateDto.warrantyExpiry) {
      item.warrantyExpiry = new Date(updateDto.warrantyExpiry);
    }
    if (updateDto.lastMaintenance) {
      item.lastMaintenance = new Date(updateDto.lastMaintenance);
    }
    if (updateDto.nextMaintenance) {
      item.nextMaintenance = new Date(updateDto.nextMaintenance);
    }

    Object.assign(item, updateDto);

    // Recalculate total value if quantity or unitPrice changed
    if (
      (updateDto.quantity !== undefined || updateDto.unitPrice !== undefined) &&
      item.quantity &&
      item.unitPrice
    ) {
      item.totalValue = item.quantity * item.unitPrice;
    }

    return await this.itemsRepository.save(item);
  }

  async remove(id: number, instansiId: number) {
    const item = await this.findOne(id, instansiId);
    await this.itemsRepository.remove(item);
    return { message: 'Inventory item deleted successfully' };
  }

  // ========== Inventory Movements ==========
  async createMovement(
    createDto: CreateInventoryMovementDto,
    instansiId: number,
    createdBy?: number,
  ) {
    const item = await this.findOne(createDto.itemId, instansiId);

    const movement = this.movementsRepository.create({
      ...createDto,
      instansiId,
      createdBy,
    });

    const savedMovement = await this.movementsRepository.save(movement);

    // Update item quantity based on movement type
    if (createDto.type === MovementType.IN) {
      item.quantity += createDto.quantity;
    } else if (createDto.type === MovementType.OUT) {
      if (item.quantity < createDto.quantity) {
        throw new BadRequestException('Insufficient stock');
      }
      item.quantity -= createDto.quantity;
    } else if (createDto.type === MovementType.ADJUSTMENT) {
      item.quantity = createDto.quantity;
    }

    // Update total value
    if (item.unitPrice) {
      item.totalValue = item.quantity * item.unitPrice;
    }

    await this.itemsRepository.save(item);

    return savedMovement;
  }

  async findAllMovements(filters: {
    itemId?: number;
    type?: MovementType;
    page?: number;
    limit?: number;
    instansiId: number;
  }) {
    const {
      itemId,
      type,
      page = 1,
      limit = 20,
      instansiId,
    } = filters;

    const queryBuilder = this.movementsRepository
      .createQueryBuilder('movement')
      .where('movement.instansiId = :instansiId', { instansiId })
      .leftJoinAndSelect('movement.item', 'item');

    if (itemId) {
      queryBuilder.andWhere('movement.itemId = :itemId', { itemId });
    }

    if (type) {
      queryBuilder.andWhere('movement.type = :type', { type });
    }

    queryBuilder.orderBy('movement.createdAt', 'DESC');

    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // ========== Inventory Maintenance ==========
  async createMaintenance(
    createDto: CreateInventoryMaintenanceDto,
    instansiId: number,
    createdBy?: number,
  ) {
    await this.findOne(createDto.itemId, instansiId);

    const maintenance = this.maintenancesRepository.create({
      ...createDto,
      instansiId,
      createdBy,
      maintenanceDate: new Date(createDto.maintenanceDate),
      status: createDto.status || MaintenanceStatus.SCHEDULED,
      nextMaintenanceDate: createDto.nextMaintenanceDate
        ? new Date(createDto.nextMaintenanceDate)
        : null,
    });

    return await this.maintenancesRepository.save(maintenance);
  }

  async findAllMaintenances(filters: {
    itemId?: number;
    status?: MaintenanceStatus;
    page?: number;
    limit?: number;
    instansiId: number;
  }) {
    const {
      itemId,
      status,
      page = 1,
      limit = 20,
      instansiId,
    } = filters;

    const queryBuilder = this.maintenancesRepository
      .createQueryBuilder('maintenance')
      .where('maintenance.instansiId = :instansiId', { instansiId })
      .leftJoinAndSelect('maintenance.item', 'item');

    if (itemId) {
      queryBuilder.andWhere('maintenance.itemId = :itemId', { itemId });
    }

    if (status) {
      queryBuilder.andWhere('maintenance.status = :status', { status });
    }

    queryBuilder.orderBy('maintenance.maintenanceDate', 'DESC');

    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOneMaintenance(id: number, instansiId: number) {
    const maintenance = await this.maintenancesRepository.findOne({
      where: { id, instansiId },
      relations: ['item'],
    });

    if (!maintenance) {
      throw new NotFoundException(
        `Maintenance with ID ${id} not found`,
      );
    }

    return maintenance;
  }

  async updateMaintenance(
    id: number,
    updateDto: UpdateInventoryMaintenanceDto,
    instansiId: number,
  ) {
    const maintenance = await this.findOneMaintenance(id, instansiId);

    if (updateDto.maintenanceDate) {
      maintenance.maintenanceDate = new Date(updateDto.maintenanceDate);
    }
    if (updateDto.completionDate) {
      maintenance.completionDate = new Date(updateDto.completionDate);
    }
    if (updateDto.nextMaintenanceDate) {
      maintenance.nextMaintenanceDate = new Date(updateDto.nextMaintenanceDate);
    }

    Object.assign(maintenance, updateDto);

    // If completed, update item's next maintenance date
    if (
      updateDto.status === MaintenanceStatus.COMPLETED &&
      maintenance.nextMaintenanceDate
    ) {
      const item = await this.findOne(maintenance.itemId, instansiId);
      item.nextMaintenance = maintenance.nextMaintenanceDate;
      item.lastMaintenance = maintenance.completionDate || new Date();
      await this.itemsRepository.save(item);
    }

    return await this.maintenancesRepository.save(maintenance);
  }

  // ========== Statistics & Reports ==========
  async getLowStockItems(instansiId: number) {
    return await this.itemsRepository
      .createQueryBuilder('item')
      .where('item.instansiId = :instansiId', { instansiId })
      .andWhere('item.quantity <= item.minimumStock')
      .andWhere('item.status = :status', { status: ItemStatus.ACTIVE })
      .getMany();
  }

  async getItemsNeedingMaintenance(instansiId: number) {
    const today = new Date();
    return await this.itemsRepository.find({
      where: {
        instansiId,
        nextMaintenance: LessThanOrEqual(today),
        status: ItemStatus.ACTIVE,
      },
    });
  }

  async getStatistics(instansiId: number) {
    const totalItems = await this.itemsRepository.count({
      where: { instansiId },
    });

    const activeItems = await this.itemsRepository.count({
      where: { instansiId, status: ItemStatus.ACTIVE },
    });

    const lowStockCount = await this.itemsRepository
      .createQueryBuilder('item')
      .where('item.instansiId = :instansiId', { instansiId })
      .andWhere('item.quantity <= item.minimumStock')
      .getCount();

    const totalValue = await this.itemsRepository
      .createQueryBuilder('item')
      .select('SUM(item.totalValue)', 'total')
      .where('item.instansiId = :instansiId', { instansiId })
      .getRawOne();

    return {
      totalItems,
      activeItems,
      lowStockCount,
      totalValue: parseFloat(totalValue?.total || '0'),
    };
  }
}

