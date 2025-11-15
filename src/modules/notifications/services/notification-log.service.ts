import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationLog } from '../entities/notification-log.entity';
import { NotificationType, NotificationStatus } from '../entities/notification.entity';

@Injectable()
export class NotificationLogService {
  private readonly logger = new Logger(NotificationLogService.name);

  constructor(
    @InjectRepository(NotificationLog)
    private logRepository: Repository<NotificationLog>,
  ) {}

  /**
   * Create log entry
   */
  async createLog(
    notificationId: number,
    instansiId: number,
    type: NotificationType,
    status: NotificationStatus,
    data: {
      channelId?: number;
      recipient?: string;
      message?: string;
      requestData?: Record<string, any>;
      responseData?: Record<string, any>;
      errorMessage?: string;
      providerMessageId?: string;
      cost?: number;
      provider?: string;
    },
  ): Promise<NotificationLog> {
    const log = this.logRepository.create({
      notificationId,
      instansiId,
      type,
      status,
      channelId: data.channelId,
      recipient: data.recipient,
      message: data.message,
      requestData: data.requestData,
      responseData: data.responseData,
      errorMessage: data.errorMessage,
      providerMessageId: data.providerMessageId,
      cost: data.cost,
      provider: data.provider,
    });

    return await this.logRepository.save(log);
  }

  /**
   * Get logs for a notification
   */
  async getLogsByNotification(notificationId: number): Promise<NotificationLog[]> {
    return await this.logRepository.find({
      where: { notificationId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get logs for a tenant with filters
   */
  async getLogs(
    instansiId: number,
    filters?: {
      type?: NotificationType;
      status?: NotificationStatus;
      channelId?: number;
      startDate?: Date;
      endDate?: Date;
      limit?: number;
    },
  ): Promise<NotificationLog[]> {
    const query = this.logRepository
      .createQueryBuilder('log')
      .where('log.instansiId = :instansiId', { instansiId });

    if (filters?.type) {
      query.andWhere('log.type = :type', { type: filters.type });
    }

    if (filters?.status) {
      query.andWhere('log.status = :status', { status: filters.status });
    }

    if (filters?.channelId) {
      query.andWhere('log.channelId = :channelId', { channelId: filters.channelId });
    }

    if (filters?.startDate) {
      query.andWhere('log.createdAt >= :startDate', { startDate: filters.startDate });
    }

    if (filters?.endDate) {
      query.andWhere('log.createdAt <= :endDate', { endDate: filters.endDate });
    }

    query.orderBy('log.createdAt', 'DESC');

    if (filters?.limit) {
      query.take(filters.limit);
    }

    return await query.getMany();
  }

  /**
   * Get statistics
   */
  async getStatistics(
    instansiId: number,
    startDate?: Date,
    endDate?: Date,
  ): Promise<{
    total: number;
    sent: number;
    failed: number;
    pending: number;
    byType: Record<string, number>;
    byStatus: Record<string, number>;
    totalCost: number;
  }> {
    const query = this.logRepository
      .createQueryBuilder('log')
      .where('log.instansiId = :instansiId', { instansiId });

    if (startDate) {
      query.andWhere('log.createdAt >= :startDate', { startDate });
    }

    if (endDate) {
      query.andWhere('log.createdAt <= :endDate', { endDate });
    }

    const logs = await query.getMany();

    const stats = {
      total: logs.length,
      sent: logs.filter((l) => l.status === NotificationStatus.SENT).length,
      failed: logs.filter((l) => l.status === NotificationStatus.FAILED).length,
      pending: logs.filter((l) => l.status === NotificationStatus.PENDING).length,
      byType: {} as Record<string, number>,
      byStatus: {} as Record<string, number>,
      totalCost: 0,
    };

    logs.forEach((log) => {
      // Count by type
      stats.byType[log.type] = (stats.byType[log.type] || 0) + 1;

      // Count by status
      stats.byStatus[log.status] = (stats.byStatus[log.status] || 0) + 1;

      // Sum cost
      if (log.cost) {
        stats.totalCost += parseFloat(log.cost.toString());
      }
    });

    return stats;
  }
}

