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
    initialStudentCount: number = 0,
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

    // Determine locked price based on initial student count
    const lockedPrice = this.determineLockedPrice(initialStudentCount, plan);

    const subscription = this.tenantSubscriptionRepository.create({
      tenantId,
      subscriptionPlanId,
      startDate,
      endDate,
      nextBillingDate: endDate,
      status: SubscriptionStatus.ACTIVE,
      billingCycle: BillingCycle.YEARLY,
      currentStudentCount: initialStudentCount,
      studentCountAtBilling: initialStudentCount,
      lockedPricePerStudent: lockedPrice,
      currentBillingAmount: plan.isFree ? 0 : initialStudentCount * lockedPrice,
      nextBillingAmount: plan.isFree ? 0 : initialStudentCount * lockedPrice,
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
    
    // Update locked price based on current student count and new plan
    const newLockedPrice = this.determineLockedPrice(
      subscription.currentStudentCount,
      newPlan,
    );
    subscription.lockedPricePerStudent = newLockedPrice;
    
    // Recalculate billing based on new plan and locked price
    subscription.nextBillingAmount = this.calculateBillingAmount(
      subscription.currentStudentCount,
      newPlan,
      newLockedPrice,
    );

    return this.tenantSubscriptionRepository.save(subscription);
  }

  async updateStudentCount(tenantId: number, studentCount: number) {
    const subscription = await this.getTenantSubscription(tenantId);
    const plan = await this.getPlan(subscription.subscriptionPlanId);

    const previousStudentCount = subscription.currentStudentCount;
    const increase = studentCount - subscription.studentCountAtBilling;
    
    // Check if should downgrade to free (if < 50 students)
    if (studentCount < 50) {
      // Auto downgrade to Free Forever
      const freePlan = await this.subscriptionPlanRepository.findOne({
        where: { slug: 'free-forever', isActive: true },
      });
      
      if (freePlan) {
        subscription.subscriptionPlanId = freePlan.id;
        subscription.currentStudentCount = studentCount;
        subscription.studentCountAtBilling = studentCount;
        subscription.pendingStudentIncrease = 0;
        subscription.currentBillingAmount = 0;
        subscription.nextBillingAmount = 0;
        subscription.lockedPricePerStudent = 0;
        return this.tenantSubscriptionRepository.save(subscription);
      }
    }

    subscription.currentStudentCount = studentCount;
    
    // Calculate billing with new rules
    const billingResult = this.calculateBillingForStudentIncrease(
      previousStudentCount,
      studentCount,
      subscription.studentCountAtBilling,
      subscription.lockedPricePerStudent || plan.pricePerStudentPerYear,
    );

    if (billingResult.shouldBill) {
      // Process billing
      subscription.pendingStudentIncrease = billingResult.billingStudentCount;
      
      // If billing amount is significant, create billing history
      if (billingResult.billingAmount > 0) {
        await this.processStudentIncreaseBilling(
          subscription,
          previousStudentCount,
          studentCount,
          billingResult,
        );
      }
    } else {
      // No billing, just update pending
      subscription.pendingStudentIncrease = Math.max(0, increase);
    }

    // Update next billing amount
    const lockedPrice = subscription.lockedPricePerStudent || plan.pricePerStudentPerYear;
    subscription.nextBillingAmount = plan.isFree 
      ? 0 
      : studentCount * lockedPrice;

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
    lockedPrice?: number,
  ): number {
    if (plan.isFree) return 0;
    const price = lockedPrice || plan.pricePerStudentPerYear;
    return studentCount * price;
  }

  /**
   * Determine locked price based on student count and plan
   */
  private determineLockedPrice(
    studentCount: number,
    plan: SubscriptionPlan,
  ): number {
    if (plan.isFree) return 0;
    
    // Pricing tiers:
    // 0-49: Free (handled by isFree)
    // 51-500: Rp 5.000
    // 501+: Rp 4.000
    
    if (studentCount >= 501) {
      return 4000; // Enterprise tier
    } else if (studentCount >= 50) {
      return 5000; // Standard tier
    }
    
    return plan.pricePerStudentPerYear;
  }

  /**
   * Calculate billing for student increase with new rules:
   * - Threshold: 20 students
   * - Exception: Cross tier (45→51, 499→502)
   * - Pricing lock: Use locked price
   */
  private calculateBillingForStudentIncrease(
    currentStudentCount: number,
    newStudentCount: number,
    studentCountAtBilling: number,
    lockedPricePerStudent: number,
    billingThreshold: number = 20,
  ): {
    shouldBill: boolean;
    billingAmount: number;
    billingStudentCount: number;
    reason: string;
  } {
    const increase = newStudentCount - studentCountAtBilling;
    
    if (increase <= 0) {
      return {
        shouldBill: false,
        billingAmount: 0,
        billingStudentCount: 0,
        reason: 'No increase in student count',
      };
    }

    // Check cross tier thresholds
    const crossesFreeToPaid = currentStudentCount < 50 && newStudentCount >= 50;
    const crossesTier500 = currentStudentCount <= 500 && newStudentCount > 500;
    const crossesTier500Down = currentStudentCount > 500 && newStudentCount <= 500;

    // Exception 1: Cross tier Free to Paid (45→51)
    if (crossesFreeToPaid) {
      // Bill for all students (new total)
      const billingAmount = newStudentCount * lockedPricePerStudent;
      return {
        shouldBill: true,
        billingAmount,
        billingStudentCount: newStudentCount,
        reason: 'Cross tier: Free to Paid',
      };
    }

    // Exception 2: Cross tier 500 threshold (499→502)
    if (crossesTier500 || crossesTier500Down) {
      // Bill for the increase, but use locked price (not new tier price)
      const billingAmount = increase * lockedPricePerStudent;
      return {
        shouldBill: true,
        billingAmount,
        billingStudentCount: increase,
        reason: 'Cross tier: 500 threshold (using locked price)',
      };
    }

    // Normal billing: only if increase >= threshold
    if (increase >= billingThreshold) {
      const billingAmount = increase * lockedPricePerStudent;
      return {
        shouldBill: true,
        billingAmount,
        billingStudentCount: increase,
        reason: `Increase >= ${billingThreshold} students`,
      };
    }

    // No billing for small increases (< threshold and no cross tier)
    return {
      shouldBill: false,
      billingAmount: 0,
      billingStudentCount: 0,
      reason: `Increase < ${billingThreshold} students (no cross tier)`,
    };
  }

  /**
   * Process billing for student increase
   */
  private async processStudentIncreaseBilling(
    subscription: TenantSubscription,
    previousStudentCount: number,
    newStudentCount: number,
    billingResult: {
      shouldBill: boolean;
      billingAmount: number;
      billingStudentCount: number;
      reason: string;
    },
  ) {
    const billingHistory = this.billingHistoryRepository.create({
      tenantSubscriptionId: subscription.id,
      tenantId: subscription.tenantId,
      studentCount: newStudentCount,
      previousStudentCount: previousStudentCount,
      billingAmount: billingResult.billingAmount,
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
    subscription.studentCountAtBilling = newStudentCount;
    subscription.pendingStudentIncrease = 0;
    subscription.currentBillingAmount += billingResult.billingAmount;
  }

  private async processThresholdBilling(subscription: TenantSubscription) {
    const plan = await this.getPlan(subscription.subscriptionPlanId);
    const lockedPrice = subscription.lockedPricePerStudent || plan.pricePerStudentPerYear;
    const billingAmount =
      subscription.pendingStudentIncrease * lockedPrice;

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

