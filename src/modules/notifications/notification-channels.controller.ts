import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { NotificationChannelService } from './services/notification-channel.service';
import { NotificationLogService } from './services/notification-log.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { ChannelType, ChannelProvider } from './entities/notification-channel.entity';
import { NotificationType, NotificationStatus } from './entities/notification.entity';
import { CreateChannelDto } from './dto/create-channel.dto';

@Controller('notifications/channels')
@UseGuards(JwtAuthGuard, TenantGuard)
export class NotificationChannelsController {
  constructor(
    private readonly channelService: NotificationChannelService,
    private readonly logService: NotificationLogService,
  ) {}

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  async createChannel(@TenantId() instansiId: number, @Body() body: CreateChannelDto) {
    return this.channelService.upsertChannel(
      instansiId,
      body.name,
      body.type,
      body.provider,
      body.config,
      {
        isActive: body.isActive,
        isDefault: body.isDefault,
        priority: body.priority,
        description: body.description,
      },
    );
  }

  @Get()
  async getChannels(@TenantId() instansiId: number) {
    return this.channelService.getActiveChannels(instansiId);
  }

  @Get(':type')
  async getChannelByType(@TenantId() instansiId: number, @Param('type') type: ChannelType) {
    return this.channelService.getActiveChannel(instansiId, type);
  }

  @Put(':id')
  async updateChannel(
    @TenantId() instansiId: number,
    @Param('id') id: number,
    @Body() body: {
      name?: string;
      type?: ChannelType;
      provider?: ChannelProvider;
      config?: Record<string, any>;
      isActive?: boolean;
      isDefault?: boolean;
      priority?: number;
      description?: string;
    },
  ) {
    // Get existing channel first
    const existing = await this.channelService.getActiveChannels(instansiId);
    const channel = existing.find((c) => c.id === id);

    if (!channel) {
      throw new Error('Channel not found');
    }

    return this.channelService.upsertChannel(
      instansiId,
      body.name || channel.name,
      body.type || channel.type,
      body.provider || channel.provider,
      body.config || channel.config,
      {
        isActive: body.isActive !== undefined ? body.isActive : channel.isActive,
        isDefault: body.isDefault !== undefined ? body.isDefault : channel.isDefault,
        priority: body.priority !== undefined ? body.priority : channel.priority,
        description: body.description !== undefined ? body.description : channel.description,
      },
    );
  }

  @Delete(':id')
  async deleteChannel(@TenantId() instansiId: number, @Param('id') id: number) {
    await this.channelService.deleteChannel(instansiId, id);
    return { success: true };
  }

  @Post(':id/deactivate')
  async deactivateChannel(@TenantId() instansiId: number, @Param('id') id: number) {
    await this.channelService.deactivateChannel(instansiId, id);
    return { success: true };
  }

  @Get('logs/statistics')
  async getStatistics(
    @TenantId() instansiId: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.logService.getStatistics(
      instansiId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get('logs')
  async getLogs(
    @TenantId() instansiId: number,
    @Query('type') type?: NotificationType,
    @Query('status') status?: NotificationStatus,
    @Query('channelId') channelId?: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit?: number,
  ) {
    return this.logService.getLogs(instansiId, {
      type,
      status,
      channelId: channelId ? +channelId : undefined,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      limit: limit ? +limit : undefined,
    });
  }

  @Get('logs/:notificationId')
  async getLogsByNotification(@Param('notificationId') notificationId: number) {
    return this.logService.getLogsByNotification(notificationId);
  }
}

