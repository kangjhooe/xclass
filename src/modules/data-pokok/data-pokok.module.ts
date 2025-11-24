import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataPokokController } from './data-pokok.controller';
import { DataPokokService } from './data-pokok.service';
import { DataPokok } from './entities/data-pokok.entity';
import { Tenant } from '../tenant/entities/tenant.entity';
import { TenantProfile } from '../public-page/entities/tenant-profile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DataPokok, Tenant, TenantProfile])],
  controllers: [DataPokokController],
  providers: [DataPokokService],
  exports: [DataPokokService],
})
export class DataPokokModule {}

