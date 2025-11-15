import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StorageController } from './storage.controller';
import { StorageService } from './storage.service';
import { StorageQuotaService } from './storage-quota.service';
import { StorageUpgrade } from './entities/storage-upgrade.entity';
import { Tenant } from '../tenant/entities/tenant.entity';
import { TenantSubscription } from '../subscription/entities/tenant-subscription.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([StorageUpgrade, Tenant, TenantSubscription]),
  ],
  controllers: [StorageController],
  providers: [StorageService, StorageQuotaService],
  exports: [StorageService, StorageQuotaService],
})
export class StorageModule {}

