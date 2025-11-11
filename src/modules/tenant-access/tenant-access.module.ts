import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantAccessRequest } from './entities/tenant-access-request.entity';
import { Tenant } from '../tenant/entities/tenant.entity';
import { User } from '../users/entities/user.entity';
import { TenantAccessService } from './tenant-access.service';
import { AdminTenantAccessController } from './admin-tenant-access.controller';
import { TenantTenantAccessController } from './tenant-tenant-access.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TenantAccessRequest, Tenant, User])],
  providers: [TenantAccessService],
  controllers: [AdminTenantAccessController, TenantTenantAccessController],
  exports: [TenantAccessService],
})
export class TenantAccessModule {}

