import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentTransferController } from './student-transfer.controller';
import { StudentTransferService } from './student-transfer.service';
import { StudentTransfer } from './entities/student-transfer.entity';
import { Student } from '../students/entities/student.entity';
import { Tenant } from '../tenant/entities/tenant.entity';
import { StudentGrade } from '../grades/entities/student-grade.entity';
import { HealthRecord } from '../health/entities/health-record.entity';
import { CounselingSession } from '../counseling/entities/counseling-session.entity';
import { DisciplinaryAction } from '../discipline/entities/disciplinary-action.entity';
import { SppPayment } from '../finance/entities/spp-payment.entity';
import { ExtracurricularParticipant } from '../extracurricular/entities/extracurricular-participant.entity';
import { CourseEnrollment } from '../elearning/entities/course-enrollment.entity';
import { CourseProgress } from '../elearning/entities/course-progress.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      StudentTransfer,
      Student,
      Tenant,
      StudentGrade,
      HealthRecord,
      CounselingSession,
      DisciplinaryAction,
      SppPayment,
      ExtracurricularParticipant,
      CourseEnrollment,
      CourseProgress,
    ]),
  ],
  controllers: [StudentTransferController],
  providers: [StudentTransferService],
  exports: [StudentTransferService],
})
export class StudentTransferModule {}

