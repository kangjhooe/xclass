import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Announcement } from './entities/announcement.entity';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';

@Injectable()
export class AnnouncementService {
  constructor(
    @InjectRepository(Announcement)
    private announcementRepository: Repository<Announcement>,
  ) {}

  async create(
    createDto: CreateAnnouncementDto,
    instansiId: number,
    userId: number,
  ) {
    const announcement = this.announcementRepository.create({
      ...createDto,
      instansiId,
      authorId: userId,
      publishAt: createDto.publishAt ? new Date(createDto.publishAt) : new Date(),
      expiresAt: createDto.expiresAt ? new Date(createDto.expiresAt) : null,
    });

    return await this.announcementRepository.save(announcement);
  }

  async findAll(filters: {
    instansiId: number;
    status?: string;
    priority?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const {
      instansiId,
      status,
      priority,
      search,
      page = 1,
      limit = 20,
    } = filters;

    const queryBuilder = this.announcementRepository
      .createQueryBuilder('announcement')
      .where('announcement.instansiId = :instansiId', { instansiId })
      .orderBy('announcement.createdAt', 'DESC');

    if (status) {
      queryBuilder.andWhere('announcement.status = :status', { status });
    }

    if (priority) {
      queryBuilder.andWhere('announcement.priority = :priority', { priority });
    }

    if (search) {
      queryBuilder.andWhere(
        '(announcement.title LIKE :search OR announcement.content LIKE :search)',
        { search: `%${search}%` },
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

  async findOne(id: number, instansiId: number) {
    const announcement = await this.announcementRepository.findOne({
      where: { id, instansiId },
    });

    if (!announcement) {
      throw new NotFoundException(`Pengumuman dengan ID ${id} tidak ditemukan`);
    }

    return announcement;
  }

  async update(
    id: number,
    updateDto: UpdateAnnouncementDto,
    instansiId: number,
  ) {
    const announcement = await this.findOne(id, instansiId);

    Object.assign(announcement, {
      ...updateDto,
      publishAt: updateDto.publishAt
        ? new Date(updateDto.publishAt)
        : announcement.publishAt,
      expiresAt: updateDto.expiresAt
        ? new Date(updateDto.expiresAt)
        : announcement.expiresAt,
    });

    return await this.announcementRepository.save(announcement);
  }

  async remove(id: number, instansiId: number) {
    const announcement = await this.findOne(id, instansiId);
    await this.announcementRepository.remove(announcement);
    return { message: 'Pengumuman berhasil dihapus' };
  }
}

