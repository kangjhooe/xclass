import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentPortalController } from './student-portal.controller';
import { StudentPortalService } from './student-portal.service';
import { Student } from '../students/entities/student.entity';
import { StudentGrade } from '../grades/entities/student-grade.entity';
import { Attendance } from '../attendance/entities/attendance.entity';
import { Schedule } from '../schedules/entities/schedule.entity';
import { Announcement } from '../announcement/entities/announcement.entity';
import { Exam } from '../exams/entities/exam.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Student,
      StudentGrade,
      Attendance,
      Schedule,
      Announcement,
      Exam,
    ]),
  ],
  controllers: [StudentPortalController],
  providers: [StudentPortalService],
  exports: [StudentPortalService],
})
export class StudentPortalModule {}

