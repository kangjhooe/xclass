import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';

/**
 * Subscription Scheduler Service
 * 
 * Note: For automatic scheduling, install @nestjs/schedule and uncomment @Cron decorators.
 * Alternatively, set up external cron job to call the maintenance endpoints.
 * 
 * Example cron job (runs daily at 9 AM):
 * 0 9 * * * curl -X POST http://localhost:3000/admin/subscriptions/maintenance/run-all
 */
@Injectable()
export class SubscriptionSchedulerService implements OnModuleInit {
  private readonly logger = new Logger(SubscriptionSchedulerService.name);

  constructor(private readonly subscriptionService: SubscriptionService) {}

  onModuleInit() {
    this.logger.log('Subscription Scheduler Service initialized');
    this.logger.log('To enable automatic scheduling, install @nestjs/schedule or set up external cron job');
  }

  /**
   * Run all maintenance tasks (can be called manually or via cron)
   * 
   * Schedule:
   * - Trial conversion: Daily at 2 AM
   * - Warning check: Daily at 9 AM
   * - Expired check: Daily at 3 AM
   */
  async runAllMaintenanceTasks() {
    this.logger.log('Running all maintenance tasks...');
    try {
      // Check and convert trials
      this.logger.log('Checking trial conversions...');
      await this.subscriptionService.checkAndConvertTrials();
      
      // Check and send warnings
      this.logger.log('Checking warnings...');
      await this.subscriptionService.checkAndSendWarnings();
      
      // Check expired subscriptions
      this.logger.log('Checking expired subscriptions...');
      await this.subscriptionService.checkAndHandleExpiredSubscriptions();
      
      this.logger.log('All maintenance tasks completed');
    } catch (error) {
      this.logger.error(`Error in maintenance tasks: ${error.message}`, error.stack);
      throw error;
    }
  }
}

