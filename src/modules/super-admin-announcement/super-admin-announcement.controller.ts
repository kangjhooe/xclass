import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  Req,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { SuperAdminAnnouncementService } from './super-admin-announcement.service';
import { CreateSuperAdminAnnouncementDto } from './dto/create-super-admin-announcement.dto';
import { UpdateSuperAdminAnnouncementDto } from './dto/update-super-admin-announcement.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { TenantId, CurrentUserId } from '../../common/decorators/tenant.decorator';
import { StorageService } from '../storage/storage.service';
import { Request } from 'express';

@Controller('admin/announcements')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('super_admin')
export class SuperAdminAnnouncementController {
  constructor(
    private readonly announcementService: SuperAdminAnnouncementService,
    private readonly storageService: StorageService,
  ) {}

  @Post()
  @UseInterceptors(FilesInterceptor('attachments', 10))
  async create(
    @Body() createDto: CreateSuperAdminAnnouncementDto,
    @CurrentUserId() authorId: number,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    // Handle file uploads
    const attachments = [];
    if (files && files.length > 0) {
      for (const file of files) {
        try {
          const uploadResult = await this.storageService.uploadFile(
            file,
            'announcements',
          );
          attachments.push({
            filename: uploadResult.filename,
            originalName: file.originalname,
            url: uploadResult.url,
            size: file.size,
            mimeType: file.mimetype,
          });
        } catch (error) {
          // Log error but continue with other files
          console.error(`Error uploading file ${file.originalname}:`, error);
        }
      }
    }

    // Merge attachments from DTO and uploaded files
    const allAttachments = [
      ...(createDto.attachments || []),
      ...attachments,
    ];

    return this.announcementService.create(
      {
        ...createDto,
        attachments: allAttachments.length > 0 ? allAttachments : undefined,
      },
      authorId,
    );
  }

  @Get()
  findAll(
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.announcementService.findAll({
      status,
      priority,
      search,
      page: Number(page) || 1,
      limit: Number(limit) || 20,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.announcementService.findOne(+id);
  }

  @Patch(':id')
  @UseInterceptors(FilesInterceptor('attachments', 10))
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateSuperAdminAnnouncementDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    // Handle file uploads
    const attachments = [];
    if (files && files.length > 0) {
      for (const file of files) {
        try {
          const uploadResult = await this.storageService.uploadFile(
            file,
            'announcements',
          );
          attachments.push({
            filename: uploadResult.filename,
            originalName: file.originalname,
            url: uploadResult.url,
            size: file.size,
            mimeType: file.mimetype,
          });
        } catch (error) {
          // Log error but continue with other files
          console.error(`Error uploading file ${file.originalname}:`, error);
        }
      }
    }

    // Merge attachments
    const allAttachments = [
      ...(updateDto.attachments || []),
      ...attachments,
    ];

    return this.announcementService.update(+id, {
      ...updateDto,
      attachments: allAttachments.length > 0 ? allAttachments : undefined,
    });
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.announcementService.remove(+id);
  }
}

