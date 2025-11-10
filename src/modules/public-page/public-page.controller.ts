import {
  Controller,
  Get,
  Param,
  Query,
} from '@nestjs/common';
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
}

