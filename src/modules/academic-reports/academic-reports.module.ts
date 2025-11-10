import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AcademicReportsController } from './academic-reports.controller';
import { AcademicReportsService } from './academic-reports.service';
import { StudentGrade } from '../grades/entities/student-grade.entity';
import { Student } from '../students/entities/student.entity';
import { ClassRoom } from '../classes/entities/class-room.entity';
import { Subject } from '../subjects/entities/subject.entity';
import { Attendance } from '../attendance/entities/attendance.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([StudentGrade, Student, ClassRoom, Subject, Attendance]),
  ],
  controllers: [AcademicReportsController],
  providers: [AcademicReportsService],
  exports: [AcademicReportsService],
})
export class AcademicReportsModule {}

