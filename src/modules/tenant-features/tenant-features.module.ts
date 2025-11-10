import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantFeaturesController } from './tenant-features.controller';
import { TenantFeaturesService } from './tenant-features.service';
import { TenantFeature } from './entities/tenant-feature.entity';
import { TenantModule } from './entities/tenant-module.entity';
import { TenantModule as TenantEntityModule } from '../tenant/tenant.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TenantFeature, TenantModule]),
    TenantEntityModule,
  ],
  controllers: [TenantFeaturesController],
  providers: [TenantFeaturesService],
  exports: [TenantFeaturesService],
})
export class TenantFeaturesModule {}

