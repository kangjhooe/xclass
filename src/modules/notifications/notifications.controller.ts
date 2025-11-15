import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  UseGuards,
  Request,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { NotificationType, NotificationStatus } from './entities/notification.entity';
import {
  SendEmailDto,
  SendSMSDto,
  SendWhatsAppDto,
  SendPushDto,
  SendFromTemplateDto,
} from './dto/send-notification.dto';
import { CreateTemplateDto } from './dto/create-template.dto';

@Controller('notifications')
@UseGuards(JwtAuthGuard, TenantGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('send-email')
  @UsePipes(new ValidationPipe({ transform: true }))
  async sendEmail(@Request() req, @TenantId() instansiId: number, @Body() body: SendEmailDto) {
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
  @UsePipes(new ValidationPipe({ transform: true }))
  async sendSMS(@Request() req, @TenantId() instansiId: number, @Body() body: SendSMSDto) {
    return this.notificationsService.sendSMS(
      instansiId,
      req.user.userId,
      body.recipient,
      body.content,
      body.templateId,
      body.channelId,
    );
  }

  @Post('send-push')
  @UsePipes(new ValidationPipe({ transform: true }))
  async sendPush(@Request() req, @TenantId() instansiId: number, @Body() body: SendPushDto) {
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
  @UsePipes(new ValidationPipe({ transform: true }))
  async sendFromTemplate(
    @Request() req,
    @TenantId() instansiId: number,
    @Body() body: SendFromTemplateDto,
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
  @UsePipes(new ValidationPipe({ transform: true }))
  async createTemplate(@Request() req, @TenantId() instansiId: number, @Body() body: CreateTemplateDto) {
    return this.notificationsService.createTemplate(
      instansiId,
      body.name,
      body.type,
      body.subject,
      body.content,
      body.variables || [],
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

  @Post('send-whatsapp')
  @UsePipes(new ValidationPipe({ transform: true }))
  async sendWhatsApp(@Request() req, @TenantId() instansiId: number, @Body() body: SendWhatsAppDto) {
    return this.notificationsService.sendWhatsApp(
      instansiId,
      req.user.userId,
      body.recipient,
      body.message,
      body.templateId,
      body.channelId,
      body.templateName,
      body.templateParams,
    );
  }
}

