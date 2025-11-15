import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { NotificationsController } from './notifications.controller';
import { NotificationChannelsController } from './notification-channels.controller';
import { NotificationsService } from './notifications.service';
import { NotificationsGateway } from './notifications.gateway';
import { Notification } from './entities/notification.entity';
import { NotificationTemplate } from './entities/notification-template.entity';
import { NotificationChannel } from './entities/notification-channel.entity';
import { NotificationLog } from './entities/notification-log.entity';
import { WhatsAppService } from './services/whatsapp.service';
import { SMSProviderService } from './services/sms-provider.service';
import { NotificationChannelService } from './services/notification-channel.service';
import { NotificationLogService } from './services/notification-log.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Notification,
      NotificationTemplate,
      NotificationChannel,
      NotificationLog,
    ]),
    JwtModule,
  ],
  controllers: [NotificationsController, NotificationChannelsController],
  providers: [
    NotificationsService,
    NotificationsGateway,
    WhatsAppService,
    SMSProviderService,
    NotificationChannelService,
    NotificationLogService,
  ],
  exports: [
    NotificationsService,
    NotificationsGateway,
    NotificationChannelService,
    NotificationLogService,
  ],
})
export class NotificationsModule {}

