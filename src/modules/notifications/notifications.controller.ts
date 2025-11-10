import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { NotificationType, NotificationStatus } from './entities/notification.entity';

@Controller('notifications')
@UseGuards(JwtAuthGuard, TenantGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('send-email')
  async sendEmail(
    @Request() req,
    @TenantId() instansiId: number,
    @Body() body: {
      recipient: string;
      subject: string;
      content: string;
      templateId?: number;
    },
  ) {
    return this.notificationsService.sendEmail(
      instansiId,
      req.user.userId,
      body.recipient,
      body.subject,
      body.content,
      body.templateId,
    );
  }

  @Post('send-sms')
  async sendSMS(
    @Request() req,
    @TenantId() instansiId: number,
    @Body() body: {
      recipient: string;
      content: string;
      templateId?: number;
    },
  ) {
    return this.notificationsService.sendSMS(
      instansiId,
      req.user.userId,
      body.recipient,
      body.content,
      body.templateId,
    );
  }

  @Post('send-push')
  async sendPush(
    @Request() req,
    @TenantId() instansiId: number,
    @Body() body: {
      deviceToken: string;
      title: string;
      content: string;
      templateId?: number;
    },
  ) {
    return this.notificationsService.sendPush(
      instansiId,
      req.user.userId,
      body.deviceToken,
      body.title,
      body.content,
      body.templateId,
    );
  }

  @Post('send-from-template')
  async sendFromTemplate(
    @Request() req,
    @TenantId() instansiId: number,
    @Body() body: {
      templateId: number;
      recipient: string;
      variables: Record<string, string>;
    },
  ) {
    return this.notificationsService.sendFromTemplate(
      instansiId,
      req.user.userId,
      body.templateId,
      body.recipient,
      body.variables,
    );
  }

  @Get()
  async getNotifications(
    @Request() req,
    @TenantId() instansiId: number,
    @Query('userId') userId?: number,
    @Query('type') type?: NotificationType,
    @Query('status') status?: NotificationStatus,
  ) {
    return this.notificationsService.getNotifications(
      instansiId,
      userId ? +userId : req.user.userId,
      type,
      status,
    );
  }

  @Post('templates')
  async createTemplate(
    @Request() req,
    @TenantId() instansiId: number,
    @Body() body: {
      name: string;
      type: string;
      subject: string;
      content: string;
      variables: string[];
    },
  ) {
    return this.notificationsService.createTemplate(
      instansiId,
      body.name,
      body.type,
      body.subject,
      body.content,
      body.variables,
    );
  }

  @Get('templates')
  async getTemplates(
    @TenantId() instansiId: number,
    @Query('isActive') isActive?: boolean,
  ) {
    return this.notificationsService.getTemplates(
      instansiId,
      isActive !== undefined ? isActive === true : undefined,
    );
  }
}

