import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  UseGuards,
  Headers,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { XenditService } from './services/xendit.service';
import { PaymentGatewayService } from './services/payment-gateway.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Controller('subscriptions')
export class PaymentGatewayController {
  constructor(
    private readonly xenditService: XenditService,
    private readonly paymentGatewayService: PaymentGatewayService,
  ) {}

  /**
   * Create payment for subscription
   */
  @Post('tenants/:tenantId/payment')
  @UseGuards(JwtAuthGuard, TenantGuard)
  async createPayment(
    @Param('tenantId') tenantId: string,
    @Body() createPaymentDto: CreatePaymentDto,
    @TenantId() instansiId: number,
  ) {
    return this.paymentGatewayService.createPayment(
      +tenantId,
      createPaymentDto,
      instansiId,
    );
  }

  /**
   * Get payment status
   */
  @Get('tenants/:tenantId/payment/:transactionId')
  @UseGuards(JwtAuthGuard, TenantGuard)
  async getPaymentStatus(
    @Param('tenantId') tenantId: string,
    @Param('transactionId') transactionId: string,
    @TenantId() instansiId: number,
  ) {
    return this.paymentGatewayService.getPaymentStatus(
      +tenantId,
      +transactionId,
      instansiId,
    );
  }

  /**
   * Xendit webhook handler
   */
  @Post('webhooks/xendit')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Body() payload: any,
    @Headers('x-callback-token') callbackToken?: string,
  ) {
    return this.paymentGatewayService.handleWebhook(payload, callbackToken);
  }
}

