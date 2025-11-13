import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { GradesController } from './grades.controller';
import { GradesService } from './grades.service';
import { StudentGrade } from './entities/student-grade.entity';
import { Student } from '../students/entities/student.entity';
import { Subject } from '../subjects/entities/subject.entity';
import { Teacher } from '../teachers/entities/teacher.entity';
import { ClassRoom } from '../classes/entities/class-room.entity';
import { Schedule } from '../schedules/entities/schedule.entity';
import { Competency } from '../curriculum/entities/competency.entity';
import { ExportImportModule } from '../export-import/export-import.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      StudentGrade,
      Student,
      Subject,
      Teacher,
      ClassRoom,
      Schedule,
      Competency,
    ]),
    ExportImportModule,
  ],
  controllers: [GradesController],
  providers: [GradesService],
  exports: [GradesService],
})
export class GradesModule {}
