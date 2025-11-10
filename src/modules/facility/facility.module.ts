import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FacilityController } from './facility.controller';
import { FacilityService } from './facility.service';
import { Facility } from './entities/facility.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Facility])],
  controllers: [FacilityController],
  providers: [FacilityService],
  exports: [FacilityService],
})
export class FacilityModule {}

