import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransportationController } from './transportation.controller';
import { TransportationService } from './transportation.service';
import { TransportationRoute } from './entities/transportation-route.entity';
import { TransportationSchedule } from './entities/transportation-schedule.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([TransportationRoute, TransportationSchedule]),
  ],
  controllers: [TransportationController],
  providers: [TransportationService],
  exports: [TransportationService],
})
export class TransportationModule {}

