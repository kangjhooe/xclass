import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HealthRecord } from './entities/health-record.entity';
import { CreateHealthRecordDto } from './dto/create-health-record.dto';
import { UpdateHealthRecordDto } from './dto/update-health-record.dto';

@Injectable()
export class HealthService {
  constructor(
    @InjectRepository(HealthRecord)
    private healthRecordRepository: Repository<HealthRecord>,
  ) {}

  async create(createDto: CreateHealthRecordDto, instansiId: number) {
    const record = this.healthRecordRepository.create({
      ...createDto,
      instansiId,
      checkupDate: new Date(createDto.checkupDate),
    });

    return await this.healthRecordRepository.save(record);
  }

  async findAll(filters: {
    instansiId: number;
    studentId?: number;
    healthStatus?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) {
    const {
      instansiId,
      studentId,
      healthStatus,
      startDate,
      endDate,
      page = 1,
      limit = 20,
    } = filters;

    const queryBuilder = this.healthRecordRepository
      .createQueryBuilder('record')
      .leftJoinAndSelect('record.student', 'student')
      .where('record.instansiId = :instansiId', { instansiId })
      .orderBy('record.checkupDate', 'DESC');

    if (studentId) {
      queryBuilder.andWhere('record.studentId = :studentId', { studentId });
    }

    if (healthStatus) {
      queryBuilder.andWhere('record.healthStatus = :healthStatus', {
        healthStatus,
      });
    }

    if (startDate) {
      queryBuilder.andWhere('record.checkupDate >= :startDate', {
        startDate,
      });
    }

    if (endDate) {
      queryBuilder.andWhere('record.checkupDate <= :endDate', { endDate });
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
    const record = await this.healthRecordRepository.findOne({
      where: { id, instansiId },
      relations: ['student'],
    });

    if (!record) {
      throw new NotFoundException(
        `Catatan kesehatan dengan ID ${id} tidak ditemukan`,
      );
    }

    return record;
  }

  async update(id: number, updateDto: UpdateHealthRecordDto, instansiId: number) {
    const record = await this.findOne(id, instansiId);
    
    const updateData: any = { ...updateDto };
    
    if (updateDto.checkupDate) {
      updateData.checkupDate = new Date(updateDto.checkupDate);
    }

    Object.assign(record, updateData);

    return await this.healthRecordRepository.save(record);
  }

  async remove(id: number, instansiId: number) {
    const record = await this.findOne(id, instansiId);
    await this.healthRecordRepository.remove(record);
    return { message: 'Catatan kesehatan berhasil dihapus' };
  }

  async getStatistics(instansiId: number, startDate?: string, endDate?: string) {
    const queryBuilder = this.healthRecordRepository
      .createQueryBuilder('record')
      .where('record.instansiId = :instansiId', { instansiId });

    if (startDate && endDate) {
      queryBuilder.andWhere('record.checkupDate BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    // Total records
    const total = await queryBuilder.getCount();

    // By health status
    const byStatus = await queryBuilder
      .select('record.healthStatus', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('record.healthStatus')
      .getRawMany();

    // Monthly trends (last 12 months)
    const monthlyTrends = await this.healthRecordRepository
      .createQueryBuilder('record')
      .select('DATE_FORMAT(record.checkupDate, "%Y-%m")', 'month')
      .addSelect('COUNT(*)', 'count')
      .where('record.instansiId = :instansiId', { instansiId })
      .andWhere(
        startDate && endDate
          ? 'record.checkupDate BETWEEN :startDate AND :endDate'
          : 'record.checkupDate >= DATE_SUB(NOW(), INTERVAL 12 MONTH)',
        startDate && endDate ? { startDate, endDate } : {},
      )
      .groupBy('DATE_FORMAT(record.checkupDate, "%Y-%m")')
      .orderBy('month', 'ASC')
      .getRawMany();

    // Daily trends (last 30 days)
    const dailyTrends = await this.healthRecordRepository
      .createQueryBuilder('record')
      .select('DATE(record.checkupDate)', 'date')
      .addSelect('COUNT(*)', 'count')
      .where('record.instansiId = :instansiId', { instansiId })
      .andWhere(
        startDate && endDate
          ? 'record.checkupDate BETWEEN :startDate AND :endDate'
          : 'record.checkupDate >= DATE_SUB(NOW(), INTERVAL 30 DAY)',
        startDate && endDate ? { startDate, endDate } : {},
      )
      .groupBy('DATE(record.checkupDate)')
      .orderBy('date', 'DESC')
      .limit(30)
      .getRawMany();

    // Average BMI (if height and weight available)
    const bmiStats = await this.healthRecordRepository
      .createQueryBuilder('record')
      .select('AVG(record.weight / POWER(record.height / 100, 2))', 'avgBmi')
      .addSelect('MIN(record.weight / POWER(record.height / 100, 2))', 'minBmi')
      .addSelect('MAX(record.weight / POWER(record.height / 100, 2))', 'maxBmi')
      .where('record.instansiId = :instansiId', { instansiId })
      .andWhere('record.height IS NOT NULL')
      .andWhere('record.weight IS NOT NULL')
      .andWhere('record.height > 0')
      .andWhere('record.weight > 0')
      .andWhere(
        startDate && endDate
          ? 'record.checkupDate BETWEEN :startDate AND :endDate'
          : '1=1',
        startDate && endDate ? { startDate, endDate } : {},
      )
      .getRawOne();

    return {
      total,
      byStatus: byStatus.reduce((acc, item) => {
        acc[item.status] = parseInt(item.count as any) || 0;
        return acc;
      }, {} as Record<string, number>),
      monthlyTrends: monthlyTrends.map((item) => ({
        month: item.month,
        count: parseInt(item.count as any) || 0,
      })),
      dailyTrends: dailyTrends.map((item) => ({
        date: item.date,
        count: parseInt(item.count as any) || 0,
      })),
      bmiStats: bmiStats
        ? {
            avg: parseFloat(bmiStats.avgBmi as any) || 0,
            min: parseFloat(bmiStats.minBmi as any) || 0,
            max: parseFloat(bmiStats.maxBmi as any) || 0,
          }
        : null,
    };
  }
}

