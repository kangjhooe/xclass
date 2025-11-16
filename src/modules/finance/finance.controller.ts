import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { FinanceService } from './finance.service';
import { CreateSppPaymentDto } from './dto/create-spp-payment.dto';
import { UpdateSppPaymentDto } from './dto/update-spp-payment.dto';
import { MarkPaymentPaidDto } from './dto/mark-payment-paid.dto';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { PaymentStatus } from './entities/spp-payment.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { ModuleAccessGuard } from '../../common/guards/module-access.guard';
import { ModuleAccess } from '../../common/decorators/module-access.decorator';

@Controller('finance')
@UseGuards(JwtAuthGuard, TenantGuard, ModuleAccessGuard)
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Post('spp-payments')
  @ModuleAccess('finance', 'create')
  createPayment(
    @Body() createDto: CreateSppPaymentDto,
    @TenantId() instansiId: number,
    @Query('createdBy') createdBy?: number,
  ) {
    return this.financeService.create(
      createDto,
      instansiId,
      createdBy ? +createdBy : undefined,
    );
  }

  @Get('spp-payments')
  @ModuleAccess('finance', 'view')
  findAllPayments(
    @TenantId() instansiId: number,
    @Query('studentId') studentId?: number,
    @Query('paymentYear') paymentYear?: number,
    @Query('paymentMonth') paymentMonth?: number,
    @Query('paymentStatus') paymentStatus?: PaymentStatus,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.financeService.findAll({
      studentId: studentId ? +studentId : undefined,
      paymentYear: paymentYear ? +paymentYear : undefined,
      paymentMonth: paymentMonth ? +paymentMonth : undefined,
      paymentStatus,
      page: +page,
      limit: +limit,
      instansiId,
    });
  }

  @Get('spp-payments/:id')
  @ModuleAccess('finance', 'view')
  findOnePayment(@Param('id') id: string, @TenantId() instansiId: number) {
    return this.financeService.findOne(+id, instansiId);
  }

  @Patch('spp-payments/:id')
  @ModuleAccess('finance', 'update')
  updatePayment(
    @Param('id') id: string,
    @Body() updateDto: UpdateSppPaymentDto,
    @TenantId() instansiId: number,
  ) {
    return this.financeService.update(+id, updateDto, instansiId);
  }

  @Delete('spp-payments/:id')
  @ModuleAccess('finance', 'delete')
  removePayment(@Param('id') id: string, @TenantId() instansiId: number) {
    return this.financeService.remove(+id, instansiId);
  }

  @Post('spp-payments/:id/mark-paid')
  @ModuleAccess('finance', 'update')
  markAsPaid(
    @Param('id') id: string,
    @Body() markPaidDto: MarkPaymentPaidDto,
    @TenantId() instansiId: number,
    @Query('verifiedBy') verifiedBy?: number,
  ) {
    return this.financeService.markAsPaid(
      +id,
      markPaidDto,
      instansiId,
      verifiedBy ? +verifiedBy : undefined,
    );
  }

  @Get('spp-payments/overdue')
  @ModuleAccess('finance', 'view')
  getOverduePayments(@TenantId() instansiId: number) {
    return this.financeService.getOverduePayments(instansiId);
  }

  @Get('students/:studentId/spp-payments')
  @ModuleAccess('finance', 'view')
  getStudentPayments(
    @Param('studentId') studentId: string,
    @TenantId() instansiId: number,
  ) {
    return this.financeService.getStudentPayments(+studentId, instansiId);
  }

  @Get('statistics')
  @ModuleAccess('finance', 'view')
  getStatistics(
    @TenantId() instansiId: number,
    @Query('year') year?: number,
  ) {
    return this.financeService.getStatistics(
      instansiId,
      year ? +year : undefined,
    );
  }
}

