import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { ActivityLog } from './entities/activity-log.entity';
import { FilterActivityLogDto } from './dto/filter-activity-log.dto';

@Injectable()
export class ActivityLogsService {
  constructor(
    @InjectRepository(ActivityLog)
    private activityLogRepository: Repository<ActivityLog>,
  ) {}

  async findAll(filters: FilterActivityLogDto & { instansiId: number }) {
    const {
      userId,
      modelType,
      modelId,
      action,
      startDate,
      endDate,
      page = 1,
      limit = 20,
      instansiId,
    } = filters;

    const queryBuilder = this.activityLogRepository
      .createQueryBuilder('log')
      .where('log.tenantId = :instansiId', { instansiId })
      .orderBy('log.createdAt', 'DESC');

    if (userId) {
      queryBuilder.andWhere('log.userId = :userId', { userId });
    }

    if (modelType) {
      queryBuilder.andWhere('log.modelType = :modelType', { modelType });
    }

    if (modelId) {
      queryBuilder.andWhere('log.modelId = :modelId', { modelId });
    }

    if (action) {
      queryBuilder.andWhere('log.action = :action', { action });
    }

    if (startDate && endDate) {
      queryBuilder.andWhere('log.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    } else if (startDate) {
      queryBuilder.andWhere('log.createdAt >= :startDate', { startDate });
    } else if (endDate) {
      queryBuilder.andWhere('log.createdAt <= :endDate', { endDate });
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

  async findOne(id: number, instansiId: number) {
    return await this.activityLogRepository.findOne({
      where: { id, tenantId: instansiId },
    });
  }

  async getStatistics(instansiId: number, startDate?: Date, endDate?: Date) {
    const queryBuilder = this.activityLogRepository
      .createQueryBuilder('log')
      .where('log.tenantId = :instansiId', { instansiId });

    if (startDate && endDate) {
      queryBuilder.andWhere('log.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    // Total activities
    const totalActivities = await queryBuilder.getCount();

    // Activities by action
    const activitiesByAction = await queryBuilder
      .select('log.action', 'action')
      .addSelect('COUNT(*)', 'count')
      .groupBy('log.action')
      .getRawMany();

    // Activities by model type
    const activitiesByModel = await queryBuilder
      .select('log.modelType', 'modelType')
      .addSelect('COUNT(*)', 'count')
      .groupBy('log.modelType')
      .getRawMany();

    // Activities by user
    const activitiesByUser = await queryBuilder
      .select('log.userId', 'userId')
      .addSelect('COUNT(*)', 'count')
      .groupBy('log.userId')
      .orderBy('count', 'DESC')
      .limit(10)
      .getRawMany();

    // Daily activities (last 30 days)
    const dailyActivities = await queryBuilder
      .select('DATE(log.createdAt)', 'date')
      .addSelect('COUNT(*)', 'count')
      .groupBy('DATE(log.createdAt)')
      .orderBy('date', 'DESC')
      .limit(30)
      .getRawMany();

    return {
      totalActivities,
      activitiesByAction,
      activitiesByModel,
      topUsers: activitiesByUser,
      dailyActivities,
    };
  }

  async getTrends(instansiId: number, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const queryBuilder = this.activityLogRepository
      .createQueryBuilder('log')
      .where('log.tenantId = :instansiId', { instansiId })
      .andWhere('log.createdAt >= :startDate', { startDate });

    const trends = await queryBuilder
      .select('DATE(log.createdAt)', 'date')
      .addSelect('log.action', 'action')
      .addSelect('COUNT(*)', 'count')
      .groupBy('DATE(log.createdAt)')
      .addGroupBy('log.action')
      .orderBy('date', 'ASC')
      .getRawMany();

    return trends;
  }

  async export(filters: FilterActivityLogDto & { instansiId: number }) {
    const {
      userId,
      modelType,
      modelId,
      action,
      startDate,
      endDate,
      instansiId,
    } = filters;

    const queryBuilder = this.activityLogRepository
      .createQueryBuilder('log')
      .where('log.tenantId = :instansiId', { instansiId })
      .orderBy('log.createdAt', 'DESC');

    if (userId) {
      queryBuilder.andWhere('log.userId = :userId', { userId });
    }

    if (modelType) {
      queryBuilder.andWhere('log.modelType = :modelType', { modelType });
    }

    if (modelId) {
      queryBuilder.andWhere('log.modelId = :modelId', { modelId });
    }

    if (action) {
      queryBuilder.andWhere('log.action = :action', { action });
    }

    if (startDate && endDate) {
      queryBuilder.andWhere('log.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    return await queryBuilder.getMany();
  }
}

