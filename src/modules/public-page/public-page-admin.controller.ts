import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Query,
  Param,
  Body,
  UseGuards,
  UsePipes,
  ValidationPipe,
  UseInterceptors,
  UploadedFile,
  Request,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PublicPageService } from './public-page.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { ContactFormStatus, PPDBFormStatus } from './entities/contact-form.entity';

@Controller('public-page')
@UseGuards(JwtAuthGuard, TenantGuard)
export class PublicPageAdminController {
  constructor(private readonly publicPageService: PublicPageService) {}

  // Contact Forms Management
  @Get('contact-forms')
  getContactForms(
    @TenantId() instansiId: number,
    @Query('status') status?: ContactFormStatus,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.publicPageService.getContactForms(instansiId, {
      status,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
  }

  @Put('contact-forms/:id/reply')
  @UsePipes(new ValidationPipe({ transform: true }))
  replyToContactForm(
    @Request() req,
    @TenantId() instansiId: number,
    @Param('id') id: number,
    @Body() body: { reply: string },
  ) {
    return this.publicPageService.replyToContactForm(instansiId, id, body.reply, req.user.userId);
  }

  // PPDB Forms Management
  @Get('ppdb-forms')
  getPPDBForms(
    @TenantId() instansiId: number,
    @Query('status') status?: PPDBFormStatus,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.publicPageService.getPPDBForms(instansiId, {
      status,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
  }

  @Put('ppdb-forms/:id/review')
  @UsePipes(new ValidationPipe({ transform: true }))
  reviewPPDBForm(
    @Request() req,
    @TenantId() instansiId: number,
    @Param('id') id: number,
    @Body() body: { status: PPDBFormStatus; reviewNotes: string },
  ) {
    return this.publicPageService.reviewPPDBForm(
      instansiId,
      id,
      body.status,
      body.reviewNotes,
      req.user.userId,
    );
  }

  // ========== NEWS CRUD ==========
  @Get('news')
  getAllNewsAdmin(
    @TenantId() instansiId: number,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
  ) {
    return this.publicPageService.getAllNewsAdmin(
      instansiId,
      page ? +page : 1,
      limit ? +limit : 10,
      status,
    );
  }

  @Get('news/:id')
  getNewsByIdAdmin(
    @TenantId() instansiId: number,
    @Param('id') id: string,
  ) {
    return this.publicPageService.getNewsByIdAdmin(instansiId, +id);
  }

  @Post('news')
  @UseInterceptors(FileInterceptor('featuredImage'))
  createNews(
    @TenantId() instansiId: number,
    @Body() body: any,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.publicPageService.createNews(instansiId, body, file);
  }

  @Put('news/:id')
  @UseInterceptors(FileInterceptor('featuredImage'))
  updateNews(
    @TenantId() instansiId: number,
    @Param('id') id: string,
    @Body() body: any,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.publicPageService.updateNews(instansiId, +id, body, file);
  }

  @Delete('news/:id')
  deleteNews(
    @TenantId() instansiId: number,
    @Param('id') id: string,
  ) {
    return this.publicPageService.deleteNews(instansiId, +id);
  }

  // ========== GALLERY CRUD ==========
  @Get('galleries')
  getAllGalleriesAdmin(@TenantId() instansiId: number) {
    return this.publicPageService.getAllGalleriesAdmin(instansiId);
  }

  @Get('galleries/:id')
  getGalleryByIdAdmin(
    @TenantId() instansiId: number,
    @Param('id') id: string,
  ) {
    return this.publicPageService.getGalleryByIdAdmin(instansiId, +id);
  }

  @Post('galleries')
  @UseInterceptors(FileInterceptor('image'))
  createGallery(
    @TenantId() instansiId: number,
    @Body() body: any,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.publicPageService.createGallery(instansiId, body, file);
  }

  @Put('galleries/:id')
  @UseInterceptors(FileInterceptor('image'))
  updateGallery(
    @TenantId() instansiId: number,
    @Param('id') id: string,
    @Body() body: any,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.publicPageService.updateGallery(instansiId, +id, body, file);
  }

  @Delete('galleries/:id')
  deleteGallery(
    @TenantId() instansiId: number,
    @Param('id') id: string,
  ) {
    return this.publicPageService.deleteGallery(instansiId, +id);
  }

  // ========== TENANT PROFILE CRUD ==========
  @Get('profile')
  getTenantProfileAdmin(@TenantId() instansiId: number) {
    return this.publicPageService.getTenantProfileAdmin(instansiId);
  }

  @Put('profile')
  @UseInterceptors(FileInterceptor('logo'))
  updateTenantProfile(
    @TenantId() instansiId: number,
    @Body() body: any,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.publicPageService.createOrUpdateTenantProfile(instansiId, body, file);
  }

  // ========== DOWNLOAD CRUD ==========
  @Get('downloads')
  getAllDownloadsAdmin(
    @TenantId() instansiId: number,
    @Query('category') category?: string,
  ) {
    return this.publicPageService.getAllDownloadsAdmin(instansiId, category);
  }

  @Get('downloads/:id')
  getDownloadByIdAdmin(
    @TenantId() instansiId: number,
    @Param('id') id: string,
  ) {
    return this.publicPageService.getDownloadByIdAdmin(instansiId, +id);
  }

  @Post('downloads')
  @UseInterceptors(FileInterceptor('file'))
  createDownload(
    @TenantId() instansiId: number,
    @Body() body: any,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.publicPageService.createDownload(instansiId, body, file);
  }

  @Put('downloads/:id')
  @UseInterceptors(FileInterceptor('file'))
  updateDownload(
    @TenantId() instansiId: number,
    @Param('id') id: string,
    @Body() body: any,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.publicPageService.updateDownload(instansiId, +id, body, file);
  }

  @Delete('downloads/:id')
  deleteDownload(
    @TenantId() instansiId: number,
    @Param('id') id: string,
  ) {
    return this.publicPageService.deleteDownload(instansiId, +id);
  }
}
