import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, LessThan } from 'typeorm';
import { SubscriptionPlan } from './entities/subscription-plan.entity';
import {
  TenantSubscription,
  SubscriptionStatus,
  BillingCycle,
} from './entities/tenant-subscription.entity';
import { SubscriptionBillingHistory, BillingType } from './entities/subscription-billing-history.entity';
import { Tenant } from '../tenant/entities/tenant.entity';

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectRepository(SubscriptionPlan)
    private subscriptionPlanRepository: Repository<SubscriptionPlan>,
    @InjectRepository(TenantSubscription)
    private tenantSubscriptionRepository: Repository<TenantSubscription>,
    @InjectRepository(SubscriptionBillingHistory)
    private billingHistoryRepository: Repository<SubscriptionBillingHistory>,
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
  ) {}

  // Subscription Plans
  async getAllPlans() {
    return this.subscriptionPlanRepository.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
  }

  async getPlan(id: number) {
    const plan = await this.subscriptionPlanRepository.findOne({
      where: { id },
    });
    if (!plan) {
      throw new NotFoundException(`Subscription plan with ID ${id} not found`);
    }
    return plan;
  }

  async createPlan(planData: Partial<SubscriptionPlan>) {
    const plan = this.subscriptionPlanRepository.create(planData);
    return this.subscriptionPlanRepository.save(plan);
  }

  async updatePlan(id: number, planData: Partial<SubscriptionPlan>) {
    const plan = await this.getPlan(id);
    Object.assign(plan, planData);
    return this.subscriptionPlanRepository.save(plan);
  }

  async deletePlan(id: number) {
    const plan = await this.getPlan(id);
    return this.subscriptionPlanRepository.remove(plan);
  }

  // Tenant Subscriptions
  async getAllSubscriptions(
    page: number = 1,
    limit: number = 20,
    status?: SubscriptionStatus,
  ) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (status) where.status = status;

    const [subscriptions, total] =
      await this.tenantSubscriptionRepository.findAndCount({
        where,
        skip,
        take: limit,
        relations: ['tenant', 'subscriptionPlan'],
        order: { createdAt: 'DESC' },
      });

    return {
      data: subscriptions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getTenantSubscription(tenantId: number) {
    const subscription = await this.tenantSubscriptionRepository.findOne({
      where: { tenantId },
      relations: ['tenant', 'subscriptionPlan', 'billingHistory'],
      order: { createdAt: 'DESC' },
    });
    if (!subscription) {
      throw new NotFoundException(
        `Subscription not found for tenant ${tenantId}`,
      );
    }
    return subscription;
  }

  async createSubscription(
    tenantId: number,
    subscriptionPlanId: number,
    startDate: Date,
    endDate: Date,
  ) {
    const tenant = await this.tenantRepository.findOne({
      where: { id: tenantId },
    });
    if (!tenant) {
      throw new NotFoundException(`Tenant with ID ${tenantId} not found`);
    }

    const plan = await this.getPlan(subscriptionPlanId);

    // Check if tenant already has active subscription
    const existing = await this.tenantSubscriptionRepository.findOne({
      where: {
        tenantId,
        status: SubscriptionStatus.ACTIVE,
      },
    });
    if (existing) {
      throw new BadRequestException(
        'Tenant already has an active subscription',
      );
    }

    const subscription = this.tenantSubscriptionRepository.create({
      tenantId,
      subscriptionPlanId,
      startDate,
      endDate,
      nextBillingDate: endDate,
      status: SubscriptionStatus.ACTIVE,
      billingCycle: BillingCycle.YEARLY,
    });

    return this.tenantSubscriptionRepository.save(subscription);
  }

  async updateSubscription(
    tenantId: number,
    updateData: Partial<TenantSubscription>,
  ) {
    const subscription = await this.getTenantSubscription(tenantId);
    Object.assign(subscription, updateData);
    return this.tenantSubscriptionRepository.save(subscription);
  }

  async changePlan(tenantId: number, newPlanId: number) {
    const subscription = await this.getTenantSubscription(tenantId);
    const newPlan = await this.getPlan(newPlanId);

    subscription.subscriptionPlanId = newPlanId;
    // Recalculate billing based on new plan
    subscription.nextBillingAmount = this.calculateBillingAmount(
      subscription.currentStudentCount,
      newPlan,
    );

    return this.tenantSubscriptionRepository.save(subscription);
  }

  async updateStudentCount(tenantId: number, studentCount: number) {
    const subscription = await this.getTenantSubscription(tenantId);
    const plan = await this.getPlan(subscription.subscriptionPlanId);

    subscription.currentStudentCount = studentCount;
    const increase = studentCount - subscription.studentCountAtBilling;
    subscription.pendingStudentIncrease = Math.max(0, increase);

    // Check if threshold is met
    if (
      plan.billingThreshold > 0 &&
      subscription.pendingStudentIncrease >= plan.billingThreshold
    ) {
      // Trigger threshold billing
      await this.processThresholdBilling(subscription);
    } else {
      // Update next billing amount
      subscription.nextBillingAmount = this.calculateBillingAmount(
        studentCount,
        plan,
      );
    }

    return this.tenantSubscriptionRepository.save(subscription);
  }

  async suspendSubscription(tenantId: number) {
    const subscription = await this.getTenantSubscription(tenantId);
    subscription.status = SubscriptionStatus.SUSPENDED;
    return this.tenantSubscriptionRepository.save(subscription);
  }

  async activateSubscription(tenantId: number) {
    const subscription = await this.getTenantSubscription(tenantId);
    subscription.status = SubscriptionStatus.ACTIVE;
    return this.tenantSubscriptionRepository.save(subscription);
  }

  async cancelSubscription(tenantId: number) {
    const subscription = await this.getTenantSubscription(tenantId);
    subscription.status = SubscriptionStatus.CANCELLED;
    return this.tenantSubscriptionRepository.save(subscription);
  }

  async markAsPaid(tenantId: number, paidAt?: Date) {
    const subscription = await this.getTenantSubscription(tenantId);
    subscription.isPaid = true;
    subscription.paidAt = paidAt || new Date();
    subscription.lastBillingDate = new Date();
    return this.tenantSubscriptionRepository.save(subscription);
  }

  // Billing History
  async getBillingHistory(tenantId: number, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const [history, total] = await this.billingHistoryRepository.findAndCount({
      where: { tenantId },
      skip,
      take: limit,
      order: { billingDate: 'DESC' },
    });

    return {
      data: history,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getExpiringSubscriptions(days: number = 30) {
    const date = new Date();
    date.setDate(date.getDate() + days);

    return this.tenantSubscriptionRepository.find({
      where: {
        status: SubscriptionStatus.ACTIVE,
        endDate: LessThan(date),
      },
      relations: ['tenant', 'subscriptionPlan'],
    });
  }

  private calculateBillingAmount(
    studentCount: number,
    plan: SubscriptionPlan,
  ): number {
    if (plan.isFree) return 0;
    return studentCount * plan.pricePerStudentPerYear;
  }

  private async processThresholdBilling(subscription: TenantSubscription) {
    const plan = await this.getPlan(subscription.subscriptionPlanId);
    const billingAmount =
      subscription.pendingStudentIncrease * plan.pricePerStudentPerYear;

    // Create billing history record
    const billingHistory = this.billingHistoryRepository.create({
      tenantSubscriptionId: subscription.id,
      tenantId: subscription.tenantId,
      studentCount: subscription.currentStudentCount,
      previousStudentCount: subscription.studentCountAtBilling,
      billingAmount,
      previousBillingAmount: subscription.currentBillingAmount,
      billingType: BillingType.THRESHOLD_MET,
      pendingIncreaseBefore: subscription.pendingStudentIncrease,
      pendingIncreaseAfter: 0,
      thresholdTriggered: true,
      billingDate: new Date(),
      periodStart: new Date(),
      periodEnd: subscription.endDate,
    });

    await this.billingHistoryRepository.save(billingHistory);

    // Update subscription
    subscription.studentCountAtBilling = subscription.currentStudentCount;
    subscription.pendingStudentIncrease = 0;
    subscription.currentBillingAmount += billingAmount;
  }
}

