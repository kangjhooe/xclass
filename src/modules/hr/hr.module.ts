import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HrController } from './hr.controller';
import { HrService } from './hr.service';
import { Employee } from './entities/employee.entity';
import { Payroll } from './entities/payroll.entity';
import { PayrollItem } from './entities/payroll-item.entity';
import { Position } from './entities/position.entity';
import { PositionModule } from './entities/position-module.entity';
import { Department } from './entities/department.entity';
// import { EmployeeAttendance } from './entities/employee-attendance.entity';
import { PerformanceReview } from './entities/performance-review.entity';
import { ModuleAccessModule } from '../../common/module-access.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Employee,
      Payroll,
      PayrollItem,
      Position,
      PositionModule,
      Department,
      // EmployeeAttendance,
      PerformanceReview,
    ]),
    ModuleAccessModule,
  ],
  controllers: [HrController],
  providers: [HrService],
  exports: [HrService],
})
export class HrModule {}
