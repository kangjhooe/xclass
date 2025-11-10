import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Promotion } from './entities/promotion.entity';
import { CreatePromotionDto } from './dto/create-promotion.dto';

@Injectable()
export class PromotionService {
  constructor(
    @InjectRepository(Promotion)
    private promotionRepository: Repository<Promotion>,
  ) {}

  async create(createDto: CreatePromotionDto, instansiId: number) {
    const promotion = this.promotionRepository.create({
      ...createDto,
      instansiId,
    });

    return await this.promotionRepository.save(promotion);
  }

  async findAll(filters: {
    instansiId: number;
    status?: string;
    academicYear?: number;
    page?: number;
    limit?: number;
  }) {
    const {
      instansiId,
      status,
      academicYear,
      page = 1,
      limit = 20,
    } = filters;

    const queryBuilder = this.promotionRepository
      .createQueryBuilder('promotion')
      .leftJoinAndSelect('promotion.student', 'student')
      .leftJoinAndSelect('promotion.fromClass', 'fromClass')
      .leftJoinAndSelect('promotion.toClass', 'toClass')
      .where('promotion.instansiId = :instansiId', { instansiId })
      .orderBy('promotion.createdAt', 'DESC');

    if (status) {
      queryBuilder.andWhere('promotion.status = :status', { status });
    }

    if (academicYear) {
      queryBuilder.andWhere('promotion.academicYear = :academicYear', {
        academicYear,
      });
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
    const promotion = await this.promotionRepository.findOne({
      where: { id, instansiId },
      relations: ['student', 'fromClass', 'toClass'],
    });

    if (!promotion) {
      throw new NotFoundException(`Kenaikan kelas dengan ID ${id} tidak ditemukan`);
    }

    return promotion;
  }

  async approve(id: number, instansiId: number, userId: number) {
    const promotion = await this.findOne(id, instansiId);
    promotion.status = 'approved';
    promotion.approvedBy = userId;
    promotion.approvedAt = new Date();
    return await this.promotionRepository.save(promotion);
  }

  async complete(id: number, instansiId: number) {
    const promotion = await this.findOne(id, instansiId);
    promotion.status = 'completed';
    promotion.completedAt = new Date();
    return await this.promotionRepository.save(promotion);
  }

  async cancel(id: number, instansiId: number) {
    const promotion = await this.findOne(id, instansiId);
    promotion.status = 'cancelled';
    return await this.promotionRepository.save(promotion);
  }

  async remove(id: number, instansiId: number) {
    const promotion = await this.findOne(id, instansiId);
    await this.promotionRepository.remove(promotion);
    return { message: 'Kenaikan kelas berhasil dihapus' };
  }
}

