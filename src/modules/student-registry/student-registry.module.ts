import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentRegistryController } from './student-registry.controller';
import { StudentRegistryService } from './student-registry.service';
import { DataAggregatorService } from './services/data-aggregator.service';
import { PdfGeneratorService } from './services/pdf-generator.service';
import { Student } from '../students/entities/student.entity';
import { RegistrySnapshot } from './entities/registry-snapshot.entity';
import { StudentGrade } from '../grades/entities/student-grade.entity';
import { Attendance } from '../attendance/entities/attendance.entity';
import { HealthRecord } from '../health/entities/health-record.entity';
import { DisciplinaryAction } from '../discipline/entities/disciplinary-action.entity';
import { CounselingSession } from '../counseling/entities/counseling-session.entity';
import { ExtracurricularParticipant } from '../extracurricular/entities/extracurricular-participant.entity';
import { ExamAttempt } from '../exams/entities/exam-attempt.entity';
import { Promotion } from '../promotion/entities/promotion.entity';
import { StudentTransfer } from '../student-transfer/entities/student-transfer.entity';
import { Graduation } from '../graduation/entities/graduation.entity';
import { Alumni } from '../alumni/entities/alumni.entity';
import { BookLoan } from '../library/entities/book-loan.entity';
import { SppPayment } from '../finance/entities/spp-payment.entity';
import { EventRegistration } from '../events/entities/event-registration.entity';
import { DigitalSignature } from '../academic-reports/entities/digital-signature.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Student,
      RegistrySnapshot,
      StudentGrade,
      Attendance,
      HealthRecord,
      DisciplinaryAction,
      CounselingSession,
      ExtracurricularParticipant,
      ExamAttempt,
      Promotion,
      StudentTransfer,
      Graduation,
      Alumni,
      BookLoan,
      SppPayment,
      EventRegistration,
      DigitalSignature,
    ]),
  ],
  controllers: [StudentRegistryController],
  providers: [StudentRegistryService, DataAggregatorService, PdfGeneratorService],
  exports: [StudentRegistryService],
})
export class StudentRegistryModule {}

