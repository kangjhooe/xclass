import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import { AuditTrail, AuditAction, AuditStatus } from './entities/audit-trail.entity';

export interface CreateAuditTrailDto {
  tenantId: number;
  userId: number;
  userName?: string;
  entityType: string;
  entityId?: number;
  action: AuditAction;
  status?: AuditStatus;
  changes?: {
    field: string;
    oldValue: any;
    newValue: any;
    dataType?: string;
  }[];
  beforeSnapshot?: Record<string, any>;
  afterSnapshot?: Record<string, any>;
  metadata?: Record<string, any>;
  description?: string;
  reason?: string;
}

export interface AuditTrailFilters {
  tenantId: number;
  userId?: number;
  entityType?: string;
  entityId?: number;
  action?: AuditAction | AuditAction[];
  status?: AuditStatus;
  startDate?: Date;
  endDate?: Date;
  search?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class AuditTrailService {
  constructor(
    @InjectRepository(AuditTrail)
    private auditTrailRepository: Repository<AuditTrail>,
  ) {}

  /**
   * Create a new audit trail entry
   */
  async create(dto: CreateAuditTrailDto): Promise<AuditTrail> {
    const auditTrail = this.auditTrailRepository.create({
      ...dto,
      status: dto.status || AuditStatus.SUCCESS,
    });

    return await this.auditTrailRepository.save(auditTrail);
  }

  /**
   * Track entity changes (compare old and new values)
   */
  async trackChanges(
    tenantId: number,
    userId: number,
    userName: string,
    entityType: string,
    entityId: number,
    action: AuditAction,
    oldEntity: Record<string, any>,
    newEntity: Record<string, any>,
    metadata?: Record<string, any>,
    reason?: string,
  ): Promise<AuditTrail> {
    // Calculate field-by-field changes
    const changes: {
      field: string;
      oldValue: any;
      newValue: any;
      dataType?: string;
    }[] = [];

    const allFields = new Set([...Object.keys(oldEntity), ...Object.keys(newEntity)]);

    for (const field of allFields) {
      const oldValue = oldEntity[field];
      const newValue = newEntity[field];

      // Skip if values are the same
      if (JSON.stringify(oldValue) === JSON.stringify(newValue)) {
        continue;
      }

      changes.push({
        field,
        oldValue,
        newValue,
        dataType: typeof newValue !== 'undefined' ? typeof newValue : typeof oldValue,
      });
    }

    return this.create({
      tenantId,
      userId,
      userName,
      entityType,
      entityId,
      action,
      changes: changes.length > 0 ? changes : undefined,
      beforeSnapshot: oldEntity,
      afterSnapshot: newEntity,
      metadata,
      description: this.generateDescription(action, entityType, changes),
      reason,
    });
  }

  /**
   * Find audit trails with filters
   */
  async findAll(filters: AuditTrailFilters) {
    const {
      tenantId,
      userId,
      entityType,
      entityId,
      action,
      status,
      startDate,
      endDate,
      search,
      page = 1,
      limit = 20,
    } = filters;

    const queryBuilder = this.auditTrailRepository
      .createQueryBuilder('audit')
      .where('audit.tenantId = :tenantId', { tenantId })
      .orderBy('audit.createdAt', 'DESC');

    if (userId) {
      queryBuilder.andWhere('audit.userId = :userId', { userId });
    }

    if (entityType) {
      queryBuilder.andWhere('audit.entityType = :entityType', { entityType });
    }

    if (entityId) {
      queryBuilder.andWhere('audit.entityId = :entityId', { entityId });
    }

    if (action) {
      if (Array.isArray(action)) {
        queryBuilder.andWhere('audit.action IN (:...actions)', { actions: action });
      } else {
        queryBuilder.andWhere('audit.action = :action', { action });
      }
    }

    if (status) {
      queryBuilder.andWhere('audit.status = :status', { status });
    }

    if (startDate && endDate) {
      queryBuilder.andWhere('audit.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    } else if (startDate) {
      queryBuilder.andWhere('audit.createdAt >= :startDate', { startDate });
    } else if (endDate) {
      queryBuilder.andWhere('audit.createdAt <= :endDate', { endDate });
    }

    if (search) {
      queryBuilder.andWhere(
        '(audit.description LIKE :search OR audit.entityType LIKE :search OR audit.userName LIKE :search)',
        { search: `%${search}%` }
      );
    }

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

  /**
   * Get audit trail by ID
   */
  async findOne(id: number, tenantId: number): Promise<AuditTrail | null> {
    return await this.auditTrailRepository.findOne({
      where: { id, tenantId },
    });
  }

  /**
   * Get audit history for a specific entity
   */
  async getEntityHistory(
    tenantId: number,
    entityType: string,
    entityId: number,
    limit: number = 50,
  ): Promise<AuditTrail[]> {
    return await this.auditTrailRepository.find({
      where: { tenantId, entityType, entityId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  /**
   * Get statistics
   */
  async getStatistics(tenantId: number, startDate?: Date, endDate?: Date) {
    const queryBuilder = this.auditTrailRepository
      .createQueryBuilder('audit')
      .where('audit.tenantId = :tenantId', { tenantId });

    if (startDate && endDate) {
      queryBuilder.andWhere('audit.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    // Total audit trails
    const total = await queryBuilder.getCount();

    // By action
    const byAction = await queryBuilder
      .select('audit.action', 'action')
      .addSelect('COUNT(*)', 'count')
      .groupBy('audit.action')
      .getRawMany();

    // By entity type
    const byEntityType = await queryBuilder
      .select('audit.entityType', 'entityType')
      .addSelect('COUNT(*)', 'count')
      .groupBy('audit.entityType')
      .orderBy('count', 'DESC')
      .limit(10)
      .getRawMany();

    // By status
    const byStatus = await queryBuilder
      .select('audit.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('audit.status')
      .getRawMany();

    // By user (top 10)
    const byUser = await queryBuilder
      .select('audit.userId', 'userId')
      .addSelect('audit.userName', 'userName')
      .addSelect('COUNT(*)', 'count')
      .groupBy('audit.userId')
      .addGroupBy('audit.userName')
      .orderBy('count', 'DESC')
      .limit(10)
      .getRawMany();

    // Daily trends (last 30 days)
    const dailyTrends = await queryBuilder
      .select('DATE(audit.createdAt)', 'date')
      .addSelect('COUNT(*)', 'count')
      .groupBy('DATE(audit.createdAt)')
      .orderBy('date', 'DESC')
      .limit(30)
      .getRawMany();

    return {
      total,
      byAction,
      byEntityType,
      byStatus,
      topUsers: byUser,
      dailyTrends,
    };
  }

  /**
   * Get restore data for an entity (get the beforeSnapshot from the last update)
   */
  async getRestoreData(
    tenantId: number,
    entityType: string,
    entityId: number,
  ): Promise<Record<string, any> | null> {
    const lastUpdate = await this.auditTrailRepository.findOne({
      where: {
        tenantId,
        entityType,
        entityId,
        action: AuditAction.UPDATE,
      },
      order: { createdAt: 'DESC' },
    });

    return lastUpdate?.beforeSnapshot || null;
  }

  /**
   * Generate description from action and changes
   */
  private generateDescription(
    action: AuditAction,
    entityType: string,
    changes: { field: string; oldValue: any; newValue: any }[],
  ): string {
    switch (action) {
      case AuditAction.CREATE:
        return `Created ${entityType}`;
      case AuditAction.UPDATE:
        if (changes.length === 0) {
          return `Updated ${entityType}`;
        }
        if (changes.length === 1) {
          return `Updated ${entityType}: ${changes[0].field}`;
        }
        return `Updated ${entityType}: ${changes.length} fields`;
      case AuditAction.DELETE:
        return `Deleted ${entityType}`;
      case AuditAction.RESTORE:
        return `Restored ${entityType}`;
      default:
        return `${action} ${entityType}`;
    }
  }

  /**
   * Export audit trails
   */
  async export(filters: AuditTrailFilters) {
    const { tenantId, ...restFilters } = filters;
    const result = await this.findAll({ ...restFilters, tenantId, limit: 10000 });
    return result.data;
  }
}

