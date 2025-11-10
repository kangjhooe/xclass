import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HealthRecord } from './entities/health-record.entity';
import { CreateHealthRecordDto } from './dto/create-health-record.dto';

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

  async remove(id: number, instansiId: number) {
    const record = await this.findOne(id, instansiId);
    await this.healthRecordRepository.remove(record);
    return { message: 'Catatan kesehatan berhasil dihapus' };
  }
}

