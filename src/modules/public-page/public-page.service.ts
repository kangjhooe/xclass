import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { News } from './entities/news.entity';
import { Gallery } from './entities/gallery.entity';
import { Menu } from './entities/menu.entity';
import { TenantProfile } from './entities/tenant-profile.entity';
import { ContactForm, ContactFormStatus } from './entities/contact-form.entity';
import { PPDBForm, PPDBFormStatus } from './entities/ppdb-form.entity';
import { Student } from '../students/entities/student.entity';
import { Teacher } from '../teachers/entities/teacher.entity';
import { AcademicYear } from '../academic-year/entities/academic-year.entity';
import { PpdbRegistration, RegistrationStatus } from '../ppdb/entities/ppdb-registration.entity';
import { PpdbInterviewSchedule, ScheduleStatus } from '../ppdb/entities/ppdb-interview-schedule.entity';
import { Download } from './entities/download.entity';

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
    @InjectRepository(ContactForm)
    private contactFormRepository: Repository<ContactForm>,
    @InjectRepository(PPDBForm)
    private ppdbFormRepository: Repository<PPDBForm>,
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    @InjectRepository(Teacher)
    private teacherRepository: Repository<Teacher>,
    @InjectRepository(AcademicYear)
    private academicYearRepository: Repository<AcademicYear>,
    @InjectRepository(PpdbRegistration)
    private ppdbRegistrationRepository: Repository<PpdbRegistration>,
    @InjectRepository(PpdbInterviewSchedule)
    private ppdbInterviewScheduleRepository: Repository<PpdbInterviewSchedule>,
    @InjectRepository(Download)
    private downloadRepository: Repository<Download>,
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

  // Contact Form methods
  async submitContactForm(
    instansiId: number,
    data: {
      name: string;
      email: string;
      phone?: string;
      subject: string;
      message: string;
      metadata?: Record<string, any>;
    },
  ): Promise<ContactForm> {
    const form = this.contactFormRepository.create({
      instansiId,
      ...data,
      status: ContactFormStatus.NEW,
    });

    return await this.contactFormRepository.save(form);
  }

  async getContactForms(
    instansiId: number,
    filters?: {
      status?: ContactFormStatus;
      startDate?: Date;
      endDate?: Date;
    },
  ): Promise<ContactForm[]> {
    const query = this.contactFormRepository
      .createQueryBuilder('form')
      .where('form.instansiId = :instansiId', { instansiId });

    if (filters?.status) {
      query.andWhere('form.status = :status', { status: filters.status });
    }

    if (filters?.startDate) {
      query.andWhere('form.createdAt >= :startDate', { startDate: filters.startDate });
    }

    if (filters?.endDate) {
      query.andWhere('form.createdAt <= :endDate', { endDate: filters.endDate });
    }

    return await query.orderBy('form.createdAt', 'DESC').getMany();
  }

  async replyToContactForm(
    instansiId: number,
    formId: number,
    reply: string,
    repliedBy: number,
  ): Promise<ContactForm> {
    const form = await this.contactFormRepository.findOne({
      where: { id: formId, instansiId },
    });

    if (!form) {
      throw new Error('Contact form not found');
    }

    form.reply = reply;
    form.repliedAt = new Date();
    form.repliedBy = repliedBy;
    form.status = ContactFormStatus.REPLIED;

    return await this.contactFormRepository.save(form);
  }

  // PPDB Form methods
  async submitPPDBForm(instansiId: number, data: any): Promise<PPDBForm> {
    const form = this.ppdbFormRepository.create({
      instansiId,
      ...data,
      status: PPDBFormStatus.SUBMITTED,
    }) as unknown as PPDBForm;

    return await this.ppdbFormRepository.save(form);
  }

  async getPPDBForms(
    instansiId: number,
    filters?: {
      status?: PPDBFormStatus;
      startDate?: Date;
      endDate?: Date;
    },
  ): Promise<PPDBForm[]> {
    const query = this.ppdbFormRepository
      .createQueryBuilder('form')
      .where('form.instansiId = :instansiId', { instansiId });

    if (filters?.status) {
      query.andWhere('form.status = :status', { status: filters.status });
    }

    if (filters?.startDate) {
      query.andWhere('form.createdAt >= :startDate', { startDate: filters.startDate });
    }

    if (filters?.endDate) {
      query.andWhere('form.createdAt <= :endDate', { endDate: filters.endDate });
    }

    return await query.orderBy('form.createdAt', 'DESC').getMany();
  }

  async reviewPPDBForm(
    instansiId: number,
    formId: number,
    status: PPDBFormStatus,
    reviewNotes: string,
    reviewedBy: number,
  ): Promise<PPDBForm> {
    const form = await this.ppdbFormRepository.findOne({
      where: { id: formId, instansiId },
    });

    if (!form) {
      throw new Error('PPDB form not found');
    }

    form.status = status;
    form.reviewNotes = reviewNotes;
    form.reviewedAt = new Date();
    form.reviewedBy = reviewedBy;

    return await this.ppdbFormRepository.save(form);
  }

  // Public PPDB Info methods
  async getPublicPpdbInfo(instansiId: number) {
    // Get total registrations
    const totalRegistrations = await this.ppdbRegistrationRepository.count({
      where: { instansiId },
    });

    // Get registrations by status (public-friendly stats)
    const acceptedCount = await this.ppdbRegistrationRepository.count({
      where: { instansiId, status: RegistrationStatus.ACCEPTED },
    });

    const pendingCount = await this.ppdbRegistrationRepository.count({
      where: { instansiId, status: RegistrationStatus.PENDING },
    });

    const registeredCount = await this.ppdbRegistrationRepository.count({
      where: { instansiId, status: RegistrationStatus.REGISTERED },
    });

    // Get available interview schedules
    const availableSchedules = await this.ppdbInterviewScheduleRepository.find({
      where: {
        instansiId,
        status: ScheduleStatus.AVAILABLE,
      },
      order: { scheduleDate: 'ASC', startTime: 'ASC' },
      take: 10, // Limit to 10 upcoming schedules
    });

    // Get registrations by path
    const byPath = await this.ppdbRegistrationRepository
      .createQueryBuilder('registration')
      .select('registration.registrationPath', 'path')
      .addSelect('COUNT(*)', 'count')
      .where('registration.instansiId = :instansiId', { instansiId })
      .groupBy('registration.registrationPath')
      .getRawMany();

    return {
      totalRegistrations,
      acceptedCount,
      pendingCount,
      registeredCount,
      availableSchedules: availableSchedules.map(schedule => ({
        id: schedule.id,
        scheduleDate: schedule.scheduleDate,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        location: schedule.location,
        maxParticipants: schedule.maxParticipants,
        currentParticipants: schedule.currentParticipants,
        notes: schedule.notes,
      })),
      byPath: byPath.reduce((acc, item) => {
        acc[item.path] = parseInt(item.count);
        return acc;
      }, {}),
    };
  }

  // Download methods
  async getAllDownloads(instansiId: number, category?: string) {
    const where: any = { instansiId, isActive: true };
    if (category) {
      where.category = category;
    }
    return this.downloadRepository.find({
      where,
      order: { order: 'ASC', createdAt: 'DESC' },
    });
  }

  async getDownloadById(instansiId: number, id: number) {
    const download = await this.downloadRepository.findOne({
      where: { id, instansiId, isActive: true },
    });

    if (download) {
      // Increment download count
      download.downloadCount += 1;
      await this.downloadRepository.save(download);
    }

    return download;
  }

  async getDownloadCategories(instansiId: number) {
    const downloads = await this.downloadRepository.find({
      where: { instansiId, isActive: true },
      select: ['category'],
    });

    const categories = [...new Set(downloads.map(d => d.category).filter(Boolean))];
    return categories;
  }

  // ========== ADMIN METHODS - NEWS ==========
  async getAllNewsAdmin(instansiId: number, page: number = 1, limit: number = 10, status?: string) {
    const skip = (page - 1) * limit;
    const where: any = { instansiId };
    if (status) {
      where.status = status;
    }
    const [news, total] = await this.newsRepository.findAndCount({
      where,
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data: news,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getNewsByIdAdmin(instansiId: number, id: number) {
    return this.newsRepository.findOne({
      where: { id, instansiId },
    });
  }

  async createNews(instansiId: number, data: any, file?: Express.Multer.File) {
    const news = this.newsRepository.create({
      instansiId,
      ...data,
      publishedAt: data.status === 'published' ? new Date() : null,
    }) as unknown as News;
    if (file) {
      // TODO: Upload file using StorageService
      news.featuredImage = `/uploads/${file.filename}`;
    }
    return this.newsRepository.save(news);
  }

  async updateNews(instansiId: number, id: number, data: any, file?: Express.Multer.File) {
    const news = await this.newsRepository.findOne({ where: { id, instansiId } });
    if (!news) {
      throw new Error('News not found');
    }
    Object.assign(news, data);
    if (file) {
      // TODO: Upload file using StorageService
      news.featuredImage = `/uploads/${file.filename}`;
    }
    if (data.status === 'published' && !news.publishedAt) {
      news.publishedAt = new Date();
    }
    return this.newsRepository.save(news);
  }

  async deleteNews(instansiId: number, id: number) {
    const news = await this.newsRepository.findOne({ where: { id, instansiId } });
    if (!news) {
      throw new Error('News not found');
    }
    return this.newsRepository.remove(news);
  }

  // ========== ADMIN METHODS - GALLERY ==========
  async getAllGalleriesAdmin(instansiId: number) {
    return this.galleryRepository.find({
      where: { instansiId },
      order: { order: 'ASC', createdAt: 'DESC' },
    });
  }

  async getGalleryByIdAdmin(instansiId: number, id: number) {
    return this.galleryRepository.findOne({
      where: { id, instansiId },
    });
  }

  async createGallery(instansiId: number, data: any, file?: Express.Multer.File) {
    const gallery = this.galleryRepository.create({
      instansiId,
      ...data,
    }) as unknown as Gallery;
    if (file) {
      // TODO: Upload file using StorageService
      gallery.image = `/uploads/${file.filename}`;
    }
    return this.galleryRepository.save(gallery);
  }

  async updateGallery(instansiId: number, id: number, data: any, file?: Express.Multer.File) {
    const gallery = await this.galleryRepository.findOne({ where: { id, instansiId } });
    if (!gallery) {
      throw new Error('Gallery not found');
    }
    Object.assign(gallery, data);
    if (file) {
      // TODO: Upload file using StorageService
      gallery.image = `/uploads/${file.filename}`;
    }
    return this.galleryRepository.save(gallery);
  }

  async deleteGallery(instansiId: number, id: number) {
    const gallery = await this.galleryRepository.findOne({ where: { id, instansiId } });
    if (!gallery) {
      throw new Error('Gallery not found');
    }
    return this.galleryRepository.remove(gallery);
  }

  // ========== ADMIN METHODS - TENANT PROFILE ==========
  async getTenantProfileAdmin(instansiId: number) {
    return this.tenantProfileRepository.findOne({
      where: { instansiId },
    });
  }

  async createOrUpdateTenantProfile(instansiId: number, data: any, file?: Express.Multer.File) {
    let profile = await this.tenantProfileRepository.findOne({ where: { instansiId } });
    if (!profile) {
      profile = this.tenantProfileRepository.create({ instansiId });
    }
    Object.assign(profile, data);
    if (file) {
      // TODO: Upload file using StorageService
      profile.logo = `/uploads/${file.filename}`;
    }
    return this.tenantProfileRepository.save(profile);
  }

  // ========== ADMIN METHODS - DOWNLOAD ==========
  async getAllDownloadsAdmin(instansiId: number, category?: string) {
    const where: any = { instansiId };
    if (category) {
      where.category = category;
    }
    return this.downloadRepository.find({
      where,
      order: { order: 'ASC', createdAt: 'DESC' },
    });
  }

  async getDownloadByIdAdmin(instansiId: number, id: number) {
    return this.downloadRepository.findOne({
      where: { id, instansiId },
    });
  }

  async createDownload(instansiId: number, data: any, file?: Express.Multer.File) {
    const download = this.downloadRepository.create({
      instansiId,
      ...data,
    }) as unknown as Download;
    if (file) {
      // TODO: Upload file using StorageService
      download.fileUrl = `/uploads/${file.filename}`;
      download.fileName = file.originalname;
      download.fileSize = file.size;
      download.fileType = file.mimetype;
    }
    return this.downloadRepository.save(download);
  }

  async updateDownload(instansiId: number, id: number, data: any, file?: Express.Multer.File) {
    const download = await this.downloadRepository.findOne({ where: { id, instansiId } });
    if (!download) {
      throw new Error('Download not found');
    }
    Object.assign(download, data);
    if (file) {
      // TODO: Upload file using StorageService
      download.fileUrl = `/uploads/${file.filename}`;
      download.fileName = file.originalname;
      download.fileSize = file.size;
      download.fileType = file.mimetype;
    }
    return this.downloadRepository.save(download);
  }

  async deleteDownload(instansiId: number, id: number) {
    const download = await this.downloadRepository.findOne({ where: { id, instansiId } });
    if (!download) {
      throw new Error('Download not found');
    }
    return this.downloadRepository.remove(download);
  }
}

