import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AcademicReportsController } from './academic-reports.controller';
import { DigitalSignatureController } from './digital-signature.controller';
import { AcademicReportsService } from './academic-reports.service';
import { DigitalSignatureService } from './services/digital-signature.service';
import { PdfSignatureService } from './services/pdf-signature.service';
import { StudentGrade } from '../grades/entities/student-grade.entity';
import { Student } from '../students/entities/student.entity';
import { ClassRoom } from '../classes/entities/class-room.entity';
import { Subject } from '../subjects/entities/subject.entity';
import { Attendance } from '../attendance/entities/attendance.entity';
import { DigitalSignature } from './entities/digital-signature.entity';
import { SignedDocument } from './entities/signed-document.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      StudentGrade,
      Student,
      ClassRoom,
      Subject,
      Attendance,
      DigitalSignature,
      SignedDocument,
      User,
    ]),
  ],
  controllers: [AcademicReportsController, DigitalSignatureController],
  providers: [AcademicReportsService, DigitalSignatureService, PdfSignatureService],
  exports: [AcademicReportsService, DigitalSignatureService, PdfSignatureService],
})
export class AcademicReportsModule {}

