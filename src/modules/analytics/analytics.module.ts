import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { Student } from '../students/entities/student.entity';
import { Teacher } from '../teachers/entities/teacher.entity';
import { Attendance } from '../attendance/entities/attendance.entity';
import { StudentGrade } from '../grades/entities/student-grade.entity';
import { ClassRoom } from '../classes/entities/class-room.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Student,
      Teacher,
      Attendance,
      StudentGrade,
      ClassRoom,
    ]),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}

