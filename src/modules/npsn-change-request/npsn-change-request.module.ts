import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NpsnChangeRequestController } from './npsn-change-request.controller';
import { NpsnChangeRequestService } from './npsn-change-request.service';
import { NpsnChangeRequest } from './entities/npsn-change-request.entity';
import { Tenant } from '../tenant/entities/tenant.entity';

@Module({
  imports: [TypeOrmModule.forFeature([NpsnChangeRequest, Tenant])],
  controllers: [NpsnChangeRequestController],
  providers: [NpsnChangeRequestService],
  exports: [NpsnChangeRequestService],
})
export class NpsnChangeRequestModule {}

