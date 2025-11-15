import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
  Optional,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, LessThan, LessThanOrEqual } from 'typeorm';
import { SubscriptionPlan } from './entities/subscription-plan.entity';
import {
  TenantSubscription,
  SubscriptionStatus,
  BillingCycle,
} from './entities/tenant-subscription.entity';
import { SubscriptionBillingHistory, BillingType } from './entities/subscription-billing-history.entity';
import { Tenant } from '../tenant/entities/tenant.entity';
import { StorageQuotaService } from '../storage/storage-quota.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class SubscriptionService {
  private readonly logger = new Logger(SubscriptionService.name);

  constructor(
    @InjectRepository(SubscriptionPlan)
    private subscriptionPlanRepository: Repository<SubscriptionPlan>,
    @InjectRepository(TenantSubscription)
    private tenantSubscriptionRepository: Repository<TenantSubscription>,
    @InjectRepository(SubscriptionBillingHistory)
    private billingHistoryRepository: Repository<SubscriptionBillingHistory>,
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
    @Inject(forwardRef(() => StorageQuotaService))
    @Optional()
    private storageQuotaService?: StorageQuotaService,
    @Inject(forwardRef(() => NotificationsService))
    @Optional()
    private notificationsService?: NotificationsService,
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

    // Validate dates
    if (startDate >= endDate) {
      throw new BadRequestException('Start date must be before end date');
    }

    // Validate student count
    if (initialStudentCount < 0) {
      throw new BadRequestException('Student count cannot be negative');
    }

    if (plan.maxStudents && initialStudentCount > plan.maxStudents) {
      throw new BadRequestException(
        `Student count (${initialStudentCount}) exceeds plan maximum (${plan.maxStudents})`,
      );
    }

    if (initialStudentCount < plan.minStudents) {
      throw new BadRequestException(
        `Student count (${initialStudentCount}) is below plan minimum (${plan.minStudents})`,
      );
    }

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

    // Setup trial period for paid plans (1 month free trial)
    const now = new Date();
    const trialEndDate = new Date(now);
    trialEndDate.setMonth(trialEndDate.getMonth() + 1);
    
    const isTrial = !plan.isFree && initialStudentCount >= 50;
    const actualStartDate = isTrial ? trialEndDate : startDate;
    const actualEndDate = isTrial 
      ? new Date(trialEndDate.getTime() + (endDate.getTime() - startDate.getTime()))
      : endDate;

    const subscription = this.tenantSubscriptionRepository.create({
      tenantId,
      subscriptionPlanId,
      startDate: actualStartDate,
      endDate: actualEndDate,
      nextBillingDate: actualEndDate,
      status: SubscriptionStatus.ACTIVE,
      billingCycle: BillingCycle.YEARLY,
      currentStudentCount: initialStudentCount,
      studentCountAtBilling: initialStudentCount,
      lockedPricePerStudent: lockedPrice,
      currentBillingAmount: plan.isFree ? 0 : (isTrial ? 0 : initialStudentCount * lockedPrice),
      nextBillingAmount: plan.isFree ? 0 : initialStudentCount * lockedPrice,
      // Trial fields
      isTrial,
      trialStartDate: isTrial ? now : null,
      trialEndDate: isTrial ? trialEndDate : null,
      warningSent: false,
      warningSentAt: null,
      gracePeriodEndDate: null,
    });

    const savedSubscription = await this.tenantSubscriptionRepository.save(subscription);

    // Update storage limit based on student count
    if (this.storageQuotaService) {
      await this.storageQuotaService.updateStorageLimitForTenant(tenantId);
    }

    return savedSubscription;
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

    const savedSubscription = await this.tenantSubscriptionRepository.save(subscription);

    // Update storage limit based on new student count
    if (this.storageQuotaService) {
      await this.storageQuotaService.updateStorageLimitForTenant(tenantId);
    }

    return savedSubscription;
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

  /**
   * Check and convert trial subscriptions to paid
   */
  async checkAndConvertTrials(): Promise<void> {
    const now = new Date();
    const subscriptions = await this.tenantSubscriptionRepository.find({
      where: {
        isTrial: true,
        status: SubscriptionStatus.ACTIVE,
      },
      relations: ['tenant', 'subscriptionPlan'],
    });

    for (const subscription of subscriptions) {
      if (subscription.trialEndDate && subscription.trialEndDate <= now) {
        await this.convertTrialToPaid(subscription.id);
      }
    }
  }

  /**
   * Convert trial subscription to paid
   */
  async convertTrialToPaid(subscriptionId: number): Promise<TenantSubscription> {
    const subscription = await this.tenantSubscriptionRepository.findOne({
      where: { id: subscriptionId },
      relations: ['tenant', 'subscriptionPlan'],
    });

    if (!subscription || !subscription.isTrial) {
      throw new BadRequestException('Subscription is not in trial period');
    }

    const plan = await this.getPlan(subscription.subscriptionPlanId);
    const lockedPrice = subscription.lockedPricePerStudent || plan.pricePerStudentPerYear;

    // Convert to paid
    subscription.isTrial = false;
    subscription.currentBillingAmount = subscription.currentStudentCount * lockedPrice;
    subscription.nextBillingAmount = subscription.currentStudentCount * lockedPrice;
    subscription.trialEndDate = null;

    // Set grace period end date (7 days after trial ends)
    const gracePeriodEnd = new Date();
    gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 7);
    subscription.gracePeriodEndDate = gracePeriodEnd;

    const saved = await this.tenantSubscriptionRepository.save(subscription);

    this.logger.log(
      `Trial converted to paid for tenant ${subscription.tenantId}, subscription ${subscriptionId}`,
    );

    return saved;
  }

  /**
   * Check subscriptions that need warnings and send notifications
   */
  async checkAndSendWarnings(): Promise<void> {
    const now = new Date();
    const warningDate = new Date(now);
    warningDate.setDate(warningDate.getDate() + 7); // 7 days from now

    // Find subscriptions that need warnings
    const subscriptions = await this.tenantSubscriptionRepository.find({
      where: [
        // Trial ending soon
        {
          isTrial: true,
          status: SubscriptionStatus.ACTIVE,
          warningSent: false,
          trialEndDate: LessThanOrEqual(warningDate),
        },
        // Billing ending soon
        {
          isTrial: false,
          status: SubscriptionStatus.ACTIVE,
          warningSent: false,
          endDate: LessThanOrEqual(warningDate),
        },
      ],
      relations: ['tenant', 'subscriptionPlan'],
    });

    for (const subscription of subscriptions) {
      await this.sendWarningNotification(subscription);
    }

    this.logger.log(`Checked ${subscriptions.length} subscriptions for warnings`);
  }

  /**
   * Send warning notification for subscription
   */
  async sendWarningNotification(subscription: TenantSubscription): Promise<void> {
    if (!this.notificationsService) {
      this.logger.warn('NotificationsService not available, skipping warning');
      return;
    }

    const tenant = await this.tenantRepository.findOne({
      where: { id: subscription.tenantId },
    });

    if (!tenant || !tenant.email) {
      this.logger.warn(`No email found for tenant ${subscription.tenantId}`);
      return;
    }

    const plan = await this.getPlan(subscription.subscriptionPlanId);
    const effectiveEndDate = subscription.isTrial
      ? subscription.trialEndDate
      : subscription.endDate;
    
    const daysUntilEnd = effectiveEndDate
      ? Math.ceil((effectiveEndDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    let subject: string;
    let content: string;

    if (subscription.isTrial) {
      subject = `Peringatan: Trial Period Akan Berakhir - ${tenant.name}`;
      content = this.generateTrialWarningEmail(
        tenant.name,
        effectiveEndDate,
        daysUntilEnd,
        subscription.nextBillingAmount,
        subscription.currentStudentCount,
        subscription.lockedPricePerStudent || plan.pricePerStudentPerYear,
      );
    } else {
      subject = `Peringatan: Subscription Akan Berakhir - ${tenant.name}`;
      content = this.generateBillingWarningEmail(
        tenant.name,
        effectiveEndDate,
        daysUntilEnd,
        subscription.nextBillingAmount,
      );
    }

    try {
      // Send email notification
      await this.notificationsService.sendEmail(
        subscription.tenantId,
        0, // System user
        tenant.email,
        subject,
        content,
      );

      // Create in-app notification for all tenant admins
      try {
        const { User } = await import('../users/entities/user.entity');
        const usersRepo = this.tenantRepository.manager.getRepository(User);
        
        const adminUsers = await usersRepo.find({
          where: {
            instansiId: subscription.tenantId,
            role: 'admin_tenant',
          },
        });

        for (const user of adminUsers) {
          try {
            await this.notificationsService.sendInApp(
              subscription.tenantId,
              user.id,
              subscription.isTrial ? 'Trial Period Akan Berakhir' : 'Subscription Akan Berakhir',
              subscription.isTrial
                ? `Trial period akan berakhir dalam ${daysUntilEnd} hari. Setelah trial berakhir, subscription akan dikenakan biaya sebesar Rp ${subscription.nextBillingAmount.toLocaleString('id-ID')}/tahun.`
                : `Subscription akan berakhir dalam ${daysUntilEnd} hari. Biaya renewal: Rp ${subscription.nextBillingAmount.toLocaleString('id-ID')}/tahun.`,
            );
          } catch (inAppError) {
            this.logger.warn(`Failed to send in-app notification to user ${user.id}: ${inAppError.message}`);
          }
        }
      } catch (inAppError) {
        this.logger.warn(`Failed to send in-app notifications: ${inAppError.message}`);
        // Don't fail the whole process if in-app notification fails
      }

      // Mark warning as sent
      subscription.warningSent = true;
      subscription.warningSentAt = new Date();
      await this.tenantSubscriptionRepository.save(subscription);

      this.logger.log(`Warning sent to tenant ${subscription.tenantId}`);
    } catch (error) {
      this.logger.error(
        `Failed to send warning to tenant ${subscription.tenantId}: ${error.message}`,
      );
      // Don't throw - continue processing other subscriptions
    }
  }

  /**
   * Generate trial warning email content
   */
  private generateTrialWarningEmail(
    tenantName: string,
    trialEndDate: Date,
    daysUntilEnd: number,
    billingAmount: number,
    studentCount: number,
    pricePerStudent: number,
  ): string {
    const formattedDate = trialEndDate.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Peringatan: Trial Period Akan Berakhir</h2>
        <p>Yth. ${tenantName},</p>
        <p>Trial period Anda akan berakhir dalam <strong>${daysUntilEnd} hari</strong> (${formattedDate}).</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Detail Subscription:</h3>
          <ul style="list-style: none; padding: 0;">
            <li><strong>Jumlah Siswa:</strong> ${studentCount}</li>
            <li><strong>Harga per Siswa:</strong> Rp ${pricePerStudent.toLocaleString('id-ID')}/tahun</li>
            <li><strong>Total Billing:</strong> Rp ${billingAmount.toLocaleString('id-ID')}/tahun</li>
            <li><strong>Trial Berakhir:</strong> ${formattedDate}</li>
          </ul>
        </div>
        <p>Setelah trial berakhir, subscription akan dikenakan biaya sebesar <strong>Rp ${billingAmount.toLocaleString('id-ID')}</strong> per tahun.</p>
        <p>Silakan siapkan pembayaran untuk melanjutkan layanan.</p>
        <p style="margin-top: 30px;">Terima kasih,<br>Tim XClass</p>
      </div>
    `;
  }

  /**
   * Generate billing warning email content
   */
  private generateBillingWarningEmail(
    tenantName: string,
    endDate: Date,
    daysUntilEnd: number,
    billingAmount: number,
  ): string {
    const formattedDate = endDate.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Peringatan: Subscription Akan Berakhir</h2>
        <p>Yth. ${tenantName},</p>
        <p>Subscription Anda akan berakhir dalam <strong>${daysUntilEnd} hari</strong> (${formattedDate}).</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Detail Renewal:</h3>
          <ul style="list-style: none; padding: 0;">
            <li><strong>Biaya Renewal:</strong> Rp ${billingAmount.toLocaleString('id-ID')}/tahun</li>
            <li><strong>Tanggal Berakhir:</strong> ${formattedDate}</li>
          </ul>
        </div>
        <p>Silakan lakukan pembayaran untuk memperpanjang subscription.</p>
        <p style="margin-top: 30px;">Terima kasih,<br>Tim XClass</p>
      </div>
    `;
  }

  /**
   * Check and handle expired subscriptions (grace period)
   */
  async checkAndHandleExpiredSubscriptions(): Promise<void> {
    const now = new Date();
    
    // Find subscriptions that are expired but not yet suspended
    const expiredSubscriptions = await this.tenantSubscriptionRepository.find({
      where: {
        status: SubscriptionStatus.ACTIVE,
        endDate: LessThan(now),
      },
      relations: ['tenant', 'subscriptionPlan'],
    });

    for (const subscription of expiredSubscriptions) {
      // Set grace period if not set yet (7 days)
      if (!subscription.gracePeriodEndDate) {
        const gracePeriodEnd = new Date(subscription.endDate);
        gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 7);
        subscription.gracePeriodEndDate = gracePeriodEnd;
        await this.tenantSubscriptionRepository.save(subscription);
      }

      // Suspend if grace period ended
      if (
        subscription.gracePeriodEndDate &&
        subscription.gracePeriodEndDate < now
      ) {
        subscription.status = SubscriptionStatus.SUSPENDED;
        await this.tenantSubscriptionRepository.save(subscription);
        this.logger.log(
          `Subscription ${subscription.id} suspended after grace period`,
        );
      }
    }
  }

  /**
   * Helper: Check if subscription is in trial
   */
  isInTrial(subscription: TenantSubscription): boolean {
    if (!subscription.isTrial || !subscription.trialEndDate) return false;
    return new Date() < subscription.trialEndDate;
  }

  /**
   * Helper: Check if subscription is ending soon (7 days)
   */
  isEndingSoon(subscription: TenantSubscription): boolean {
    const effectiveEndDate = subscription.isTrial
      ? subscription.trialEndDate
      : subscription.endDate;
    
    if (!effectiveEndDate) return false;
    
    const daysUntilEnd = Math.ceil(
      (effectiveEndDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
    );
    
    return daysUntilEnd <= 7 && daysUntilEnd > 0;
  }

  /**
   * Helper: Get days until effective end (trial or billing)
   */
  getDaysUntilEffectiveEnd(subscription: TenantSubscription): number {
    const effectiveEndDate = subscription.isTrial
      ? subscription.trialEndDate
      : subscription.endDate;
    
    if (!effectiveEndDate) return 0;
    
    const days = Math.ceil(
      (effectiveEndDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
    );
    
    return Math.max(0, days);
  }
}

