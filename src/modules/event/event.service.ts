import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './entities/event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventService {
  constructor(
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
  ) {}

  async create(createDto: CreateEventDto, instansiId: number) {
    const event = this.eventRepository.create({
      ...createDto,
      instansiId,
      startDate: new Date(createDto.startDate),
      endDate: new Date(createDto.endDate),
    });

    return await this.eventRepository.save(event);
  }

  async findAll(filters: {
    instansiId: number;
    type?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) {
    const {
      instansiId,
      type,
      startDate,
      endDate,
      page = 1,
      limit = 20,
    } = filters;

    const queryBuilder = this.eventRepository
      .createQueryBuilder('event')
      .where('event.instansiId = :instansiId', { instansiId })
      .orderBy('event.startDate', 'ASC');

    if (type) {
      queryBuilder.andWhere('event.type = :type', { type });
    }

    if (startDate) {
      queryBuilder.andWhere('event.startDate >= :startDate', { startDate });
    }

    if (endDate) {
      queryBuilder.andWhere('event.endDate <= :endDate', { endDate });
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
    const event = await this.eventRepository.findOne({
      where: { id, instansiId },
    });

    if (!event) {
      throw new NotFoundException(`Event dengan ID ${id} tidak ditemukan`);
    }

    return event;
  }

  async update(id: number, updateDto: UpdateEventDto, instansiId: number) {
    const event = await this.findOne(id, instansiId);
    Object.assign(event, {
      ...updateDto,
      startDate: updateDto.startDate
        ? new Date(updateDto.startDate)
        : event.startDate,
      endDate: updateDto.endDate ? new Date(updateDto.endDate) : event.endDate,
    });
    return await this.eventRepository.save(event);
  }

  async remove(id: number, instansiId: number) {
    const event = await this.findOne(id, instansiId);
    await this.eventRepository.remove(event);
    return { message: 'Event berhasil dihapus' };
  }

  async getStatistics(instansiId: number) {
    const total = await this.eventRepository.count({
      where: { instansiId },
    });

    const upcoming = await this.eventRepository
      .createQueryBuilder('event')
      .where('event.instansiId = :instansiId', { instansiId })
      .andWhere('event.startDate >= :now', { now: new Date() })
      .getCount();

    return {
      total,
      upcoming,
    };
  }
}

