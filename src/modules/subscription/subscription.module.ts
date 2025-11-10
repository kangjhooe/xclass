import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionController } from './subscription.controller';
import { SubscriptionService } from './subscription.service';
import { SubscriptionPlan } from './entities/subscription-plan.entity';
import { TenantSubscription } from './entities/tenant-subscription.entity';
import { SubscriptionBillingHistory } from './entities/subscription-billing-history.entity';
import { Tenant } from '../tenant/entities/tenant.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SubscriptionPlan,
      TenantSubscription,
      SubscriptionBillingHistory,
      Tenant,
    ]),
  ],
  controllers: [SubscriptionController],
  providers: [SubscriptionService],
  exports: [SubscriptionService],
})
export class SubscriptionModule {}

