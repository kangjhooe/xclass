import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { SuperAdminAnnouncement } from './entities/super-admin-announcement.entity';
import { AnnouncementRead } from './entities/announcement-read.entity';
import { CreateSuperAdminAnnouncementDto } from './dto/create-super-admin-announcement.dto';
import { UpdateSuperAdminAnnouncementDto } from './dto/update-super-admin-announcement.dto';
import { DataPokok } from '../data-pokok/entities/data-pokok.entity';

@Injectable()
export class SuperAdminAnnouncementService {
  constructor(
    @InjectRepository(SuperAdminAnnouncement)
    private announcementRepository: Repository<SuperAdminAnnouncement>,
    @InjectRepository(AnnouncementRead)
    private announcementReadRepository: Repository<AnnouncementRead>,
    @InjectRepository(DataPokok)
    private dataPokokRepository: Repository<DataPokok>,
  ) {}

  async create(
    createDto: CreateSuperAdminAnnouncementDto,
    authorId: number,
  ) {
    const announcement = this.announcementRepository.create({
      ...createDto,
      authorId,
      publishAt: createDto.publishAt
        ? new Date(createDto.publishAt)
        : new Date(),
      expiresAt: createDto.expiresAt
        ? new Date(createDto.expiresAt)
        : null,
    });

    return await this.announcementRepository.save(announcement);
  }

  async findAll(filters: {
    status?: string;
    priority?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const {
      status,
      priority,
      search,
      page = 1,
      limit = 20,
    } = filters;

    const queryBuilder = this.announcementRepository
      .createQueryBuilder('announcement')
      .leftJoinAndSelect('announcement.author', 'author', 'author.id = announcement.authorId')
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

  async findOne(id: number) {
    const announcement = await this.announcementRepository.findOne({
      where: { id },
    });

    if (!announcement) {
      throw new NotFoundException(
        `Pengumuman dengan ID ${id} tidak ditemukan`,
      );
    }

    return announcement;
  }

  async update(
    id: number,
    updateDto: UpdateSuperAdminAnnouncementDto,
  ) {
    const announcement = await this.findOne(id);

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

  async remove(id: number) {
    const announcement = await this.findOne(id);
    await this.announcementRepository.remove(announcement);
    return { message: 'Pengumuman berhasil dihapus' };
  }

  // Get announcements untuk tenant tertentu
  async getTenantAnnouncements(
    tenantId: number,
    userId: number,
    filters?: {
      status?: string;
      priority?: string;
      includeArchived?: boolean;
      page?: number;
      limit?: number;
    },
  ) {
    const { includeArchived = false, page = 1, limit = 20 } = filters || {};

    // Get data pokok tenant untuk filter jenjang/jenis
    const dataPokok = await this.dataPokokRepository.findOne({
      where: { instansiId: tenantId },
    });

    const jenjang = dataPokok?.jenjang;
    const jenis = dataPokok?.type;

    // Get all published announcements and filter in memory
    // Pendekatan ini lebih reliable untuk JSON filtering di MySQL/MariaDB
    const allAnnouncements = await this.announcementRepository.find({
      where: { status: 'published' },
    });

    // Filter di memory untuk kompatibilitas yang lebih baik
    const filteredAnnouncements = allAnnouncements.filter((ann) => {
      // Check publish/expire dates
      const now = new Date();
      if (ann.publishAt && new Date(ann.publishAt) > now) return false;
      if (ann.expiresAt && new Date(ann.expiresAt) <= now) return false;

      // Check tenant filter
      if (ann.targetTenantIds && Array.isArray(ann.targetTenantIds) && ann.targetTenantIds.length > 0) {
        if (!ann.targetTenantIds.includes(tenantId)) return false;
      }

      // Check jenjang filter
      if (jenjang && ann.targetJenjang && Array.isArray(ann.targetJenjang) && ann.targetJenjang.length > 0) {
        if (!ann.targetJenjang.includes(jenjang)) return false;
      }

      // Check jenis filter
      if (jenis && ann.targetJenis && Array.isArray(ann.targetJenis) && ann.targetJenis.length > 0) {
        if (!ann.targetJenis.includes(jenis)) return false;
      }

      return true;
    });

    // Apply pagination
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedAnnouncements = filteredAnnouncements
      .sort((a, b) => {
        // Sort by priority first
        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
        const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
        const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
        if (bPriority !== aPriority) return bPriority - aPriority;
        // Then by date
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      })
      .slice(start, end);

    const announcements = paginatedAnnouncements;
    const total = filteredAnnouncements.length;


    // Get read status untuk setiap announcement
    const announcementIds = announcements.map((a) => a.id);
    const reads = await this.announcementReadRepository.find({
      where: {
        announcementId: In(announcementIds),
        userId,
        tenantId,
      },
    });

    const readMap = new Map(
      reads.map((r) => [`${r.announcementId}`, r]),
    );

    // Combine announcements dengan read status
    const result = announcements.map((announcement) => {
      const read = readMap.get(`${announcement.id}`);
      const isRead = read?.isRead || false;
      const isArchived = read?.isArchived || false;

      // Filter out archived jika tidak diminta
      if (isArchived && !includeArchived) {
        return null;
      }

      return {
        ...announcement,
        isRead,
        isArchived,
        readAt: read?.readAt || null,
        archivedAt: read?.archivedAt || null,
      };
    }).filter((item) => item !== null);

    return {
      data: result,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async markAsRead(
    announcementId: number,
    userId: number,
    tenantId: number,
  ) {
    let read = await this.announcementReadRepository.findOne({
      where: {
        announcementId,
        userId,
        tenantId,
      },
    });

    if (!read) {
      read = this.announcementReadRepository.create({
        announcementId,
        userId,
        tenantId,
        isRead: true,
        readAt: new Date(),
      });
    } else {
      read.isRead = true;
      read.readAt = new Date();
    }

    return await this.announcementReadRepository.save(read);
  }

  async markAsArchived(
    announcementId: number,
    userId: number,
    tenantId: number,
  ) {
    let read = await this.announcementReadRepository.findOne({
      where: {
        announcementId,
        userId,
        tenantId,
      },
    });

    if (!read) {
      read = this.announcementReadRepository.create({
        announcementId,
        userId,
        tenantId,
        isArchived: true,
        archivedAt: new Date(),
      });
    } else {
      read.isArchived = true;
      read.archivedAt = new Date();
    }

    return await this.announcementReadRepository.save(read);
  }

  async unarchive(
    announcementId: number,
    userId: number,
    tenantId: number,
  ) {
    const read = await this.announcementReadRepository.findOne({
      where: {
        announcementId,
        userId,
        tenantId,
      },
    });

    if (!read) {
      throw new NotFoundException('Status tidak ditemukan');
    }

    read.isArchived = false;
    read.archivedAt = null;

    return await this.announcementReadRepository.save(read);
  }
}

