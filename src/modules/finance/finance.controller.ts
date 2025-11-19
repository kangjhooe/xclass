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
import { CreateSppFrontendDto } from './dto/create-spp-frontend.dto';
import { UpdateSppPaymentDto } from './dto/update-spp-payment.dto';
import { UpdateSppFrontendDto } from './dto/update-spp-frontend.dto';
import { MarkPaymentPaidDto } from './dto/mark-payment-paid.dto';
import { CreateSavingsDto } from './dto/create-savings.dto';
import { UpdateSavingsDto } from './dto/update-savings.dto';
import { CreateOtherBillDto } from './dto/create-other-bill.dto';
import { UpdateOtherBillDto } from './dto/update-other-bill.dto';
import { CreateIncomeExpenseDto } from './dto/create-income-expense.dto';
import { UpdateIncomeExpenseDto } from './dto/update-income-expense.dto';
import { CreateScholarshipDto } from './dto/create-scholarship.dto';
import { UpdateScholarshipDto } from './dto/update-scholarship.dto';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { PaymentStatus, PaymentMethod } from './entities/spp-payment.entity';
import { SavingsTransactionType } from './entities/student-savings.entity';
import { BillCategory } from './entities/other-bill.entity';
import { TransactionType } from './entities/income-expense.entity';
import { ScholarshipType, ScholarshipStatus } from './entities/scholarship.entity';
import { BudgetCategory, BudgetPeriod, BudgetStatus } from './entities/budget.entity';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { ModuleAccessGuard } from '../../common/guards/module-access.guard';
import { ModuleAccess } from '../../common/decorators/module-access.decorator';

