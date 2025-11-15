import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Xendit from 'xendit-node';

@Injectable()
export class XenditService {
  private readonly logger = new Logger(XenditService.name);
  private invoiceClient: any;
  private readonly secretKey: string;
  private readonly webhookToken: string;

  constructor(private configService: ConfigService) {
    this.secretKey = this.configService.get<string>('XENDIT_SECRET_KEY') || '';
    this.webhookToken = this.configService.get<string>('XENDIT_WEBHOOK_TOKEN') || '';

    if (!this.secretKey) {
      this.logger.warn('XENDIT_SECRET_KEY not found in environment variables');
    }

    // Initialize Xendit client
    const xenditClient = new Xendit({
      secretKey: this.secretKey,
    });

    // Access Invoice from the xenditClient instance
    this.invoiceClient = xenditClient.Invoice;
  }

  /**
   * Create QRIS payment
   */
  async createQRISPayment(data: {
    externalId: string;
    amount: number;
    description: string;
    customer?: {
      givenNames: string;
      email?: string;
      mobileNumber?: string;
    };
    expiresAt?: Date;
  }) {
    try {
      const invoiceData = {
        externalID: data.externalId,
        amount: data.amount,
        description: data.description,
        invoiceDuration: 86400, // 24 hours in seconds
        customer: data.customer,
        currency: 'IDR',
        paymentMethods: ['QRIS'],
        successRedirectURL: this.configService.get<string>('XENDIT_SUCCESS_REDIRECT_URL') || '',
        failureRedirectURL: this.configService.get<string>('XENDIT_FAILURE_REDIRECT_URL') || '',
      };

      if (data.expiresAt) {
        invoiceData.invoiceDuration = Math.floor(
          (data.expiresAt.getTime() - Date.now()) / 1000,
        );
      }

      const invoice = await this.invoiceClient.create(invoiceData);

      return {
        id: invoice.id,
        externalId: invoice.externalID,
        status: invoice.status,
        amount: invoice.amount,
        paymentUrl: invoice.invoiceURL,
        qrCode: invoice.availableBanks?.find((bank: any) => bank.code === 'QRIS')?.qrCode || null,
        expiresAt: invoice.expiryDate ? new Date(invoice.expiryDate) : null,
      };
    } catch (error: any) {
      this.logger.error('Error creating QRIS payment:', error);
      throw new BadRequestException(
        error.message || 'Failed to create QRIS payment',
      );
    }
  }

  /**
   * Create Virtual Account payment
   */
  async createVirtualAccountPayment(data: {
    externalId: string;
    amount: number;
    description: string;
    bankCode: string; // BCA, BNI, BRI, MANDIRI, PERMATA, etc.
    customer?: {
      givenNames: string;
      email?: string;
      mobileNumber?: string;
    };
    expiresAt?: Date;
  }) {
    try {
      const invoiceData = {
        externalID: data.externalId,
        amount: data.amount,
        description: data.description,
        invoiceDuration: 86400, // 24 hours in seconds
        customer: data.customer,
        currency: 'IDR',
        paymentMethods: [`BANK_TRANSFER_${data.bankCode}`],
        successRedirectURL: this.configService.get<string>('XENDIT_SUCCESS_REDIRECT_URL') || '',
        failureRedirectURL: this.configService.get<string>('XENDIT_FAILURE_REDIRECT_URL') || '',
      };

      if (data.expiresAt) {
        invoiceData.invoiceDuration = Math.floor(
          (data.expiresAt.getTime() - Date.now()) / 1000,
        );
      }

      const invoice = await this.invoiceClient.create(invoiceData);

      // Get VA number from available banks
      const vaBank = invoice.availableBanks?.find(
        (bank: any) => bank.code === `BANK_TRANSFER_${data.bankCode}`,
      );

      return {
        id: invoice.id,
        externalId: invoice.externalID,
        status: invoice.status,
        amount: invoice.amount,
        paymentUrl: invoice.invoiceURL,
        virtualAccountNumber: vaBank?.accountNumber || null,
        bankCode: data.bankCode,
        expiresAt: invoice.expiryDate ? new Date(invoice.expiryDate) : null,
      };
    } catch (error: any) {
      this.logger.error('Error creating Virtual Account payment:', error);
      throw new BadRequestException(
        error.message || 'Failed to create Virtual Account payment',
      );
    }
  }

  /**
   * Create E-Wallet payment (OVO, DANA, LinkAja, etc.)
   */
  async createEWalletPayment(data: {
    externalId: string;
    amount: number;
    description: string;
    channelCode: string; // OVO, DANA, LINKAJA, SHOPEEPAY
    customer?: {
      givenNames: string;
      email?: string;
      mobileNumber?: string;
    };
    expiresAt?: Date;
  }) {
    try {
      const invoiceData = {
        externalID: data.externalId,
        amount: data.amount,
        description: data.description,
        invoiceDuration: 86400, // 24 hours in seconds
        customer: data.customer,
        currency: 'IDR',
        paymentMethods: [data.channelCode],
        successRedirectURL: this.configService.get<string>('XENDIT_SUCCESS_REDIRECT_URL') || '',
        failureRedirectURL: this.configService.get<string>('XENDIT_FAILURE_REDIRECT_URL') || '',
      };

      if (data.expiresAt) {
        invoiceData.invoiceDuration = Math.floor(
          (data.expiresAt.getTime() - Date.now()) / 1000,
        );
      }

      const invoice = await this.invoiceClient.create(invoiceData);

      return {
        id: invoice.id,
        externalId: invoice.externalID,
        status: invoice.status,
        amount: invoice.amount,
        paymentUrl: invoice.invoiceURL,
        eWalletId: invoice.id,
        channelCode: data.channelCode,
        expiresAt: invoice.expiryDate ? new Date(invoice.expiryDate) : null,
      };
    } catch (error: any) {
      this.logger.error('Error creating E-Wallet payment:', error);
      throw new BadRequestException(
        error.message || 'Failed to create E-Wallet payment',
      );
    }
  }

  /**
   * Get invoice by ID
   */
  async getInvoice(invoiceId: string) {
    try {
      const invoice = await this.invoiceClient.getById({ invoiceID: invoiceId });
      return invoice;
    } catch (error: any) {
      this.logger.error('Error getting invoice:', error);
      throw new BadRequestException(
        error.message || 'Failed to get invoice',
      );
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload: any, signature: string): boolean {
    // Xendit webhook verification
    // In production, you should verify the webhook token
    if (this.webhookToken && signature !== this.webhookToken) {
      return false;
    }
    return true;
  }

  /**
   * Map Xendit status to our PaymentGatewayStatus
   */
  mapStatus(xenditStatus: string): string {
    const statusMap: Record<string, string> = {
      PENDING: 'pending',
      PAID: 'paid',
      EXPIRED: 'expired',
      FAILED: 'failed',
      CANCELLED: 'cancelled',
    };

    return statusMap[xenditStatus] || 'pending';
  }
}

