import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportGeneratorController } from './report-generator.controller';
import { ReportGeneratorService } from './report-generator.service';
import { ReportTemplate } from './entities/report-template.entity';
import { ScheduledReport } from './entities/scheduled-report.entity';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ReportTemplate, ScheduledReport]),
    NotificationsModule,
  ],
  controllers: [ReportGeneratorController],
  providers: [ReportGeneratorService],
  exports: [ReportGeneratorService],
})
export class ReportGeneratorModule {}