@Controller({ path: ['finance', 'tenants/:tenant/finance'] })
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

  @Post('spp')
  @ModuleAccess('finance', 'create')
  createSPP(
    @Body() createDto: CreateSppFrontendDto,
    @TenantId() instansiId: number,
    @Query('createdBy') createdBy?: number,
  ) {
    // Transform frontend format to backend format
    const MONTHS = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const paymentPeriod = `${MONTHS[createDto.month - 1]} ${createDto.year}`;
    
    const backendDto: CreateSppPaymentDto = {
      studentId: createDto.studentId,
      paymentPeriod,
      paymentYear: createDto.year,
      paymentMonth: createDto.month,
      amount: createDto.amount,
      dueDate: createDto.dueDate,
      paymentNotes: createDto.notes,
    };
    
    return this.financeService.create(
      backendDto,
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

  @Get('spp')
  @ModuleAccess('finance', 'view')
  getAllSPP(
    @TenantId() instansiId: number,
    @Query('studentId') studentId?: number,
    @Query('year') year?: number,
    @Query('status') status?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    const paymentStatus = status as PaymentStatus | undefined;
    return this.financeService.findAll({
      studentId: studentId ? +studentId : undefined,
      paymentYear: year ? +year : undefined,
      paymentMonth: undefined,
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

  @Patch('spp/:id/pay')
  @ModuleAccess('finance', 'update')
  paySPP(
    @Param('id') id: string,
    @Body() body: { paidDate: string; paymentMethod?: PaymentMethod; paymentReference?: string; paymentNotes?: string; receiptNumber?: string },
    @TenantId() instansiId: number,
    @Query('verifiedBy') verifiedBy?: number,
  ) {
    const markPaidDto: MarkPaymentPaidDto = {
      paymentMethod: body.paymentMethod,
      paymentReference: body.paymentReference,
      paymentNotes: body.paymentNotes,
      receiptNumber: body.receiptNumber,
    };
    return this.financeService.markAsPaid(
      +id,
      markPaidDto,
      instansiId,
      verifiedBy ? +verifiedBy : undefined,
    );
  }

  @Patch('spp/:id')
  @ModuleAccess('finance', 'update')
  updateSPP(
    @Param('id') id: string,
    @Body() updateDto: UpdateSppFrontendDto,
    @TenantId() instansiId: number,
  ) {
    // Transform frontend format to backend format
    const MONTHS = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    
    const backendDto: UpdateSppPaymentDto = {};
    
    if (updateDto.studentId !== undefined) {
      backendDto.studentId = updateDto.studentId;
    }
    if (updateDto.year !== undefined) {
      backendDto.paymentYear = updateDto.year;
    }
    if (updateDto.month !== undefined) {
      backendDto.paymentMonth = updateDto.month;
    }
    if (updateDto.year !== undefined && updateDto.month !== undefined) {
      backendDto.paymentPeriod = `${MONTHS[updateDto.month - 1]} ${updateDto.year}`;
    }
    if (updateDto.amount !== undefined) {
      backendDto.amount = updateDto.amount;
    }
    if (updateDto.dueDate !== undefined) {
      backendDto.dueDate = updateDto.dueDate;
    }
    if (updateDto.notes !== undefined) {
      backendDto.paymentNotes = updateDto.notes;
    }
    
    return this.financeService.update(+id, backendDto, instansiId);
  }

  @Delete('spp/:id')
  @ModuleAccess('finance', 'delete')
  deleteSPP(@Param('id') id: string, @TenantId() instansiId: number) {
    return this.financeService.remove(+id, instansiId);
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

  // ========== STUDENT SAVINGS ENDPOINTS ==========

  @Post('savings')
  @ModuleAccess('finance', 'create')
  createSavings(
    @Body() createDto: CreateSavingsDto,
    @TenantId() instansiId: number,
    @Query('createdBy') createdBy?: number,
  ) {
    return this.financeService.createSavings(
      createDto,
      instansiId,
      createdBy ? +createdBy : undefined,
    );
  }

  @Get('savings')
  @ModuleAccess('finance', 'view')
  getAllSavings(
    @TenantId() instansiId: number,
    @Query('studentId') studentId?: number,
    @Query('transactionType') transactionType?: SavingsTransactionType,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.financeService.findAllSavings({
      studentId: studentId ? +studentId : undefined,
      transactionType,
      page: +page,
      limit: +limit,
      instansiId,
    });
  }

  @Get('savings/:id')
  @ModuleAccess('finance', 'view')
  getOneSavings(@Param('id') id: string, @TenantId() instansiId: number) {
    return this.financeService.findOneSavings(+id, instansiId);
  }

  @Patch('savings/:id')
  @ModuleAccess('finance', 'update')
  updateSavings(
    @Param('id') id: string,
    @Body() updateDto: UpdateSavingsDto,
    @TenantId() instansiId: number,
  ) {
    return this.financeService.updateSavings(+id, updateDto, instansiId);
  }

  @Delete('savings/:id')
  @ModuleAccess('finance', 'delete')
  deleteSavings(@Param('id') id: string, @TenantId() instansiId: number) {
    return this.financeService.removeSavings(+id, instansiId);
  }

  @Get('students/:studentId/savings/balance')
  @ModuleAccess('finance', 'view')
  getStudentBalance(
    @Param('studentId') studentId: string,
    @TenantId() instansiId: number,
  ) {
    return this.financeService.getStudentBalance(+studentId, instansiId);
  }

  // ========== OTHER BILLS ENDPOINTS ==========

  @Post('other-bills')
  @ModuleAccess('finance', 'create')
  createOtherBill(
    @Body() createDto: CreateOtherBillDto,
    @TenantId() instansiId: number,
    @Query('createdBy') createdBy?: number,
  ) {
    return this.financeService.createOtherBill(
      createDto,
      instansiId,
      createdBy ? +createdBy : undefined,
    );
  }

  @Get('other-bills')
  @ModuleAccess('finance', 'view')
  getAllOtherBills(
    @TenantId() instansiId: number,
    @Query('studentId') studentId?: number,
    @Query('category') category?: BillCategory,
    @Query('status') status?: PaymentStatus,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.financeService.findAllOtherBills({
      studentId: studentId ? +studentId : undefined,
      category,
      paymentStatus: status,
      page: +page,
      limit: +limit,
      instansiId,
    });
  }

  @Get('other-bills/:id')
  @ModuleAccess('finance', 'view')
  getOneOtherBill(@Param('id') id: string, @TenantId() instansiId: number) {
    return this.financeService.findOneOtherBill(+id, instansiId);
  }

  @Patch('other-bills/:id')
  @ModuleAccess('finance', 'update')
  updateOtherBill(
    @Param('id') id: string,
    @Body() updateDto: UpdateOtherBillDto,
    @TenantId() instansiId: number,
  ) {
    return this.financeService.updateOtherBill(+id, updateDto, instansiId);
  }

  @Delete('other-bills/:id')
  @ModuleAccess('finance', 'delete')
  deleteOtherBill(@Param('id') id: string, @TenantId() instansiId: number) {
    return this.financeService.removeOtherBill(+id, instansiId);
  }

  @Patch('other-bills/:id/pay')
  @ModuleAccess('finance', 'update')
  payOtherBill(
    @Param('id') id: string,
    @Body() body: { paidDate: string; paymentMethod?: PaymentMethod; paymentReference?: string; paymentNotes?: string; receiptNumber?: string },
    @TenantId() instansiId: number,
    @Query('verifiedBy') verifiedBy?: number,
  ) {
    const markPaidDto: MarkPaymentPaidDto = {
      paymentMethod: body.paymentMethod,
      paymentReference: body.paymentReference,
      paymentNotes: body.paymentNotes,
      receiptNumber: body.receiptNumber,
    };
    return this.financeService.markOtherBillAsPaid(
      +id,
      markPaidDto,
      instansiId,
      verifiedBy ? +verifiedBy : undefined,
    );
  }

  // ========== INCOME & EXPENSE ENDPOINTS ==========

  @Post('income-expenses')
  @ModuleAccess('finance', 'create')
  createIncomeExpense(
    @Body() createDto: CreateIncomeExpenseDto,
    @TenantId() instansiId: number,
    @Query('createdBy') createdBy?: number,
  ) {
    return this.financeService.createIncomeExpense(
      createDto,
      instansiId,
      createdBy ? +createdBy : undefined,
    );
  }

  @Get('income-expenses')
  @ModuleAccess('finance', 'view')
  getAllIncomeExpenses(
    @TenantId() instansiId: number,
    @Query('type') type?: TransactionType,
    @Query('category') category?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.financeService.findAllIncomeExpenses({
      transactionType: type,
      category,
      startDate,
      endDate,
      page: +page,
      limit: +limit,
      instansiId,
    });
  }

  @Get('income-expenses/summary')
  @ModuleAccess('finance', 'view')
  getIncomeExpenseSummary(
    @TenantId() instansiId: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.financeService.getIncomeExpenseSummary(instansiId, startDate, endDate);
  }

  @Get('income-expenses/:id')
  @ModuleAccess('finance', 'view')
  getOneIncomeExpense(@Param('id') id: string, @TenantId() instansiId: number) {
    return this.financeService.findOneIncomeExpense(+id, instansiId);
  }

  @Patch('income-expenses/:id')
  @ModuleAccess('finance', 'update')
  updateIncomeExpense(
    @Param('id') id: string,
    @Body() updateDto: UpdateIncomeExpenseDto,
    @TenantId() instansiId: number,
  ) {
    return this.financeService.updateIncomeExpense(+id, updateDto, instansiId);
  }

  @Delete('income-expenses/:id')
  @ModuleAccess('finance', 'delete')
  deleteIncomeExpense(@Param('id') id: string, @TenantId() instansiId: number) {
    return this.financeService.removeIncomeExpense(+id, instansiId);
  }

  // ========== SCHOLARSHIP ENDPOINTS ==========

  @Post('scholarships')
  @ModuleAccess('finance', 'create')
  createScholarship(
    @Body() createDto: CreateScholarshipDto,
    @TenantId() instansiId: number,
    @Query('createdBy') createdBy?: number,
  ) {
    return this.financeService.createScholarship(
      createDto,
      instansiId,
      createdBy ? +createdBy : undefined,
    );
  }

  @Get('scholarships')
  @ModuleAccess('finance', 'view')
  getAllScholarships(
    @TenantId() instansiId: number,
    @Query('studentId') studentId?: number,
    @Query('type') type?: ScholarshipType,
    @Query('status') status?: ScholarshipStatus,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.financeService.findAllScholarships({
      studentId: studentId ? +studentId : undefined,
      scholarshipType: type,
      status,
      page: +page,
      limit: +limit,
      instansiId,
    });
  }

  @Get('scholarships/statistics')
  @ModuleAccess('finance', 'view')
  getScholarshipStatistics(@TenantId() instansiId: number) {
    return this.financeService.getScholarshipStatistics(instansiId);
  }

  @Get('scholarships/:id')
  @ModuleAccess('finance', 'view')
  getOneScholarship(@Param('id') id: string, @TenantId() instansiId: number) {
    return this.financeService.findOneScholarship(+id, instansiId);
  }

  @Patch('scholarships/:id')
  @ModuleAccess('finance', 'update')
  updateScholarship(
    @Param('id') id: string,
    @Body() updateDto: UpdateScholarshipDto,
    @TenantId() instansiId: number,
  ) {
    return this.financeService.updateScholarship(+id, updateDto, instansiId);
  }

  @Delete('scholarships/:id')
  @ModuleAccess('finance', 'delete')
  deleteScholarship(@Param('id') id: string, @TenantId() instansiId: number) {
    return this.financeService.removeScholarship(+id, instansiId);
  }

  // ========== FINANCIAL REPORTS ENDPOINTS ==========

  @Get('reports/dashboard')
  @ModuleAccess('finance', 'view')
  getFinancialDashboard(
    @TenantId() instansiId: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.financeService.getFinancialDashboard(instansiId, startDate, endDate);
  }

  @Get('reports/monthly-trends')
  @ModuleAccess('finance', 'view')
  getMonthlyTrends(
    @TenantId() instansiId: number,
    @Query('months') months: number = 12,
  ) {
    return this.financeService.getMonthlyTrends(instansiId, +months);
  }

  @Get('reports/category-breakdown')
  @ModuleAccess('finance', 'view')
  getCategoryBreakdown(
    @TenantId() instansiId: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.financeService.getCategoryBreakdown(instansiId, startDate, endDate);
  }

  @Get('reports/payment-status')
  @ModuleAccess('finance', 'view')
  getPaymentStatusSummary(
    @TenantId() instansiId: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.financeService.getPaymentStatusSummary(instansiId, startDate, endDate);
  }

  // ========== REMINDERS & NOTIFICATIONS ENDPOINTS ==========

  @Get('reminders')
  @ModuleAccess('finance', 'view')
  getPaymentReminders(
    @TenantId() instansiId: number,
    @Query('daysAhead') daysAhead: number = 7,
  ) {
    return this.financeService.getPaymentReminders(instansiId, +daysAhead);
  }

  @Get('reminders/summary')
  @ModuleAccess('finance', 'view')
  getReminderSummary(@TenantId() instansiId: number) {
    return this.financeService.getReminderSummary(instansiId);
  }

  // ========== BUDGET ENDPOINTS ==========

  @Post('budgets')
  @ModuleAccess('finance', 'create')
  createBudget(
    @Body() createDto: CreateBudgetDto,
    @TenantId() instansiId: number,
    @Query('createdBy') createdBy?: number,
  ) {
    return this.financeService.createBudget(
      createDto,
      instansiId,
      createdBy ? +createdBy : undefined,
    );
  }

  @Get('budgets')
  @ModuleAccess('finance', 'view')
  getAllBudgets(
    @TenantId() instansiId: number,
    @Query('category') category?: BudgetCategory,
    @Query('period') period?: BudgetPeriod,
    @Query('year') year?: number,
    @Query('status') status?: BudgetStatus,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.financeService.findAllBudgets({
      category,
      period,
      year: year ? +year : undefined,
      status,
      page: +page,
      limit: +limit,
      instansiId,
    });
  }

  @Get('budgets/summary')
  @ModuleAccess('finance', 'view')
  getBudgetSummary(
    @TenantId() instansiId: number,
    @Query('year') year?: number,
  ) {
    return this.financeService.getBudgetSummary(instansiId, year ? +year : undefined);
  }

  @Get('budgets/:id')
  @ModuleAccess('finance', 'view')
  getOneBudget(@Param('id') id: string, @TenantId() instansiId: number) {
    return this.financeService.findOneBudget(+id, instansiId);
  }

  @Patch('budgets/:id')
  @ModuleAccess('finance', 'update')
  updateBudget(
    @Param('id') id: string,
    @Body() updateDto: UpdateBudgetDto,
    @TenantId() instansiId: number,
  ) {
    return this.financeService.updateBudget(+id, updateDto, instansiId);
  }

  @Patch('budgets/:id/approve')
  @ModuleAccess('finance', 'update')
  approveBudget(
    @Param('id') id: string,
    @TenantId() instansiId: number,
    @Query('approvedBy') approvedBy: number,
  ) {
    return this.financeService.approveBudget(+id, instansiId, +approvedBy);
  }

  @Patch('budgets/:id/update-actual')
  @ModuleAccess('finance', 'update')
  updateBudgetActual(
    @Param('id') id: string,
    @TenantId() instansiId: number,
  ) {
    return this.financeService.updateBudgetActual(+id, instansiId);
  }

  @Delete('budgets/:id')
  @ModuleAccess('finance', 'delete')
  deleteBudget(@Param('id') id: string, @TenantId() instansiId: number) {
    return this.financeService.removeBudget(+id, instansiId);
  }
}

