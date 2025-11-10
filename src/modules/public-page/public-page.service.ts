import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { News } from './entities/news.entity';
import { Gallery } from './entities/gallery.entity';
import { Menu } from './entities/menu.entity';
import { TenantProfile } from './entities/tenant-profile.entity';
import { Student } from '../students/entities/student.entity';
import { Teacher } from '../teachers/entities/teacher.entity';
import { AcademicYear } from '../academic-year/entities/academic-year.entity';

@Injectable()
export class PublicPageService {
  constructor(
    @InjectRepository(News)
    private newsRepository: Repository<News>,
    @InjectRepository(Gallery)
    private galleryRepository: Repository<Gallery>,
    @InjectRepository(Menu)
    private menuRepository: Repository<Menu>,
    @InjectRepository(TenantProfile)
    private tenantProfileRepository: Repository<TenantProfile>,
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    @InjectRepository(Teacher)
    private teacherRepository: Repository<Teacher>,
    @InjectRepository(AcademicYear)
    private academicYearRepository: Repository<AcademicYear>,
  ) {}

  // News methods
  async getFeaturedNews(instansiId: number, limit: number = 3) {
    return this.newsRepository.find({
      where: {
        instansiId,
        status: 'published',
        isFeatured: true,
      },
      take: limit,
      order: { publishedAt: 'DESC' },
    });
  }

  async getLatestNews(instansiId: number, limit: number = 6) {
    return this.newsRepository.find({
      where: {
        instansiId,
        status: 'published',
        isFeatured: false,
      },
      take: limit,
      order: { publishedAt: 'DESC' },
    });
  }

  async getAllNews(instansiId: number, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const [news, total] = await this.newsRepository.findAndCount({
      where: { instansiId, status: 'published' },
      skip,
      take: limit,
      order: { publishedAt: 'DESC' },
    });

    return {
      data: news,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getNewsBySlug(instansiId: number, slug: string) {
    const news = await this.newsRepository.findOne({
      where: { instansiId, slug, status: 'published' },
    });

    if (news) {
      // Increment view count
      news.viewCount += 1;
      await this.newsRepository.save(news);
    }

    return news;
  }

  // Gallery methods
  async getAllGalleries(instansiId: number) {
    return this.galleryRepository.find({
      where: { instansiId, isActive: true },
      order: { order: 'ASC', createdAt: 'DESC' },
    });
  }

  async getGalleryById(instansiId: number, id: number) {
    return this.galleryRepository.findOne({
      where: { instansiId, id, isActive: true },
    });
  }

  // Menu methods
  async getActiveMenus(instansiId: number) {
    return this.menuRepository.find({
      where: {
        instansiId,
        isActive: true,
        parentId: null,
      },
      order: { order: 'ASC' },
      relations: ['children'],
    });
  }

  // Tenant Profile methods
  async getTenantProfile(instansiId: number) {
    return this.tenantProfileRepository.findOne({
      where: { instansiId, isActive: true },
    });
  }

  // Home page statistics
  async getHomeStatistics(instansiId: number) {
    const newsCount = await this.newsRepository.count({
      where: { instansiId, status: 'published' },
    });

    // Get student count (active students only)
    const studentCount = await this.studentRepository.count({
      where: { instansiId, isActive: true },
    });

    // Get teacher count (active teachers only)
    const teacherCount = await this.teacherRepository.count({
      where: { instansiId, isActive: true },
    });

    // Get academic year count
    const yearCount = await this.academicYearRepository.count({
      where: { instansiId },
    });

    return {
      newsCount,
      studentCount,
      teacherCount,
      yearCount,
    };
  }
}

