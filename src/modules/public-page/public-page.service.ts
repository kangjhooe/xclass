import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
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
import { StorageService } from '../storage/storage.service';
import { GuestBookService } from '../guest-book/guest-book.service';
import { CreateGuestBookDto } from '../guest-book/dto/create-guest-book.dto';
import { DataPokok } from '../data-pokok/entities/data-pokok.entity';
import { Tenant } from '../tenant/entities/tenant.entity';

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
    @InjectRepository(DataPokok)
    private dataPokokRepository: Repository<DataPokok>,
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
    private storageService: StorageService,
    private guestBookService: GuestBookService,
    private configService: ConfigService,
    private httpService: HttpService,
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
    const existingProfile = await this.tenantProfileRepository.findOne({
      where: { instansiId, isActive: true },
    });

    if (existingProfile) {
      return existingProfile;
    }

    const [dataPokok, tenant] = await Promise.all([
      this.dataPokokRepository.findOne({ where: { instansiId } }),
      this.tenantRepository.findOne({ where: { id: instansiId } }),
    ]);

    if (!dataPokok && !tenant) {
      return null;
    }

    const tenantSettings = tenant?.settings ?? {};
    const fallbackDescription =
      dataPokok?.description ||
      dataPokok?.notes ||
      (tenant?.name ? `Profil ${tenant.name}` : null);

    return {
      id: dataPokok?.id ? -Math.abs(dataPokok.id) : -(tenant?.id ?? instansiId),
      instansiId,
      description: fallbackDescription,
      vision: dataPokok?.vision || null,
      mission: dataPokok?.mission || null,
      logo:
        (tenantSettings.publicPageLogo as string) ||
        (tenantSettings.logo as string) ||
        null,
      address: dataPokok?.address || tenant?.address || null,
      phone: dataPokok?.phone || tenant?.phone || null,
      email: dataPokok?.email || tenant?.email || null,
      website:
        dataPokok?.website ||
        (tenantSettings.website as string) ||
        (tenantSettings.publicWebsite as string) ||
        null,
      isActive: true,
      createdAt: dataPokok?.createdAt || tenant?.createdAt || new Date(),
      updatedAt: dataPokok?.updatedAt || tenant?.updatedAt || new Date(),
    } as TenantProfile;
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

  // Guest Book Form (Public - no auth required)
  async submitGuestBook(
    instansiId: number,
    data: CreateGuestBookDto & { recaptcha_token?: string },
    photo?: Express.Multer.File,
  ) {
    // Verify reCAPTCHA if token is provided
    if (data.recaptcha_token) {
      const isValid = await this.verifyRecaptcha(data.recaptcha_token);
      if (!isValid) {
        throw new BadRequestException('reCAPTCHA verification failed. Please try again.');
      }
    }

    // Auto-set check_in to current date/time if not provided
    if (!data.check_in) {
      data.check_in = new Date().toISOString();
    }
    
    // Remove recaptcha_token before saving
    const { recaptcha_token, ...guestBookData } = data;
    const payload: CreateGuestBookDto = { ...guestBookData };

    if (photo) {
      const uploaded = await this.storageService.uploadFile(
        photo,
        'guest-book/photos',
        instansiId,
      );
      payload.photo_url = uploaded.url;
    }
    
    return await this.guestBookService.create(payload, instansiId);
  }

  // Verify reCAPTCHA token
  private async verifyRecaptcha(token: string): Promise<boolean> {
    const secretKey = this.configService.get<string>('RECAPTCHA_SECRET_KEY');
    
    // If secret key is not configured, skip verification (for development)
    if (!secretKey) {
      console.warn('reCAPTCHA secret key not configured, skipping verification');
      return true;
    }

    try {
      const response = await firstValueFrom(
        this.httpService.post('https://www.google.com/recaptcha/api/siteverify', null, {
          params: {
            secret: secretKey,
            response: token,
          },
        }),
      );

      const result = response.data as { success: boolean; score?: number };
      return result.success === true && (result.score ?? 0) >= 0.5; // Score threshold for v3
    } catch (error) {
      console.error('reCAPTCHA verification error:', error);
      return false;
    }
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
      const uploadResult = await this.storageService.uploadFile(
        file,
        'news',
        instansiId,
      );
      news.featuredImage = uploadResult.url;
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
      // Delete old file if exists
      if (news.featuredImage) {
        try {
          const oldFilePath = news.featuredImage.replace('/storage/', '');
          await this.storageService.deleteFile(oldFilePath, instansiId);
        } catch (error) {
          // Ignore error if file doesn't exist
        }
      }
      const uploadResult = await this.storageService.uploadFile(
        file,
        'news',
        instansiId,
      );
      news.featuredImage = uploadResult.url;
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
      const uploadResult = await this.storageService.uploadFile(
        file,
        'gallery',
        instansiId,
      );
      gallery.image = uploadResult.url;
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
      // Delete old file if exists
      if (gallery.image) {
        try {
          const oldFilePath = gallery.image.replace('/storage/', '');
          await this.storageService.deleteFile(oldFilePath, instansiId);
        } catch (error) {
          // Ignore error if file doesn't exist
        }
      }
      const uploadResult = await this.storageService.uploadFile(
        file,
        'gallery',
        instansiId,
      );
      gallery.image = uploadResult.url;
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
      // Delete old file if exists
      if (profile.logo) {
        try {
          const oldFilePath = profile.logo.replace('/storage/', '');
          await this.storageService.deleteFile(oldFilePath, instansiId);
        } catch (error) {
          // Ignore error if file doesn't exist
        }
      }
      const uploadResult = await this.storageService.uploadFile(
        file,
        'profile',
        instansiId,
      );
      profile.logo = uploadResult.url;
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
      const uploadResult = await this.storageService.uploadFile(
        file,
        'downloads',
        instansiId,
      );
      download.fileUrl = uploadResult.url;
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
      // Delete old file if exists
      if (download.fileUrl) {
        try {
          const oldFilePath = download.fileUrl.replace('/storage/', '');
          await this.storageService.deleteFile(oldFilePath, instansiId);
        } catch (error) {
          // Ignore error if file doesn't exist
        }
      }
      const uploadResult = await this.storageService.uploadFile(
        file,
        'downloads',
        instansiId,
      );
      download.fileUrl = uploadResult.url;
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

