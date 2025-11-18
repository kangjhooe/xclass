import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SuperAdminAnnouncementController } from './super-admin-announcement.controller';
import { TenantAnnouncementController } from './tenant-announcement.controller';
import { SuperAdminAnnouncementService } from './super-admin-announcement.service';
import { SuperAdminAnnouncement } from './entities/super-admin-announcement.entity';
import { AnnouncementRead } from './entities/announcement-read.entity';
import { DataPokok } from '../data-pokok/entities/data-pokok.entity';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SuperAdminAnnouncement,
      AnnouncementRead,
      DataPokok,
    ]),
    StorageModule,
  ],
  controllers: [
    SuperAdminAnnouncementController,
    TenantAnnouncementController,
  ],
  providers: [SuperAdminAnnouncementService],
  exports: [SuperAdminAnnouncementService],
})
export class SuperAdminAnnouncementModule {}

