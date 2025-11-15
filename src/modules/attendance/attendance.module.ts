import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendanceController } from './attendance.controller';
import { BiometricController } from './biometric.controller';
import { AttendanceService } from './attendance.service';
import { BiometricDeviceService } from './services/biometric-device.service';
import { BiometricSyncService } from './services/biometric-sync.service';
import { Attendance } from './entities/attendance.entity';
import { BiometricDevice } from './entities/biometric-device.entity';
import { BiometricAttendance } from './entities/biometric-attendance.entity';
import { BiometricEnrollment } from './entities/biometric-enrollment.entity';
import { Schedule } from '../schedules/entities/schedule.entity';
import { Student } from '../students/entities/student.entity';
import { Teacher } from '../teachers/entities/teacher.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Attendance,
      BiometricDevice,
      BiometricAttendance,
      BiometricEnrollment,
      Schedule,
      Student,
      Teacher,
      User,
    ]),
  ],
  controllers: [AttendanceController, BiometricController],
  providers: [AttendanceService, BiometricDeviceService, BiometricSyncService],
  exports: [AttendanceService, BiometricDeviceService, BiometricSyncService],
})
export class AttendanceModule {}
