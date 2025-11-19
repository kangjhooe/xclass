import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { Event } from './entities/event.entity';
import { EventRegistration } from './entities/event-registration.entity';
import { FinanceModule } from '../finance/finance.module';
import { IncomeExpense } from '../finance/entities/income-expense.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Event, EventRegistration, IncomeExpense]),
    FinanceModule,
  ],
  controllers: [EventsController],
  providers: [EventsService],
  exports: [EventsService],
})
export class EventsModule {}

