import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { XenditService } from './xendit.service';
import { SubscriptionService } from '../subscription.service';
import { PaymentGatewayTransaction } from '../entities/payment-gateway-transaction.entity';
import {
  PaymentGatewayMethod,
  PaymentGatewayStatus,
  PaymentGatewayProvider,
} from '../entities/payment-gateway-transaction.entity';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { TenantSubscription } from '../entities/tenant-subscription.entity';

@Injectable()
export class PaymentGatewayService {
  private readonly logger = new Logger(PaymentGatewayService.name);

  constructor(
    @InjectRepository(PaymentGatewayTransaction)
    private paymentTransactionRepository: Repository<PaymentGatewayTransaction>,
    @InjectRepository(TenantSubscription)
    private subscriptionRepository: Repository<TenantSubscription>,
    private readonly xenditService: XenditService,
    private readonly subscriptionService: SubscriptionService,
  ) {}

  /**
   * Create payment for subscription
   */
  async createPayment(
    tenantId: number,
    createPaymentDto: CreatePaymentDto,
    instansiId: number,
  ) {
    // Verify tenant ID matches
    if (tenantId !== instansiId) {
      throw new BadRequestException('Tenant ID mismatch');
    }

    // Get subscription
    const subscription = await this.subscriptionRepository.findOne({
      where: { tenantId },
      relations: ['subscriptionPlan', 'tenant'],
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    // Check if already paid
    if (subscription.isPaid) {
      throw new BadRequestException('Subscription already paid');
    }

    // Determine amount (use nextBillingAmount or currentBillingAmount)
    const amount = subscription.nextBillingAmount || subscription.currentBillingAmount;

    if (amount <= 0) {
      throw new BadRequestException('No payment amount due');
    }

    // Generate external ID for Xendit (this will be returned in webhook as externalID)
    const externalId = `SUBSCRIPTION_${tenantId}_${Date.now()}`;

    // Create payment based on method
    let paymentResult: any;

    const customer = {
      givenNames: subscription.tenant?.name || subscription.subscriptionPlan?.name || 'Customer',
      email: subscription.tenant?.email || undefined,
    };

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 1); // 24 hours expiry

    switch (createPaymentDto.paymentMethod) {
      case PaymentGatewayMethod.QRIS:
        paymentResult = await this.xenditService.createQRISPayment({
          externalId,
          amount,
          description: `Pembayaran Subscription ${subscription.subscriptionPlan?.name || ''}`,
          customer,
          expiresAt,
        });
        break;

      case PaymentGatewayMethod.VIRTUAL_ACCOUNT:
        if (!createPaymentDto.bankCode) {
          throw new BadRequestException('Bank code is required for Virtual Account');
        }
        paymentResult = await this.xenditService.createVirtualAccountPayment({
          externalId,
          amount,
          description: `Pembayaran Subscription ${subscription.subscriptionPlan?.name || ''}`,
          bankCode: createPaymentDto.bankCode,
          customer,
          expiresAt,
        });
        break;

      case PaymentGatewayMethod.E_WALLET:
        if (!createPaymentDto.channelCode) {
          throw new BadRequestException('Channel code is required for E-Wallet');
        }
        paymentResult = await this.xenditService.createEWalletPayment({
          externalId,
          amount,
          description: `Pembayaran Subscription ${subscription.subscriptionPlan?.name || ''}`,
          channelCode: createPaymentDto.channelCode,
          customer,
          expiresAt,
        });
        break;

      default:
        throw new BadRequestException('Invalid payment method');
    }

    // Save payment transaction
    const paymentTransaction = this.paymentTransactionRepository.create({
      tenantSubscriptionId: subscription.id,
      tenantId,
      provider: PaymentGatewayProvider.XENDIT,
      paymentMethod: createPaymentDto.paymentMethod,
      status: PaymentGatewayStatus.PENDING,
      amount,
      externalId: paymentResult.id,
      paymentUrl: paymentResult.paymentUrl,
      qrCode: paymentResult.qrCode || null,
      virtualAccountNumber: paymentResult.virtualAccountNumber || null,
      eWalletId: paymentResult.eWalletId || null,
      expiresAt: paymentResult.expiresAt,
      metadata: JSON.stringify({
        bankCode: createPaymentDto.bankCode,
        channelCode: createPaymentDto.channelCode,
      }),
    });

    const savedTransaction = await this.paymentTransactionRepository.save(
      paymentTransaction,
    );

    return {
      id: savedTransaction.id,
      paymentMethod: savedTransaction.paymentMethod,
      amount: savedTransaction.amount,
      paymentUrl: savedTransaction.paymentUrl,
      qrCode: savedTransaction.qrCode,
      virtualAccountNumber: savedTransaction.virtualAccountNumber,
      eWalletId: savedTransaction.eWalletId,
      expiresAt: savedTransaction.expiresAt,
      status: savedTransaction.status,
    };
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(
    tenantId: number,
    transactionId: number,
    instansiId: number,
  ) {
    // Verify tenant ID matches
    if (tenantId !== instansiId) {
      throw new BadRequestException('Tenant ID mismatch');
    }

    const transaction = await this.paymentTransactionRepository.findOne({
      where: { id: transactionId, tenantId },
      relations: ['tenantSubscription'],
    });

    if (!transaction) {
      throw new NotFoundException('Payment transaction not found');
    }

    // Sync status from Xendit if still pending
    if (transaction.status === PaymentGatewayStatus.PENDING) {
      try {
        const invoice = await this.xenditService.getInvoice(transaction.externalId);
        const xenditStatus = this.xenditService.mapStatus(invoice.status);

        if (xenditStatus !== transaction.status) {
          transaction.status = xenditStatus as PaymentGatewayStatus;

          if (xenditStatus === 'paid') {
            transaction.paidAt = new Date();
            // Mark subscription as paid
            await this.subscriptionService.markAsPaid(tenantId);
          } else if (xenditStatus === 'expired') {
            transaction.expiresAt = new Date();
          }

          await this.paymentTransactionRepository.save(transaction);
        }
      } catch (error) {
        this.logger.error('Error syncing payment status:', error);
      }
    }

    return {
      id: transaction.id,
      status: transaction.status,
      amount: transaction.amount,
      paymentUrl: transaction.paymentUrl,
      qrCode: transaction.qrCode,
      virtualAccountNumber: transaction.virtualAccountNumber,
      eWalletId: transaction.eWalletId,
      expiresAt: transaction.expiresAt,
      paidAt: transaction.paidAt,
    };
  }

  /**
   * Handle Xendit webhook
   */
  async handleWebhook(payload: any, callbackToken?: string) {
    try {
      // Verify webhook signature if token provided
      if (callbackToken && !this.xenditService.verifyWebhookSignature(payload, callbackToken)) {
        this.logger.warn('Invalid webhook signature');
        return { success: false, message: 'Invalid signature' };
      }

      // Handle invoice webhook
      const event = payload.event || payload.type;
      const invoice = payload.data || payload;

      if (event === 'invoice.paid' || invoice.status === 'PAID') {
        await this.handlePaymentSuccess(invoice);
      } else if (event === 'invoice.expired' || invoice.status === 'EXPIRED') {
        await this.handlePaymentExpired(invoice);
      } else if (event === 'invoice.failed' || invoice.status === 'FAILED') {
        await this.handlePaymentFailed(invoice);
      } else {
        this.logger.log(`Unhandled webhook event: ${event}`);
      }

      return { success: true };
    } catch (error: any) {
      this.logger.error('Error handling webhook:', error);
      return { success: false, message: error.message || 'Unknown error' };
    }
  }

  /**
   * Handle successful payment
   */
  private async handlePaymentSuccess(invoice: any) {
    // Xendit sends externalID in the invoice object, not invoice.id
    // invoice.id is Xendit's internal invoice ID
    // We store Xendit's invoice.id in our externalId field
    const xenditInvoiceId = invoice.id || invoice.invoice_id;
    const externalId = invoice.externalID || invoice.external_id;
    
    if (!xenditInvoiceId && !externalId) {
      this.logger.warn('Invoice ID not found in webhook payload', JSON.stringify(invoice));
      return;
    }

    // Find transaction by Xendit invoice ID (stored in our externalId field)
    const transaction = await this.paymentTransactionRepository.findOne({
      where: xenditInvoiceId ? { externalId: xenditInvoiceId } : { externalId },
      relations: ['tenantSubscription'],
    });

    if (!transaction) {
      this.logger.warn(`Transaction not found for invoice ${externalId}`);
      return;
    }

    if (transaction.status === PaymentGatewayStatus.PAID) {
      this.logger.log(`Transaction ${transaction.id} already marked as paid`);
      return;
    }

    // Update transaction
    transaction.status = PaymentGatewayStatus.PAID;
    transaction.paidAt = new Date();
    await this.paymentTransactionRepository.save(transaction);

    // Mark subscription as paid
    await this.subscriptionService.markAsPaid(transaction.tenantId);

    this.logger.log(
      `Payment successful for subscription ${transaction.tenantSubscriptionId}`,
    );
  }

  /**
   * Handle expired payment
   */
  private async handlePaymentExpired(invoice: any) {
    const xenditInvoiceId = invoice.id || invoice.invoice_id;
    const externalId = invoice.externalID || invoice.external_id;
    
    if (!xenditInvoiceId && !externalId) {
      this.logger.warn('Invoice ID not found in webhook payload');
      return;
    }

    const transaction = await this.paymentTransactionRepository.findOne({
      where: xenditInvoiceId ? { externalId: xenditInvoiceId } : { externalId },
    });

    if (!transaction) {
      this.logger.warn(`Transaction not found for invoice ${externalId}`);
      return;
    }

    transaction.status = PaymentGatewayStatus.EXPIRED;
    await this.paymentTransactionRepository.save(transaction);

    this.logger.log(`Payment expired for transaction ${transaction.id}`);
  }

  /**
   * Handle failed payment
   */
  private async handlePaymentFailed(invoice: any) {
    const xenditInvoiceId = invoice.id || invoice.invoice_id;
    const externalId = invoice.externalID || invoice.external_id;
    
    if (!xenditInvoiceId && !externalId) {
      this.logger.warn('Invoice ID not found in webhook payload');
      return;
    }

    const transaction = await this.paymentTransactionRepository.findOne({
      where: xenditInvoiceId ? { externalId: xenditInvoiceId } : { externalId },
    });

    if (!transaction) {
      this.logger.warn(`Transaction not found for invoice ${externalId}`);
      return;
    }

    transaction.status = PaymentGatewayStatus.FAILED;
    transaction.failureReason = invoice.failure_reason || invoice.failureReason || 'Payment failed';
    await this.paymentTransactionRepository.save(transaction);

    this.logger.log(`Payment failed for transaction ${transaction.id}`);
  }
}

