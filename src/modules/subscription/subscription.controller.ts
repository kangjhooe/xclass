import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { SubscriptionPlan } from './entities/subscription-plan.entity';
import { TenantSubscription, SubscriptionStatus } from './entities/tenant-subscription.entity';

@Controller('admin/subscriptions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('super_admin')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  // Subscription Plans
  @Get('plans')
  getAllPlans() {
    return this.subscriptionService.getAllPlans();
  }

  @Get('plans/:id')
  getPlan(@Param('id') id: string) {
    return this.subscriptionService.getPlan(+id);
  }

  @Post('plans')
  createPlan(@Body() planData: Partial<SubscriptionPlan>) {
    return this.subscriptionService.createPlan(planData);
  }

  @Put('plans/:id')
  updatePlan(@Param('id') id: string, @Body() planData: Partial<SubscriptionPlan>) {
    return this.subscriptionService.updatePlan(+id, planData);
  }

  @Delete('plans/:id')
  deletePlan(@Param('id') id: string) {
    return this.subscriptionService.deletePlan(+id);
  }

  // Tenant Subscriptions
  @Get()
  getAllSubscriptions(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: SubscriptionStatus,
  ) {
    return this.subscriptionService.getAllSubscriptions(
      page ? +page : 1,
      limit ? +limit : 20,
      status,
    );
  }

  @Get('tenants/:tenantId')
  getTenantSubscription(@Param('tenantId') tenantId: string) {
    return this.subscriptionService.getTenantSubscription(+tenantId);
  }

  @Post('tenants/:tenantId')
  createSubscription(
    @Param('tenantId') tenantId: string,
    @Body()
    body: {
      subscriptionPlanId: number;
      startDate: string;
      endDate: string;
    },
  ) {
    return this.subscriptionService.createSubscription(
      +tenantId,
      body.subscriptionPlanId,
      new Date(body.startDate),
      new Date(body.endDate),
    );
  }

  @Put('tenants/:tenantId')
  updateSubscription(
    @Param('tenantId') tenantId: string,
    @Body() updateData: Partial<TenantSubscription>,
  ) {
    return this.subscriptionService.updateSubscription(+tenantId, updateData);
  }

  @Post('tenants/:tenantId/change-plan')
  changePlan(
    @Param('tenantId') tenantId: string,
    @Body() body: { newPlanId: number },
  ) {
    return this.subscriptionService.changePlan(+tenantId, body.newPlanId);
  }

  @Post('tenants/:tenantId/update-student-count')
  updateStudentCount(
    @Param('tenantId') tenantId: string,
    @Body() body: { studentCount: number },
  ) {
    return this.subscriptionService.updateStudentCount(
      +tenantId,
      body.studentCount,
    );
  }

  @Post('tenants/:tenantId/suspend')
  suspendSubscription(@Param('tenantId') tenantId: string) {
    return this.subscriptionService.suspendSubscription(+tenantId);
  }

  @Post('tenants/:tenantId/activate')
  activateSubscription(@Param('tenantId') tenantId: string) {
    return this.subscriptionService.activateSubscription(+tenantId);
  }

  @Post('tenants/:tenantId/cancel')
  cancelSubscription(@Param('tenantId') tenantId: string) {
    return this.subscriptionService.cancelSubscription(+tenantId);
  }

  @Post('tenants/:tenantId/mark-paid')
  markAsPaid(
    @Param('tenantId') tenantId: string,
    @Body() body: { paidAt?: string },
  ) {
    return this.subscriptionService.markAsPaid(
      +tenantId,
      body.paidAt ? new Date(body.paidAt) : undefined,
    );
  }

  @Get('tenants/:tenantId/billing-history')
  getBillingHistory(
    @Param('tenantId') tenantId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.subscriptionService.getBillingHistory(
      +tenantId,
      page ? +page : 1,
      limit ? +limit : 20,
    );
  }

  @Get('expiring')
  getExpiringSubscriptions(@Query('days') days?: number) {
    return this.subscriptionService.getExpiringSubscriptions(
      days ? +days : 30,
    );
  }
}

