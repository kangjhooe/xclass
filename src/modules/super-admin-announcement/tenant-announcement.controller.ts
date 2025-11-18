import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SuperAdminAnnouncementService } from './super-admin-announcement.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantId, CurrentUserId } from '../../common/decorators/tenant.decorator';

@Controller('announcements')
@UseGuards(JwtAuthGuard)
export class TenantAnnouncementController {
  constructor(
    private readonly announcementService: SuperAdminAnnouncementService,
  ) {}

  @Get()
  getTenantAnnouncements(
    @TenantId() tenantId: number,
    @CurrentUserId() userId: number,
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('includeArchived') includeArchived?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.announcementService.getTenantAnnouncements(tenantId, userId, {
      status,
      priority,
      includeArchived: includeArchived === 'true',
      page: Number(page) || 1,
      limit: Number(limit) || 20,
    });
  }

  @Post(':id/read')
  markAsRead(
    @Param('id') id: string,
    @TenantId() tenantId: number,
    @CurrentUserId() userId: number,
  ) {
    return this.announcementService.markAsRead(+id, userId, tenantId);
  }

  @Post(':id/archive')
  markAsArchived(
    @Param('id') id: string,
    @TenantId() tenantId: number,
    @CurrentUserId() userId: number,
  ) {
    return this.announcementService.markAsArchived(+id, userId, tenantId);
  }

  @Post(':id/unarchive')
  unarchive(
    @Param('id') id: string,
    @TenantId() tenantId: number,
    @CurrentUserId() userId: number,
  ) {
    return this.announcementService.unarchive(+id, userId, tenantId);
  }
}

