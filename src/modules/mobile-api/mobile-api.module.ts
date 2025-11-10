import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MobileApiController } from './mobile-api.controller';
import { MobileApiService } from './mobile-api.service';
import { Student } from '../students/entities/student.entity';
import { StudentGrade } from '../grades/entities/student-grade.entity';
import { Attendance } from '../attendance/entities/attendance.entity';
import { Schedule } from '../schedules/entities/schedule.entity';
import { Announcement } from '../announcement/entities/announcement.entity';
import { Exam } from '../exams/entities/exam.entity';
import { Tenant } from '../tenant/entities/tenant.entity';
import { User } from '../users/entities/user.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Student,
      StudentGrade,
      Attendance,
      Schedule,
      Announcement,
      Exam,
      Tenant,
      User,
    ]),
    AuthModule,
  ],
  controllers: [MobileApiController],
  providers: [MobileApiService],
  exports: [MobileApiService],
})
export class MobileApiModule {}

