import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Throttle } from '@nestjs/throttler';
import { PublicPageService } from './public-page.service';
import { TenantId } from '../../common/decorators/tenant.decorator';

@Controller('public')
export class PublicPageController {
  constructor(private readonly publicPageService: PublicPageService) {}

  @Get('home')
  getHome(@TenantId() instansiId: number) {
    return this.publicPageService.getHomeStatistics(instansiId);
  }

  @Get('news')
  getAllNews(
    @TenantId() instansiId: number,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.publicPageService.getAllNews(
      instansiId,
      page ? +page : 1,
      limit ? +limit : 10,
    );
  }

  @Get('news/featured')
  getFeaturedNews(
    @TenantId() instansiId: number,
    @Query('limit') limit?: number,
  ) {
    return this.publicPageService.getFeaturedNews(
      instansiId,
      limit ? +limit : 3,
    );
  }

  @Get('news/latest')
  getLatestNews(
    @TenantId() instansiId: number,
    @Query('limit') limit?: number,
  ) {
    return this.publicPageService.getLatestNews(
      instansiId,
      limit ? +limit : 6,
    );
  }

  @Get('news/:slug')
  getNewsBySlug(
    @TenantId() instansiId: number,
    @Param('slug') slug: string,
  ) {
    return this.publicPageService.getNewsBySlug(instansiId, slug);
  }

  @Get('galleries')
  getAllGalleries(@TenantId() instansiId: number) {
    return this.publicPageService.getAllGalleries(instansiId);
  }

  @Get('galleries/:id')
  getGalleryById(
    @TenantId() instansiId: number,
    @Param('id') id: string,
  ) {
    return this.publicPageService.getGalleryById(instansiId, +id);
  }

  @Get('menus')
  getMenus(@TenantId() instansiId: number) {
    return this.publicPageService.getActiveMenus(instansiId);
  }

  @Get('profile')
  getTenantProfile(@TenantId() instansiId: number) {
    return this.publicPageService.getTenantProfile(instansiId);
  }

  // Contact Form (Public - no auth required)
  @Post('contact')
  submitContactForm(
    @TenantId() instansiId: number,
    @Body() body: {
      name: string;
      email: string;
      phone?: string;
      subject: string;
      message: string;
      metadata?: Record<string, any>;
    },
  ) {
    return this.publicPageService.submitContactForm(instansiId, body);
  }

  // PPDB Form (Public - no auth required)
  @Post('ppdb')
  submitPPDBForm(@TenantId() instansiId: number, @Body() body: any) {
    return this.publicPageService.submitPPDBForm(instansiId, body);
  }

  // Public PPDB Info
  @Get('ppdb/info')
  getPublicPpdbInfo(@TenantId() instansiId: number) {
    return this.publicPageService.getPublicPpdbInfo(instansiId);
  }

  // Guest Book Form (Public - no auth required)
  @Throttle({ short: { limit: 5, ttl: 60000 } }) // 5 requests per minute per IP
  @UseInterceptors(FileInterceptor('photo'))
  @Post('guest-book')
  submitGuestBook(
    @TenantId() instansiId: number,
    @Body() body: {
      name: string;
      identity_number?: string;
      phone?: string;
      email?: string;
      institution?: string;
      purpose: string;
      notes?: string;
      check_in?: string;
      recaptcha_token?: string;
    },
    @UploadedFile() photo?: Express.Multer.File,
  ) {
    return this.publicPageService.submitGuestBook(instansiId, body, photo);
  }

  // Downloads
  @Get('downloads')
  getAllDownloads(
    @TenantId() instansiId: number,
    @Query('category') category?: string,
  ) {
    return this.publicPageService.getAllDownloads(instansiId, category);
  }

  @Get('downloads/categories')
  getDownloadCategories(@TenantId() instansiId: number) {
    return this.publicPageService.getDownloadCategories(instansiId);
  }

  @Get('downloads/:id')
  getDownloadById(
    @TenantId() instansiId: number,
    @Param('id') id: string,
  ) {
    return this.publicPageService.getDownloadById(instansiId, +id);
  }
}

