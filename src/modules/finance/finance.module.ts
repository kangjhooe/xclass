import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinanceController } from './finance.controller';
import { FinanceService } from './finance.service';
import { SppPayment } from './entities/spp-payment.entity';
import { StudentSavings } from './entities/student-savings.entity';
import { OtherBill } from './entities/other-bill.entity';
import { IncomeExpense } from './entities/income-expense.entity';
import { Scholarship } from './entities/scholarship.entity';
import { Budget } from './entities/budget.entity';
import { ModuleAccessModule } from '../../common/module-access.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SppPayment, StudentSavings, OtherBill, IncomeExpense, Scholarship, Budget]),
    ModuleAccessModule,
  ],
  controllers: [FinanceController],
  providers: [FinanceService],
  exports: [FinanceService],
})
export class FinanceModule {}

