import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinanceController } from './finance.controller';
import { FinanceService } from './finance.service';
import { SppPayment } from './entities/spp-payment.entity';
import { ModuleAccessModule } from '../../common/module-access.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SppPayment]),
    ModuleAccessModule,
  ],
  controllers: [FinanceController],
  providers: [FinanceService],
  exports: [FinanceService],
})
export class FinanceModule {}

