import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionController } from './subscription.controller';
import { PaymentGatewayController } from './payment-gateway.controller';
import { SubscriptionService } from './subscription.service';
import { SubscriptionSchedulerService } from './subscription-scheduler.service';
import { XenditService } from './services/xendit.service';
import { PaymentGatewayService } from './services/payment-gateway.service';
import { SubscriptionPlan } from './entities/subscription-plan.entity';
import { TenantSubscription } from './entities/tenant-subscription.entity';
import { SubscriptionBillingHistory } from './entities/subscription-billing-history.entity';
import { PaymentGatewayTransaction } from './entities/payment-gateway-transaction.entity';
import { Tenant } from '../tenant/entities/tenant.entity';
import { StorageModule } from '../storage/storage.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SubscriptionPlan,
      TenantSubscription,
      SubscriptionBillingHistory,
      PaymentGatewayTransaction,
      Tenant,
    ]),
    forwardRef(() => StorageModule),
    forwardRef(() => NotificationsModule),
  ],
  controllers: [SubscriptionController, PaymentGatewayController],
  providers: [
    SubscriptionService,
    SubscriptionSchedulerService,
    XenditService,
    PaymentGatewayService,
  ],
  exports: [SubscriptionService],
})
export class SubscriptionModule {}

