import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsController } from './analytics.controller';
import { CustomReportController } from './custom-report.controller';
import { AnalyticsService } from './analytics.service';
import { CustomReportService } from './services/custom-report.service';
import { Student } from '../students/entities/student.entity';
import { Teacher } from '../teachers/entities/teacher.entity';
import { Attendance } from '../attendance/entities/attendance.entity';
import { StudentGrade } from '../grades/entities/student-grade.entity';
import { ClassRoom } from '../classes/entities/class-room.entity';
import { CustomReport } from './entities/custom-report.entity';
import { ReportExecution } from './entities/report-execution.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Student,
      Teacher,
      Attendance,
      StudentGrade,
      ClassRoom,
      CustomReport,
      ReportExecution,
    ]),
  ],
  controllers: [AnalyticsController, CustomReportController],
  providers: [AnalyticsService, CustomReportService],
  exports: [AnalyticsService, CustomReportService],
})
export class AnalyticsModule {}

