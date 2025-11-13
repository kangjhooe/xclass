import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PpdbController } from './ppdb.controller';
import { PpdbService } from './ppdb.service';
import { PpdbRegistration } from './entities/ppdb-registration.entity';
import { PpdbInterviewSchedule } from './entities/ppdb-interview-schedule.entity';
import { StorageModule } from '../storage/storage.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { UsersModule } from '../users/users.module';
import { TenantModule } from '../tenant/tenant.module';
import { StudentsModule } from '../students/students.module';
import { GraduationModule } from '../graduation/graduation.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PpdbRegistration, PpdbInterviewSchedule]),
    StorageModule,
    NotificationsModule,
    UsersModule,
    TenantModule,
    StudentsModule,
    GraduationModule,
  ],
  controllers: [PpdbController],
  providers: [PpdbService],
  exports: [PpdbService],
})
export class PpdbModule {}

