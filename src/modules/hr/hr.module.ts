import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HrController } from './hr.controller';
import { HrService } from './hr.service';
import { Employee } from './entities/employee.entity';
import { Payroll } from './entities/payroll.entity';
// import { PayrollItem } from './entities/payroll-item.entity';
import { Position } from './entities/position.entity';
import { Department } from './entities/department.entity';
// import { EmployeeAttendance } from './entities/employee-attendance.entity';
import { PerformanceReview } from './entities/performance-review.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Employee,
      Payroll,
      // PayrollItem,
      Position,
      Department,
      // EmployeeAttendance,
      PerformanceReview,
    ]),
  ],
  controllers: [HrController],
  providers: [HrService],
  exports: [HrService],
})
export class HrModule {}
