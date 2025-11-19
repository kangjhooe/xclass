import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import {
  SppPayment,
  PaymentStatus,
  PaymentMethod,
} from './entities/spp-payment.entity';
import { StudentSavings, SavingsTransactionType } from './entities/student-savings.entity';
import { OtherBill, BillCategory } from './entities/other-bill.entity';
import { IncomeExpense, TransactionType, IncomeCategory, ExpenseCategory } from './entities/income-expense.entity';
import { Scholarship, ScholarshipType, ScholarshipStatus } from './entities/scholarship.entity';
import { Budget, BudgetCategory, BudgetPeriod, BudgetStatus } from './entities/budget.entity';
import { CreateSppPaymentDto } from './dto/create-spp-payment.dto';
import { UpdateSppPaymentDto } from './dto/update-spp-payment.dto';
import { MarkPaymentPaidDto } from './dto/mark-payment-paid.dto';
import { CreateSavingsDto } from './dto/create-savings.dto';
import { UpdateSavingsDto } from './dto/update-savings.dto';
import { CreateOtherBillDto } from './dto/create-other-bill.dto';
import { UpdateOtherBillDto } from './dto/update-other-bill.dto';
import { CreateIncomeExpenseDto } from './dto/create-income-expense.dto';
import { UpdateIncomeExpenseDto } from './dto/update-income-expense.dto';
import { CreateScholarshipDto } from './dto/create-scholarship.dto';
import { UpdateScholarshipDto } from './dto/update-scholarship.dto';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';

const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

@Injectable()
export class FinanceService {
  constructor(
    @InjectRepository(SppPayment)
    private sppPaymentsRepository: Repository<SppPayment>,
    @InjectRepository(StudentSavings)
    private savingsRepository: Repository<StudentSavings>,
    @InjectRepository(OtherBill)
    private otherBillsRepository: Repository<OtherBill>,
    @InjectRepository(IncomeExpense)
    private incomeExpenseRepository: Repository<IncomeExpense>,
    @InjectRepository(Scholarship)
    private scholarshipRepository: Repository<Scholarship>,
    @InjectRepository(Budget)
    private budgetRepository: Repository<Budget>,
  ) {}

  async create(
    createDto: CreateSppPaymentDto,
    instansiId: number,
    createdBy?: number,
  ) {
    // Check if payment already exists for this period
    const existing = await this.sppPaymentsRepository.findOne({
      where: {
        studentId: createDto.studentId,
        paymentYear: createDto.paymentYear,
        paymentMonth: createDto.paymentMonth,
        instansiId,
      },
    });

    if (existing) {
      throw new BadRequestException(
        'Payment already exists for this period',
      );
    }

    const payment = this.sppPaymentsRepository.create({
      ...createDto,
      instansiId,
      dueDate: new Date(createDto.dueDate),
      paymentStatus: createDto.paymentStatus || PaymentStatus.PENDING,
      createdBy,
    });

    const saved = await this.sppPaymentsRepository.save(payment);
    
    // Reload with student relation for transformation
    const paymentWithStudent = await this.sppPaymentsRepository.findOne({
      where: { id: saved.id },
      relations: ['student'],
    });

    if (!paymentWithStudent) {
      throw new NotFoundException('Payment not found after creation');
    }

    // Transform to match frontend expectations
    return {
      id: paymentWithStudent.id,
      studentId: paymentWithStudent.studentId,
      student: paymentWithStudent.student ? {
        id: paymentWithStudent.student.id,
        name: paymentWithStudent.student.name,
      } : undefined,
      month: paymentWithStudent.paymentMonth,
      year: paymentWithStudent.paymentYear,
      amount: parseFloat(paymentWithStudent.amount.toString()),
      dueDate: paymentWithStudent.dueDate.toISOString().split('T')[0],
      paidDate: paymentWithStudent.paidDate ? paymentWithStudent.paidDate.toISOString().split('T')[0] : undefined,
      status: paymentWithStudent.paymentStatus,
      notes: paymentWithStudent.paymentNotes,
      created_at: paymentWithStudent.createdAt,
      updated_at: paymentWithStudent.updatedAt,
    };
  }

  async findAll(filters: {
    studentId?: number;
    paymentYear?: number;
    paymentMonth?: number;
    paymentStatus?: PaymentStatus;
    page?: number;
    limit?: number;
    instansiId: number;
  }) {
    const {
      studentId,
      paymentYear,
      paymentMonth,
      paymentStatus,
      page = 1,
      limit = 20,
      instansiId,
    } = filters;

    const queryBuilder = this.sppPaymentsRepository
      .createQueryBuilder('payment')
      .where('payment.instansiId = :instansiId', { instansiId })
      .leftJoinAndSelect('payment.student', 'student');

    if (studentId) {
      queryBuilder.andWhere('payment.studentId = :studentId', { studentId });
    }

    if (paymentYear) {
      queryBuilder.andWhere('payment.paymentYear = :paymentYear', {
        paymentYear,
      });
    }

    if (paymentMonth) {
      queryBuilder.andWhere('payment.paymentMonth = :paymentMonth', {
        paymentMonth,
      });
    }

    if (paymentStatus) {
      queryBuilder.andWhere('payment.paymentStatus = :paymentStatus', {
        paymentStatus,
      });
    }

    queryBuilder.orderBy('payment.paymentYear', 'DESC')
      .addOrderBy('payment.paymentMonth', 'DESC');

    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    // Transform data to match frontend expectations
    const transformedData = data.map((payment) => ({
      id: payment.id,
      studentId: payment.studentId,
      student: payment.student ? {
        id: payment.student.id,
        name: payment.student.name,
      } : undefined,
      month: payment.paymentMonth,
      year: payment.paymentYear,
      amount: parseFloat(payment.amount.toString()),
      dueDate: payment.dueDate.toISOString().split('T')[0],
      paidDate: payment.paidDate ? payment.paidDate.toISOString().split('T')[0] : undefined,
      status: payment.paymentStatus,
      notes: payment.paymentNotes,
      created_at: payment.createdAt,
      updated_at: payment.updatedAt,
    }));

    return {
      data: transformedData,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number, instansiId: number) {
    const payment = await this.sppPaymentsRepository.findOne({
      where: { id, instansiId },
      relations: ['student'],
    });

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    // Transform to match frontend expectations
    return {
      id: payment.id,
      studentId: payment.studentId,
      student: payment.student ? {
        id: payment.student.id,
        name: payment.student.name,
      } : undefined,
      month: payment.paymentMonth,
      year: payment.paymentYear,
      amount: parseFloat(payment.amount.toString()),
      dueDate: payment.dueDate.toISOString().split('T')[0],
      paidDate: payment.paidDate ? payment.paidDate.toISOString().split('T')[0] : undefined,
      status: payment.paymentStatus,
      notes: payment.paymentNotes,
      created_at: payment.createdAt,
      updated_at: payment.updatedAt,
    };
  }

  async update(
    id: number,
    updateDto: UpdateSppPaymentDto,
    instansiId: number,
  ) {
    const payment = await this.sppPaymentsRepository.findOne({
      where: { id, instansiId },
      relations: ['student'],
    });

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    if (updateDto.dueDate) {
      payment.dueDate = new Date(updateDto.dueDate);
    }

    if (updateDto.paymentYear !== undefined) {
      payment.paymentYear = updateDto.paymentYear;
    }
    if (updateDto.paymentMonth !== undefined) {
      payment.paymentMonth = updateDto.paymentMonth;
    }
    if (updateDto.amount !== undefined) {
      payment.amount = updateDto.amount;
    }
    if (updateDto.paymentNotes !== undefined) {
      payment.paymentNotes = updateDto.paymentNotes;
    }
    if (updateDto.paymentPeriod !== undefined) {
      payment.paymentPeriod = updateDto.paymentPeriod;
    }

    const saved = await this.sppPaymentsRepository.save(payment);

    // Transform to match frontend expectations
    return {
      id: saved.id,
      studentId: saved.studentId,
      student: saved.student ? {
        id: saved.student.id,
        name: saved.student.name,
      } : undefined,
      month: saved.paymentMonth,
      year: saved.paymentYear,
      amount: parseFloat(saved.amount.toString()),
      dueDate: saved.dueDate.toISOString().split('T')[0],
      paidDate: saved.paidDate ? saved.paidDate.toISOString().split('T')[0] : undefined,
      status: saved.paymentStatus,
      notes: saved.paymentNotes,
      created_at: saved.createdAt,
      updated_at: saved.updatedAt,
    };
  }

  async remove(id: number, instansiId: number) {
    const payment = await this.sppPaymentsRepository.findOne({
      where: { id, instansiId },
    });
    
    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }
    
    await this.sppPaymentsRepository.remove(payment);
    return { message: 'Payment deleted successfully' };
  }

  async markAsPaid(
    id: number,
    markPaidDto: MarkPaymentPaidDto,
    instansiId: number,
    verifiedBy?: number,
  ) {
    const payment = await this.sppPaymentsRepository.findOne({
      where: { id, instansiId },
      relations: ['student'],
    });

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    if (payment.paymentStatus === PaymentStatus.PAID) {
      throw new BadRequestException('Payment already marked as paid');
    }

    payment.paymentStatus = PaymentStatus.PAID;
    payment.paidDate = new Date();
    payment.paymentMethod = markPaidDto.paymentMethod || payment.paymentMethod;
    payment.paymentReference = markPaidDto.paymentReference;
    payment.paymentNotes = markPaidDto.paymentNotes;
    payment.receiptNumber = markPaidDto.receiptNumber;

    if (verifiedBy) {
      payment.verifiedBy = verifiedBy;
      payment.verifiedAt = new Date();
    }

    const saved = await this.sppPaymentsRepository.save(payment);

    // Transform to match frontend expectations
    return {
      id: saved.id,
      studentId: saved.studentId,
      student: saved.student ? {
        id: saved.student.id,
        name: saved.student.name,
      } : undefined,
      month: saved.paymentMonth,
      year: saved.paymentYear,
      amount: parseFloat(saved.amount.toString()),
      dueDate: saved.dueDate.toISOString().split('T')[0],
      paidDate: saved.paidDate ? saved.paidDate.toISOString().split('T')[0] : undefined,
      status: saved.paymentStatus,
      notes: saved.paymentNotes,
      created_at: saved.createdAt,
      updated_at: saved.updatedAt,
    };
  }

  async getOverduePayments(instansiId: number) {
    const today = new Date();
    return await this.sppPaymentsRepository.find({
      where: {
        instansiId,
        paymentStatus: PaymentStatus.PENDING,
        dueDate: LessThan(today),
      },
      relations: ['student'],
    });
  }

  async getStudentPayments(studentId: number, instansiId: number) {
    return await this.sppPaymentsRepository.find({
      where: { studentId, instansiId },
      order: { paymentYear: 'DESC', paymentMonth: 'DESC' },
    });
  }

  async getStatistics(instansiId: number, year?: number) {
    const queryBuilder = this.sppPaymentsRepository
      .createQueryBuilder('payment')
      .where('payment.instansiId = :instansiId', { instansiId });

    if (year) {
      queryBuilder.andWhere('payment.paymentYear = :year', { year });
    }

    const total = await queryBuilder.getCount();

    const paid = await queryBuilder
      .andWhere('payment.paymentStatus = :status', {
        status: PaymentStatus.PAID,
      })
      .getCount();

    const pending = await queryBuilder
      .where('payment.instansiId = :instansiId', { instansiId })
      .andWhere('payment.paymentStatus = :status', {
        status: PaymentStatus.PENDING,
      })
      .getCount();

    const totalAmount = await queryBuilder
      .select('SUM(payment.amount)', 'total')
      .where('payment.instansiId = :instansiId', { instansiId })
      .getRawOne();

    const paidAmount = await queryBuilder
      .select('SUM(payment.amount)', 'total')
      .where('payment.instansiId = :instansiId', { instansiId })
      .andWhere('payment.paymentStatus = :status', {
        status: PaymentStatus.PAID,
      })
      .getRawOne();

    return {
      total,
      paid,
      pending,
      overdue: await this.getOverduePayments(instansiId).then((p) => p.length),
      totalAmount: parseFloat(totalAmount?.total || '0'),
      paidAmount: parseFloat(paidAmount?.total || '0'),
    };
  }

  // ========== STUDENT SAVINGS METHODS ==========

  async createSavings(
    createDto: CreateSavingsDto,
    instansiId: number,
    createdBy?: number,
  ) {
    const savings = this.savingsRepository.create({
      ...createDto,
      instansiId,
      createdBy,
    });

    const saved = await this.savingsRepository.save(savings);
    
    // Reload with student relation
    const savingsWithStudent = await this.savingsRepository.findOne({
      where: { id: saved.id },
      relations: ['student'],
    });

    if (!savingsWithStudent) {
      throw new NotFoundException('Savings transaction not found after creation');
    }

    return {
      id: savingsWithStudent.id,
      studentId: savingsWithStudent.studentId,
      student: savingsWithStudent.student ? {
        id: savingsWithStudent.student.id,
        name: savingsWithStudent.student.name,
      } : undefined,
      transactionType: savingsWithStudent.transactionType,
      amount: parseFloat(savingsWithStudent.amount.toString()),
      description: savingsWithStudent.description,
      receiptNumber: savingsWithStudent.receiptNumber,
      created_at: savingsWithStudent.createdAt,
      updated_at: savingsWithStudent.updatedAt,
    };
  }

  async findAllSavings(filters: {
    studentId?: number;
    transactionType?: SavingsTransactionType;
    page?: number;
    limit?: number;
    instansiId: number;
  }) {
    const {
      studentId,
      transactionType,
      page = 1,
      limit = 20,
      instansiId,
    } = filters;

    const queryBuilder = this.savingsRepository
      .createQueryBuilder('savings')
      .where('savings.instansiId = :instansiId', { instansiId })
      .leftJoinAndSelect('savings.student', 'student');

    if (studentId) {
      queryBuilder.andWhere('savings.studentId = :studentId', { studentId });
    }

    if (transactionType) {
      queryBuilder.andWhere('savings.transactionType = :transactionType', { transactionType });
    }

    queryBuilder.orderBy('savings.createdAt', 'DESC');

    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const transformedData = data.map((savings) => ({
      id: savings.id,
      studentId: savings.studentId,
      student: savings.student ? {
        id: savings.student.id,
        name: savings.student.name,
      } : undefined,
      transactionType: savings.transactionType,
      amount: parseFloat(savings.amount.toString()),
      description: savings.description,
      receiptNumber: savings.receiptNumber,
      created_at: savings.createdAt,
      updated_at: savings.updatedAt,
    }));

    return {
      data: transformedData,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getStudentBalance(studentId: number, instansiId: number) {
    const deposits = await this.savingsRepository
      .createQueryBuilder('savings')
      .select('SUM(savings.amount)', 'total')
      .where('savings.studentId = :studentId', { studentId })
      .andWhere('savings.instansiId = :instansiId', { instansiId })
      .andWhere('savings.transactionType = :type', { type: SavingsTransactionType.DEPOSIT })
      .getRawOne();

    const withdrawals = await this.savingsRepository
      .createQueryBuilder('savings')
      .select('SUM(savings.amount)', 'total')
      .where('savings.studentId = :studentId', { studentId })
      .andWhere('savings.instansiId = :instansiId', { instansiId })
      .andWhere('savings.transactionType = :type', { type: SavingsTransactionType.WITHDRAWAL })
      .getRawOne();

    const totalDeposits = parseFloat(deposits?.total || '0');
    const totalWithdrawals = parseFloat(withdrawals?.total || '0');
    const balance = totalDeposits - totalWithdrawals;

    return {
      balance,
      totalDeposits,
      totalWithdrawals,
    };
  }

  async findOneSavings(id: number, instansiId: number) {
    const savings = await this.savingsRepository.findOne({
      where: { id, instansiId },
      relations: ['student'],
    });

    if (!savings) {
      throw new NotFoundException(`Savings transaction with ID ${id} not found`);
    }

    return {
      id: savings.id,
      studentId: savings.studentId,
      student: savings.student ? {
        id: savings.student.id,
        name: savings.student.name,
      } : undefined,
      transactionType: savings.transactionType,
      amount: parseFloat(savings.amount.toString()),
      description: savings.description,
      receiptNumber: savings.receiptNumber,
      created_at: savings.createdAt,
      updated_at: savings.updatedAt,
    };
  }

  async updateSavings(
    id: number,
    updateDto: UpdateSavingsDto,
    instansiId: number,
  ) {
    const savings = await this.savingsRepository.findOne({
      where: { id, instansiId },
      relations: ['student'],
    });

    if (!savings) {
      throw new NotFoundException(`Savings transaction with ID ${id} not found`);
    }

    Object.assign(savings, updateDto);
    const saved = await this.savingsRepository.save(savings);

    return {
      id: saved.id,
      studentId: saved.studentId,
      student: saved.student ? {
        id: saved.student.id,
        name: saved.student.name,
      } : undefined,
      transactionType: saved.transactionType,
      amount: parseFloat(saved.amount.toString()),
      description: saved.description,
      receiptNumber: saved.receiptNumber,
      created_at: saved.createdAt,
      updated_at: saved.updatedAt,
    };
  }

  async removeSavings(id: number, instansiId: number) {
    const savings = await this.savingsRepository.findOne({
      where: { id, instansiId },
    });
    
    if (!savings) {
      throw new NotFoundException(`Savings transaction with ID ${id} not found`);
    }
    
    await this.savingsRepository.remove(savings);
    return { message: 'Savings transaction deleted successfully' };
  }

  // ========== OTHER BILLS METHODS ==========

  async createOtherBill(
    createDto: CreateOtherBillDto,
    instansiId: number,
    createdBy?: number,
  ) {
    const bill = this.otherBillsRepository.create({
      ...createDto,
      instansiId,
      dueDate: new Date(createDto.dueDate),
      paymentStatus: createDto.paymentStatus || PaymentStatus.PENDING,
      createdBy,
    });

    const saved = await this.otherBillsRepository.save(bill);
    
    // Reload with student relation
    const billWithStudent = await this.otherBillsRepository.findOne({
      where: { id: saved.id },
      relations: ['student'],
    });

    if (!billWithStudent) {
      throw new NotFoundException('Bill not found after creation');
    }

    return {
      id: billWithStudent.id,
      studentId: billWithStudent.studentId,
      student: billWithStudent.student ? {
        id: billWithStudent.student.id,
        name: billWithStudent.student.name,
      } : undefined,
      category: billWithStudent.category,
      title: billWithStudent.title,
      description: billWithStudent.description,
      amount: parseFloat(billWithStudent.amount.toString()),
      dueDate: billWithStudent.dueDate.toISOString().split('T')[0],
      paidDate: billWithStudent.paidDate ? billWithStudent.paidDate.toISOString().split('T')[0] : undefined,
      paymentMethod: billWithStudent.paymentMethod,
      paymentStatus: billWithStudent.paymentStatus,
      paymentReference: billWithStudent.paymentReference,
      notes: billWithStudent.notes,
      receiptNumber: billWithStudent.receiptNumber,
      created_at: billWithStudent.createdAt,
      updated_at: billWithStudent.updatedAt,
    };
  }

  async findAllOtherBills(filters: {
    studentId?: number;
    category?: BillCategory;
    paymentStatus?: PaymentStatus;
    page?: number;
    limit?: number;
    instansiId: number;
  }) {
    const {
      studentId,
      category,
      paymentStatus,
      page = 1,
      limit = 20,
      instansiId,
    } = filters;

    const queryBuilder = this.otherBillsRepository
      .createQueryBuilder('bill')
      .where('bill.instansiId = :instansiId', { instansiId })
      .leftJoinAndSelect('bill.student', 'student');

    if (studentId) {
      queryBuilder.andWhere('bill.studentId = :studentId', { studentId });
    }

    if (category) {
      queryBuilder.andWhere('bill.category = :category', { category });
    }

    if (paymentStatus) {
      queryBuilder.andWhere('bill.paymentStatus = :paymentStatus', { paymentStatus });
    }

    queryBuilder.orderBy('bill.dueDate', 'DESC')
      .addOrderBy('bill.createdAt', 'DESC');

    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const transformedData = data.map((bill) => ({
      id: bill.id,
      studentId: bill.studentId,
      student: bill.student ? {
        id: bill.student.id,
        name: bill.student.name,
      } : undefined,
      category: bill.category,
      title: bill.title,
      description: bill.description,
      amount: parseFloat(bill.amount.toString()),
      dueDate: bill.dueDate.toISOString().split('T')[0],
      paidDate: bill.paidDate ? bill.paidDate.toISOString().split('T')[0] : undefined,
      paymentMethod: bill.paymentMethod,
      paymentStatus: bill.paymentStatus,
      paymentReference: bill.paymentReference,
      notes: bill.notes,
      receiptNumber: bill.receiptNumber,
      created_at: bill.createdAt,
      updated_at: bill.updatedAt,
    }));

    return {
      data: transformedData,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOneOtherBill(id: number, instansiId: number) {
    const bill = await this.otherBillsRepository.findOne({
      where: { id, instansiId },
      relations: ['student'],
    });

    if (!bill) {
      throw new NotFoundException(`Bill with ID ${id} not found`);
    }

    return {
      id: bill.id,
      studentId: bill.studentId,
      student: bill.student ? {
        id: bill.student.id,
        name: bill.student.name,
      } : undefined,
      category: bill.category,
      title: bill.title,
      description: bill.description,
      amount: parseFloat(bill.amount.toString()),
      dueDate: bill.dueDate.toISOString().split('T')[0],
      paidDate: bill.paidDate ? bill.paidDate.toISOString().split('T')[0] : undefined,
      paymentMethod: bill.paymentMethod,
      paymentStatus: bill.paymentStatus,
      paymentReference: bill.paymentReference,
      notes: bill.notes,
      receiptNumber: bill.receiptNumber,
      created_at: bill.createdAt,
      updated_at: bill.updatedAt,
    };
  }

  async updateOtherBill(
    id: number,
    updateDto: UpdateOtherBillDto,
    instansiId: number,
  ) {
    const bill = await this.otherBillsRepository.findOne({
      where: { id, instansiId },
      relations: ['student'],
    });

    if (!bill) {
      throw new NotFoundException(`Bill with ID ${id} not found`);
    }

    if (updateDto.dueDate) {
      bill.dueDate = new Date(updateDto.dueDate);
    }

    Object.assign(bill, updateDto);
    const saved = await this.otherBillsRepository.save(bill);

    return {
      id: saved.id,
      studentId: saved.studentId,
      student: saved.student ? {
        id: saved.student.id,
        name: saved.student.name,
      } : undefined,
      category: saved.category,
      title: saved.title,
      description: saved.description,
      amount: parseFloat(saved.amount.toString()),
      dueDate: saved.dueDate.toISOString().split('T')[0],
      paidDate: saved.paidDate ? saved.paidDate.toISOString().split('T')[0] : undefined,
      paymentMethod: saved.paymentMethod,
      paymentStatus: saved.paymentStatus,
      paymentReference: saved.paymentReference,
      notes: saved.notes,
      receiptNumber: saved.receiptNumber,
      created_at: saved.createdAt,
      updated_at: saved.updatedAt,
    };
  }

  async markOtherBillAsPaid(
    id: number,
    markPaidDto: MarkPaymentPaidDto,
    instansiId: number,
    verifiedBy?: number,
  ) {
    const bill = await this.otherBillsRepository.findOne({
      where: { id, instansiId },
      relations: ['student'],
    });

    if (!bill) {
      throw new NotFoundException(`Bill with ID ${id} not found`);
    }

    if (bill.paymentStatus === PaymentStatus.PAID) {
      throw new BadRequestException('Bill already marked as paid');
    }

    bill.paymentStatus = PaymentStatus.PAID;
    bill.paidDate = new Date();
    bill.paymentMethod = markPaidDto.paymentMethod || bill.paymentMethod;
    bill.paymentReference = markPaidDto.paymentReference;
    bill.notes = markPaidDto.paymentNotes || bill.notes;
    bill.receiptNumber = markPaidDto.receiptNumber;

    if (verifiedBy) {
      bill.verifiedBy = verifiedBy;
      bill.verifiedAt = new Date();
    }

    const saved = await this.otherBillsRepository.save(bill);

    return {
      id: saved.id,
      studentId: saved.studentId,
      student: saved.student ? {
        id: saved.student.id,
        name: saved.student.name,
      } : undefined,
      category: saved.category,
      title: saved.title,
      description: saved.description,
      amount: parseFloat(saved.amount.toString()),
      dueDate: saved.dueDate.toISOString().split('T')[0],
      paidDate: saved.paidDate ? saved.paidDate.toISOString().split('T')[0] : undefined,
      paymentMethod: saved.paymentMethod,
      paymentStatus: saved.paymentStatus,
      paymentReference: saved.paymentReference,
      notes: saved.notes,
      receiptNumber: saved.receiptNumber,
      created_at: saved.createdAt,
      updated_at: saved.updatedAt,
    };
  }

  async removeOtherBill(id: number, instansiId: number) {
    const bill = await this.otherBillsRepository.findOne({
      where: { id, instansiId },
    });
    
    if (!bill) {
      throw new NotFoundException(`Bill with ID ${id} not found`);
    }
    
    await this.otherBillsRepository.remove(bill);
    return { message: 'Bill deleted successfully' };
  }

  // ========== INCOME & EXPENSE METHODS ==========

  async createIncomeExpense(
    createDto: CreateIncomeExpenseDto,
    instansiId: number,
    createdBy?: number,
  ) {
    const transaction = this.incomeExpenseRepository.create({
      ...createDto,
      instansiId,
      transactionDate: new Date(createDto.transactionDate),
      createdBy,
    });

    const saved = await this.incomeExpenseRepository.save(transaction);

    return {
      id: saved.id,
      transactionType: saved.transactionType,
      category: saved.category,
      title: saved.title,
      description: saved.description,
      amount: parseFloat(saved.amount.toString()),
      transactionDate: saved.transactionDate.toISOString().split('T')[0],
      referenceNumber: saved.referenceNumber,
      vendor: saved.vendor,
      recipient: saved.recipient,
      notes: saved.notes,
      created_at: saved.createdAt,
      updated_at: saved.updatedAt,
    };
  }

  async findAllIncomeExpenses(filters: {
    transactionType?: TransactionType;
    category?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
    instansiId: number;
  }) {
    const {
      transactionType,
      category,
      startDate,
      endDate,
      page = 1,
      limit = 20,
      instansiId,
    } = filters;

    const queryBuilder = this.incomeExpenseRepository
      .createQueryBuilder('transaction')
      .where('transaction.instansiId = :instansiId', { instansiId });

    if (transactionType) {
      queryBuilder.andWhere('transaction.transactionType = :transactionType', { transactionType });
    }

    if (category) {
      queryBuilder.andWhere('transaction.category = :category', { category });
    }

    if (startDate) {
      queryBuilder.andWhere('transaction.transactionDate >= :startDate', { startDate });
    }

    if (endDate) {
      queryBuilder.andWhere('transaction.transactionDate <= :endDate', { endDate });
    }

    queryBuilder.orderBy('transaction.transactionDate', 'DESC')
      .addOrderBy('transaction.createdAt', 'DESC');

    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const transformedData = data.map((transaction) => ({
      id: transaction.id,
      transactionType: transaction.transactionType,
      category: transaction.category,
      title: transaction.title,
      description: transaction.description,
      amount: parseFloat(transaction.amount.toString()),
      transactionDate: transaction.transactionDate.toISOString().split('T')[0],
      referenceNumber: transaction.referenceNumber,
      vendor: transaction.vendor,
      recipient: transaction.recipient,
      notes: transaction.notes,
      created_at: transaction.createdAt,
      updated_at: transaction.updatedAt,
    }));

    return {
      data: transformedData,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getIncomeExpenseSummary(instansiId: number, startDate?: string, endDate?: string) {
    const queryBuilder = this.incomeExpenseRepository
      .createQueryBuilder('transaction')
      .where('transaction.instansiId = :instansiId', { instansiId });

    if (startDate) {
      queryBuilder.andWhere('transaction.transactionDate >= :startDate', { startDate });
    }

    if (endDate) {
      queryBuilder.andWhere('transaction.transactionDate <= :endDate', { endDate });
    }

    const totalIncome = await queryBuilder
      .clone()
      .select('SUM(transaction.amount)', 'total')
      .andWhere('transaction.transactionType = :type', { type: TransactionType.INCOME })
      .getRawOne();

    const totalExpense = await queryBuilder
      .clone()
      .select('SUM(transaction.amount)', 'total')
      .andWhere('transaction.transactionType = :type', { type: TransactionType.EXPENSE })
      .getRawOne();

    const income = parseFloat(totalIncome?.total || '0');
    const expense = parseFloat(totalExpense?.total || '0');
    const balance = income - expense;

    return {
      totalIncome: income,
      totalExpense: expense,
      balance,
    };
  }

  async findOneIncomeExpense(id: number, instansiId: number) {
    const transaction = await this.incomeExpenseRepository.findOne({
      where: { id, instansiId },
    });

    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }

    return {
      id: transaction.id,
      transactionType: transaction.transactionType,
      category: transaction.category,
      title: transaction.title,
      description: transaction.description,
      amount: parseFloat(transaction.amount.toString()),
      transactionDate: transaction.transactionDate.toISOString().split('T')[0],
      referenceNumber: transaction.referenceNumber,
      vendor: transaction.vendor,
      recipient: transaction.recipient,
      notes: transaction.notes,
      created_at: transaction.createdAt,
      updated_at: transaction.updatedAt,
    };
  }

  async updateIncomeExpense(
    id: number,
    updateDto: UpdateIncomeExpenseDto,
    instansiId: number,
  ) {
    const transaction = await this.incomeExpenseRepository.findOne({
      where: { id, instansiId },
    });

    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }

    if (updateDto.transactionDate) {
      transaction.transactionDate = new Date(updateDto.transactionDate);
    }

    Object.assign(transaction, updateDto);
    const saved = await this.incomeExpenseRepository.save(transaction);

    return {
      id: saved.id,
      transactionType: saved.transactionType,
      category: saved.category,
      title: saved.title,
      description: saved.description,
      amount: parseFloat(saved.amount.toString()),
      transactionDate: saved.transactionDate.toISOString().split('T')[0],
      referenceNumber: saved.referenceNumber,
      vendor: saved.vendor,
      recipient: saved.recipient,
      notes: saved.notes,
      created_at: saved.createdAt,
      updated_at: saved.updatedAt,
    };
  }

  async removeIncomeExpense(id: number, instansiId: number) {
    const transaction = await this.incomeExpenseRepository.findOne({
      where: { id, instansiId },
    });
    
    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }
    
    await this.incomeExpenseRepository.remove(transaction);
    return { message: 'Transaction deleted successfully' };
  }

  // ========== SCHOLARSHIP METHODS ==========

  async createScholarship(
    createDto: CreateScholarshipDto,
    instansiId: number,
    createdBy?: number,
  ) {
    const scholarship = this.scholarshipRepository.create({
      ...createDto,
      instansiId,
      startDate: new Date(createDto.startDate),
      endDate: createDto.endDate ? new Date(createDto.endDate) : null,
      status: createDto.status || ScholarshipStatus.ACTIVE,
      createdBy,
    });

    const saved = await this.scholarshipRepository.save(scholarship);
    
    // Reload with student relation
    const scholarshipWithStudent = await this.scholarshipRepository.findOne({
      where: { id: saved.id },
      relations: ['student'],
    });

    if (!scholarshipWithStudent) {
      throw new NotFoundException('Scholarship not found after creation');
    }

    return {
      id: scholarshipWithStudent.id,
      studentId: scholarshipWithStudent.studentId,
      student: scholarshipWithStudent.student ? {
        id: scholarshipWithStudent.student.id,
        name: scholarshipWithStudent.student.name,
      } : undefined,
      scholarshipType: scholarshipWithStudent.scholarshipType,
      title: scholarshipWithStudent.title,
      description: scholarshipWithStudent.description,
      amount: scholarshipWithStudent.amount ? parseFloat(scholarshipWithStudent.amount.toString()) : null,
      percentage: scholarshipWithStudent.percentage ? parseFloat(scholarshipWithStudent.percentage.toString()) : null,
      startDate: scholarshipWithStudent.startDate.toISOString().split('T')[0],
      endDate: scholarshipWithStudent.endDate ? scholarshipWithStudent.endDate.toISOString().split('T')[0] : null,
      status: scholarshipWithStudent.status,
      sponsor: scholarshipWithStudent.sponsor,
      requirements: scholarshipWithStudent.requirements,
      notes: scholarshipWithStudent.notes,
      created_at: scholarshipWithStudent.createdAt,
      updated_at: scholarshipWithStudent.updatedAt,
    };
  }

  async findAllScholarships(filters: {
    studentId?: number;
    scholarshipType?: ScholarshipType;
    status?: ScholarshipStatus;
    page?: number;
    limit?: number;
    instansiId: number;
  }) {
    const {
      studentId,
      scholarshipType,
      status,
      page = 1,
      limit = 20,
      instansiId,
    } = filters;

    const queryBuilder = this.scholarshipRepository
      .createQueryBuilder('scholarship')
      .where('scholarship.instansiId = :instansiId', { instansiId })
      .leftJoinAndSelect('scholarship.student', 'student');

    if (studentId) {
      queryBuilder.andWhere('scholarship.studentId = :studentId', { studentId });
    }

    if (scholarshipType) {
      queryBuilder.andWhere('scholarship.scholarshipType = :scholarshipType', { scholarshipType });
    }

    if (status) {
      queryBuilder.andWhere('scholarship.status = :status', { status });
    }

    queryBuilder.orderBy('scholarship.startDate', 'DESC')
      .addOrderBy('scholarship.createdAt', 'DESC');

    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const transformedData = data.map((scholarship) => ({
      id: scholarship.id,
      studentId: scholarship.studentId,
      student: scholarship.student ? {
        id: scholarship.student.id,
        name: scholarship.student.name,
      } : undefined,
      scholarshipType: scholarship.scholarshipType,
      title: scholarship.title,
      description: scholarship.description,
      amount: scholarship.amount ? parseFloat(scholarship.amount.toString()) : null,
      percentage: scholarship.percentage ? parseFloat(scholarship.percentage.toString()) : null,
      startDate: scholarship.startDate.toISOString().split('T')[0],
      endDate: scholarship.endDate ? scholarship.endDate.toISOString().split('T')[0] : null,
      status: scholarship.status,
      sponsor: scholarship.sponsor,
      requirements: scholarship.requirements,
      notes: scholarship.notes,
      created_at: scholarship.createdAt,
      updated_at: scholarship.updatedAt,
    }));

    return {
      data: transformedData,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOneScholarship(id: number, instansiId: number) {
    const scholarship = await this.scholarshipRepository.findOne({
      where: { id, instansiId },
      relations: ['student'],
    });

    if (!scholarship) {
      throw new NotFoundException(`Scholarship with ID ${id} not found`);
    }

    return {
      id: scholarship.id,
      studentId: scholarship.studentId,
      student: scholarship.student ? {
        id: scholarship.student.id,
        name: scholarship.student.name,
      } : undefined,
      scholarshipType: scholarship.scholarshipType,
      title: scholarship.title,
      description: scholarship.description,
      amount: scholarship.amount ? parseFloat(scholarship.amount.toString()) : null,
      percentage: scholarship.percentage ? parseFloat(scholarship.percentage.toString()) : null,
      startDate: scholarship.startDate.toISOString().split('T')[0],
      endDate: scholarship.endDate ? scholarship.endDate.toISOString().split('T')[0] : null,
      status: scholarship.status,
      sponsor: scholarship.sponsor,
      requirements: scholarship.requirements,
      notes: scholarship.notes,
      created_at: scholarship.createdAt,
      updated_at: scholarship.updatedAt,
    };
  }

  async updateScholarship(
    id: number,
    updateDto: UpdateScholarshipDto,
    instansiId: number,
  ) {
    const scholarship = await this.scholarshipRepository.findOne({
      where: { id, instansiId },
      relations: ['student'],
    });

    if (!scholarship) {
      throw new NotFoundException(`Scholarship with ID ${id} not found`);
    }

    if (updateDto.startDate) {
      scholarship.startDate = new Date(updateDto.startDate);
    }

    if (updateDto.endDate) {
      scholarship.endDate = updateDto.endDate ? new Date(updateDto.endDate) : null;
    }

    Object.assign(scholarship, updateDto);
    const saved = await this.scholarshipRepository.save(scholarship);

    return {
      id: saved.id,
      studentId: saved.studentId,
      student: saved.student ? {
        id: saved.student.id,
        name: saved.student.name,
      } : undefined,
      scholarshipType: saved.scholarshipType,
      title: saved.title,
      description: saved.description,
      amount: saved.amount ? parseFloat(saved.amount.toString()) : null,
      percentage: saved.percentage ? parseFloat(saved.percentage.toString()) : null,
      startDate: saved.startDate.toISOString().split('T')[0],
      endDate: saved.endDate ? saved.endDate.toISOString().split('T')[0] : null,
      status: saved.status,
      sponsor: saved.sponsor,
      requirements: saved.requirements,
      notes: saved.notes,
      created_at: saved.createdAt,
      updated_at: saved.updatedAt,
    };
  }

  async removeScholarship(id: number, instansiId: number) {
    const scholarship = await this.scholarshipRepository.findOne({
      where: { id, instansiId },
    });
    
    if (!scholarship) {
      throw new NotFoundException(`Scholarship with ID ${id} not found`);
    }
    
    await this.scholarshipRepository.remove(scholarship);
    return { message: 'Scholarship deleted successfully' };
  }

  async getScholarshipStatistics(instansiId: number) {
    const total = await this.scholarshipRepository.count({
      where: { instansiId },
    });

    const active = await this.scholarshipRepository.count({
      where: { instansiId, status: ScholarshipStatus.ACTIVE },
    });

    const expired = await this.scholarshipRepository.count({
      where: { instansiId, status: ScholarshipStatus.EXPIRED },
    });

    const totalAmount = await this.scholarshipRepository
      .createQueryBuilder('scholarship')
      .select('SUM(scholarship.amount)', 'total')
      .where('scholarship.instansiId = :instansiId', { instansiId })
      .andWhere('scholarship.status = :status', { status: ScholarshipStatus.ACTIVE })
      .getRawOne();

    return {
      total,
      active,
      expired,
      cancelled: total - active - expired,
      totalAmount: parseFloat(totalAmount?.total || '0'),
    };
  }

  // ========== FINANCIAL REPORTS METHODS ==========

  async getFinancialDashboard(instansiId: number, startDate?: string, endDate?: string) {
    const dateFilter = startDate && endDate ? { startDate, endDate } : {};

    // SPP Summary
    const sppQuery = this.sppPaymentsRepository
      .createQueryBuilder('spp')
      .where('spp.instansiId = :instansiId', { instansiId });

    if (startDate) {
      sppQuery.andWhere('spp.dueDate >= :startDate', { startDate });
    }
    if (endDate) {
      sppQuery.andWhere('spp.dueDate <= :endDate', { endDate });
    }

    const sppTotal = await sppQuery
      .clone()
      .select('SUM(spp.amount)', 'total')
      .getRawOne();

    const sppPaid = await sppQuery
      .clone()
      .select('SUM(spp.amount)', 'total')
      .andWhere('spp.paymentStatus = :status', { status: PaymentStatus.PAID })
      .getRawOne();

    const sppPending = await sppQuery
      .clone()
      .select('SUM(spp.amount)', 'total')
      .andWhere('spp.paymentStatus = :status', { status: PaymentStatus.PENDING })
      .getRawOne();

    // Other Bills Summary
    const billsQuery = this.otherBillsRepository
      .createQueryBuilder('bill')
      .where('bill.instansiId = :instansiId', { instansiId });

    if (startDate) {
      billsQuery.andWhere('bill.dueDate >= :startDate', { startDate });
    }
    if (endDate) {
      billsQuery.andWhere('bill.dueDate <= :endDate', { endDate });
    }

    const billsTotal = await billsQuery
      .clone()
      .select('SUM(bill.amount)', 'total')
      .getRawOne();

    const billsPaid = await billsQuery
      .clone()
      .select('SUM(bill.amount)', 'total')
      .andWhere('bill.paymentStatus = :status', { status: 'paid' })
      .getRawOne();

    // Savings Summary
    const savingsQuery = this.savingsRepository
      .createQueryBuilder('savings')
      .where('savings.instansiId = :instansiId', { instansiId });

    if (startDate) {
      savingsQuery.andWhere('DATE(savings.createdAt) >= :startDate', { startDate });
    }
    if (endDate) {
      savingsQuery.andWhere('DATE(savings.createdAt) <= :endDate', { endDate });
    }

    const savingsDeposits = await savingsQuery
      .clone()
      .select('SUM(savings.amount)', 'total')
      .andWhere('savings.transactionType = :type', { type: SavingsTransactionType.DEPOSIT })
      .getRawOne();

    const savingsWithdrawals = await savingsQuery
      .clone()
      .select('SUM(savings.amount)', 'total')
      .andWhere('savings.transactionType = :type', { type: SavingsTransactionType.WITHDRAWAL })
      .getRawOne();

    // Income & Expense Summary
    const incomeExpenseSummary = await this.getIncomeExpenseSummary(instansiId, startDate, endDate);

    // Overall Summary
    const totalRevenue = parseFloat(sppPaid?.total || '0') + 
                        parseFloat(billsPaid?.total || '0') + 
                        incomeExpenseSummary.totalIncome;
    
    const totalExpenses = incomeExpenseSummary.totalExpense;
    const netBalance = totalRevenue - totalExpenses;

    return {
      spp: {
        total: parseFloat(sppTotal?.total || '0'),
        paid: parseFloat(sppPaid?.total || '0'),
        pending: parseFloat(sppPending?.total || '0'),
      },
      otherBills: {
        total: parseFloat(billsTotal?.total || '0'),
        paid: parseFloat(billsPaid?.total || '0'),
        pending: parseFloat(billsTotal?.total || '0') - parseFloat(billsPaid?.total || '0'),
      },
      savings: {
        deposits: parseFloat(savingsDeposits?.total || '0'),
        withdrawals: parseFloat(savingsWithdrawals?.total || '0'),
        net: parseFloat(savingsDeposits?.total || '0') - parseFloat(savingsWithdrawals?.total || '0'),
      },
      incomeExpense: incomeExpenseSummary,
      overall: {
        totalRevenue,
        totalExpenses,
        netBalance,
      },
    };
  }

  async getMonthlyTrends(instansiId: number, months: number = 12) {
    const trends = [];
    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const monthSummary = await this.getIncomeExpenseSummary(
        instansiId,
        startOfMonth.toISOString().split('T')[0],
        endOfMonth.toISOString().split('T')[0],
      );

      // SPP for this month
      const sppPaid = await this.sppPaymentsRepository
        .createQueryBuilder('spp')
        .select('SUM(spp.amount)', 'total')
        .where('spp.instansiId = :instansiId', { instansiId })
        .andWhere('spp.paymentStatus = :status', { status: PaymentStatus.PAID })
        .andWhere('MONTH(spp.paidDate) = :month', { month: date.getMonth() + 1 })
        .andWhere('YEAR(spp.paidDate) = :year', { year: date.getFullYear() })
        .getRawOne();

      trends.push({
        month: date.toLocaleString('id-ID', { month: 'long', year: 'numeric' }),
        monthNumber: date.getMonth() + 1,
        year: date.getFullYear(),
        income: monthSummary.totalIncome + parseFloat(sppPaid?.total || '0'),
        expense: monthSummary.totalExpense,
        balance: monthSummary.totalIncome + parseFloat(sppPaid?.total || '0') - monthSummary.totalExpense,
      });
    }

    return trends;
  }

  async getCategoryBreakdown(instansiId: number, startDate?: string, endDate?: string) {
    const queryBuilder = this.incomeExpenseRepository
      .createQueryBuilder('transaction')
      .where('transaction.instansiId = :instansiId', { instansiId });

    if (startDate) {
      queryBuilder.andWhere('transaction.transactionDate >= :startDate', { startDate });
    }
    if (endDate) {
      queryBuilder.andWhere('transaction.transactionDate <= :endDate', { endDate });
    }

    // Income by category
    const incomeByCategory = await queryBuilder
      .clone()
      .select('transaction.category', 'category')
      .addSelect('SUM(transaction.amount)', 'total')
      .andWhere('transaction.transactionType = :type', { type: TransactionType.INCOME })
      .groupBy('transaction.category')
      .getRawMany();

    // Expense by category
    const expenseByCategory = await queryBuilder
      .clone()
      .select('transaction.category', 'category')
      .addSelect('SUM(transaction.amount)', 'total')
      .andWhere('transaction.transactionType = :type', { type: TransactionType.EXPENSE })
      .groupBy('transaction.category')
      .getRawMany();

    return {
      income: incomeByCategory.map((item) => ({
        category: item.category,
        amount: parseFloat(item.total || '0'),
      })),
      expense: expenseByCategory.map((item) => ({
        category: item.category,
        amount: parseFloat(item.total || '0'),
      })),
    };
  }

  async getPaymentStatusSummary(instansiId: number, startDate?: string, endDate?: string) {
    const sppQuery = this.sppPaymentsRepository
      .createQueryBuilder('spp')
      .where('spp.instansiId = :instansiId', { instansiId });

    if (startDate) {
      sppQuery.andWhere('spp.dueDate >= :startDate', { startDate });
    }
    if (endDate) {
      sppQuery.andWhere('spp.dueDate <= :endDate', { endDate });
    }

    const sppStatus = await sppQuery
      .select('spp.paymentStatus', 'status')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(spp.amount)', 'total')
      .groupBy('spp.paymentStatus')
      .getRawMany();

    const billsQuery = this.otherBillsRepository
      .createQueryBuilder('bill')
      .where('bill.instansiId = :instansiId', { instansiId });

    if (startDate) {
      billsQuery.andWhere('bill.dueDate >= :startDate', { startDate });
    }
    if (endDate) {
      billsQuery.andWhere('bill.dueDate <= :endDate', { endDate });
    }

    const billsStatus = await billsQuery
      .select('bill.paymentStatus', 'status')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(bill.amount)', 'total')
      .groupBy('bill.paymentStatus')
      .getRawMany();

    return {
      spp: sppStatus.map((item) => ({
        status: item.status,
        count: parseInt(item.count || '0'),
        total: parseFloat(item.total || '0'),
      })),
      otherBills: billsStatus.map((item) => ({
        status: item.status,
        count: parseInt(item.count || '0'),
        total: parseFloat(item.total || '0'),
      })),
    };
  }

  // ========== REMINDERS & NOTIFICATIONS METHODS ==========

  async getPaymentReminders(instansiId: number, daysAhead: number = 7) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + daysAhead);
    futureDate.setHours(23, 59, 59, 999);

    // SPP yang akan jatuh tempo
    const upcomingSpp = await this.sppPaymentsRepository
      .createQueryBuilder('spp')
      .leftJoinAndSelect('spp.student', 'student')
      .where('spp.instansiId = :instansiId', { instansiId })
      .andWhere('spp.paymentStatus = :status', { status: PaymentStatus.PENDING })
      .andWhere('spp.dueDate >= :today', { today: today.toISOString().split('T')[0] })
      .andWhere('spp.dueDate <= :futureDate', { futureDate: futureDate.toISOString().split('T')[0] })
      .orderBy('spp.dueDate', 'ASC')
      .getMany();

    // SPP yang sudah overdue
    const overdueSpp = await this.sppPaymentsRepository
      .createQueryBuilder('spp')
      .leftJoinAndSelect('spp.student', 'student')
      .where('spp.instansiId = :instansiId', { instansiId })
      .andWhere('spp.paymentStatus = :status', { status: PaymentStatus.PENDING })
      .andWhere('spp.dueDate < :today', { today: today.toISOString().split('T')[0] })
      .orderBy('spp.dueDate', 'ASC')
      .getMany();

    // Tagihan lainnya yang akan jatuh tempo
    const upcomingBills = await this.otherBillsRepository
      .createQueryBuilder('bill')
      .leftJoinAndSelect('bill.student', 'student')
      .where('bill.instansiId = :instansiId', { instansiId })
      .andWhere('bill.paymentStatus = :status', { status: 'pending' })
      .andWhere('bill.dueDate >= :today', { today: today.toISOString().split('T')[0] })
      .andWhere('bill.dueDate <= :futureDate', { futureDate: futureDate.toISOString().split('T')[0] })
      .orderBy('bill.dueDate', 'ASC')
      .getMany();

    // Tagihan lainnya yang sudah overdue
    const overdueBills = await this.otherBillsRepository
      .createQueryBuilder('bill')
      .leftJoinAndSelect('bill.student', 'student')
      .where('bill.instansiId = :instansiId', { instansiId })
      .andWhere('bill.paymentStatus = :status', { status: 'pending' })
      .andWhere('bill.dueDate < :today', { today: today.toISOString().split('T')[0] })
      .orderBy('bill.dueDate', 'ASC')
      .getMany();

    const transformSpp = (spp: any[]) => spp.map((item) => ({
      id: item.id,
      type: 'spp',
      studentId: item.studentId,
      student: item.student ? {
        id: item.student.id,
        name: item.student.name,
      } : undefined,
      title: `SPP ${MONTHS[item.paymentMonth - 1]} ${item.paymentYear}`,
      amount: parseFloat(item.amount.toString()),
      dueDate: item.dueDate.toISOString().split('T')[0],
      isOverdue: new Date(item.dueDate) < today,
      daysUntilDue: Math.ceil((new Date(item.dueDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)),
    }));

    const transformBills = (bills: any[]) => bills.map((item) => ({
      id: item.id,
      type: 'other-bill',
      studentId: item.studentId,
      student: item.student ? {
        id: item.student.id,
        name: item.student.name,
      } : undefined,
      title: item.title,
      amount: parseFloat(item.amount.toString()),
      dueDate: item.dueDate.toISOString().split('T')[0],
      isOverdue: new Date(item.dueDate) < today,
      daysUntilDue: Math.ceil((new Date(item.dueDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)),
    }));

    return {
      upcoming: [
        ...transformSpp(upcomingSpp),
        ...transformBills(upcomingBills),
      ].sort((a, b) => {
        const dateA = new Date(a.dueDate).getTime();
        const dateB = new Date(b.dueDate).getTime();
        return dateA - dateB;
      }),
      overdue: [
        ...transformSpp(overdueSpp),
        ...transformBills(overdueBills),
      ].sort((a, b) => {
        const dateA = new Date(a.dueDate).getTime();
        const dateB = new Date(b.dueDate).getTime();
        return dateA - dateB;
      }),
      summary: {
        upcomingCount: upcomingSpp.length + upcomingBills.length,
        overdueCount: overdueSpp.length + overdueBills.length,
        upcomingTotal: upcomingSpp.reduce((sum, item) => sum + parseFloat(item.amount.toString()), 0) +
                      upcomingBills.reduce((sum, item) => sum + parseFloat(item.amount.toString()), 0),
        overdueTotal: overdueSpp.reduce((sum, item) => sum + parseFloat(item.amount.toString()), 0) +
                     overdueBills.reduce((sum, item) => sum + parseFloat(item.amount.toString()), 0),
      },
    };
  }

  async getReminderSummary(instansiId: number) {
    const reminders = await this.getPaymentReminders(instansiId, 7);
    
    return {
      totalReminders: reminders.upcoming.length + reminders.overdue.length,
      overdueCount: reminders.overdue.length,
      upcomingCount: reminders.upcoming.length,
      totalAmount: reminders.summary.upcomingTotal + reminders.summary.overdueTotal,
    };
}

  // ========== BUDGET METHODS ==========

  async createBudget(
    createDto: CreateBudgetDto,
    instansiId: number,
    createdBy?: number,
  ) {
    const budget = this.budgetRepository.create({
      ...createDto,
      instansiId,
      startDate: new Date(createDto.startDate),
      endDate: new Date(createDto.endDate),
      status: createDto.status || BudgetStatus.DRAFT,
      actualAmount: 0,
      createdBy,
    });

    const saved = await this.budgetRepository.save(budget);
    
    return {
      id: saved.id,
      category: saved.category,
      title: saved.title,
      description: saved.description,
      plannedAmount: parseFloat(saved.plannedAmount.toString()),
      actualAmount: parseFloat(saved.actualAmount.toString()),
      period: saved.period,
      periodValue: saved.periodValue,
      year: saved.year,
      startDate: saved.startDate.toISOString().split('T')[0],
      endDate: saved.endDate.toISOString().split('T')[0],
      status: saved.status,
      notes: saved.notes,
      approvedBy: saved.approvedBy,
      approvedAt: saved.approvedAt ? saved.approvedAt.toISOString() : null,
      created_at: saved.createdAt,
      updated_at: saved.updatedAt,
    };
  }

  async findAllBudgets(filters: {
    category?: BudgetCategory;
    period?: BudgetPeriod;
    year?: number;
    status?: BudgetStatus;
    page?: number;
    limit?: number;
    instansiId: number;
  }) {
    const {
      category,
      period,
      year,
      status,
      page = 1,
      limit = 20,
      instansiId,
    } = filters;

    const queryBuilder = this.budgetRepository
      .createQueryBuilder('budget')
      .where('budget.instansiId = :instansiId', { instansiId });

    if (category) {
      queryBuilder.andWhere('budget.category = :category', { category });
    }

    if (period) {
      queryBuilder.andWhere('budget.period = :period', { period });
    }

    if (year) {
      queryBuilder.andWhere('budget.year = :year', { year });
    }

    if (status) {
      queryBuilder.andWhere('budget.status = :status', { status });
    }

    queryBuilder.orderBy('budget.year', 'DESC')
      .addOrderBy('budget.periodValue', 'DESC')
      .addOrderBy('budget.createdAt', 'DESC');

    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const transformedData = data.map((budget) => ({
      id: budget.id,
      category: budget.category,
      title: budget.title,
      description: budget.description,
      plannedAmount: parseFloat(budget.plannedAmount.toString()),
      actualAmount: parseFloat(budget.actualAmount.toString()),
      period: budget.period,
      periodValue: budget.periodValue,
      year: budget.year,
      startDate: budget.startDate.toISOString().split('T')[0],
      endDate: budget.endDate.toISOString().split('T')[0],
      status: budget.status,
      notes: budget.notes,
      approvedBy: budget.approvedBy,
      approvedAt: budget.approvedAt ? budget.approvedAt.toISOString() : null,
      created_at: budget.createdAt,
      updated_at: budget.updatedAt,
    }));

    return {
      data: transformedData,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOneBudget(id: number, instansiId: number) {
    const budget = await this.budgetRepository.findOne({
      where: { id, instansiId },
    });

    if (!budget) {
      throw new NotFoundException(`Budget with ID ${id} not found`);
    }

    return {
      id: budget.id,
      category: budget.category,
      title: budget.title,
      description: budget.description,
      plannedAmount: parseFloat(budget.plannedAmount.toString()),
      actualAmount: parseFloat(budget.actualAmount.toString()),
      period: budget.period,
      periodValue: budget.periodValue,
      year: budget.year,
      startDate: budget.startDate.toISOString().split('T')[0],
      endDate: budget.endDate.toISOString().split('T')[0],
      status: budget.status,
      notes: budget.notes,
      approvedBy: budget.approvedBy,
      approvedAt: budget.approvedAt ? budget.approvedAt.toISOString() : null,
      created_at: budget.createdAt,
      updated_at: budget.updatedAt,
    };
  }

  async updateBudget(
    id: number,
    updateDto: UpdateBudgetDto,
    instansiId: number,
  ) {
    const budget = await this.budgetRepository.findOne({
      where: { id, instansiId },
    });

    if (!budget) {
      throw new NotFoundException(`Budget with ID ${id} not found`);
    }

    if (updateDto.startDate) {
      budget.startDate = new Date(updateDto.startDate);
    }

    if (updateDto.endDate) {
      budget.endDate = new Date(updateDto.endDate);
    }

    Object.assign(budget, updateDto);
    const saved = await this.budgetRepository.save(budget);

    return {
      id: saved.id,
      category: saved.category,
      title: saved.title,
      description: saved.description,
      plannedAmount: parseFloat(saved.plannedAmount.toString()),
      actualAmount: parseFloat(saved.actualAmount.toString()),
      period: saved.period,
      periodValue: saved.periodValue,
      year: saved.year,
      startDate: saved.startDate.toISOString().split('T')[0],
      endDate: saved.endDate.toISOString().split('T')[0],
      status: saved.status,
      notes: saved.notes,
      approvedBy: saved.approvedBy,
      approvedAt: saved.approvedAt ? saved.approvedAt.toISOString() : null,
      created_at: saved.createdAt,
      updated_at: saved.updatedAt,
    };
  }

  async removeBudget(id: number, instansiId: number) {
    const budget = await this.budgetRepository.findOne({
      where: { id, instansiId },
    });
    
    if (!budget) {
      throw new NotFoundException(`Budget with ID ${id} not found`);
    }
    
    await this.budgetRepository.remove(budget);
    return { message: 'Budget deleted successfully' };
  }

  async approveBudget(id: number, instansiId: number, approvedBy: number) {
    const budget = await this.budgetRepository.findOne({
      where: { id, instansiId },
    });

    if (!budget) {
      throw new NotFoundException(`Budget with ID ${id} not found`);
    }

    budget.status = BudgetStatus.APPROVED;
    budget.approvedBy = approvedBy;
    budget.approvedAt = new Date();

    const saved = await this.budgetRepository.save(budget);

    return {
      id: saved.id,
      category: saved.category,
      title: saved.title,
      status: saved.status,
      approvedBy: saved.approvedBy,
      approvedAt: saved.approvedAt.toISOString(),
    };
  }

  async updateBudgetActual(id: number, instansiId: number) {
    const budget = await this.budgetRepository.findOne({
      where: { id, instansiId },
    });

    if (!budget) {
      throw new NotFoundException(`Budget with ID ${id} not found`);
    }

    // Calculate actual amount from income-expense transactions
    const actualExpenses = await this.incomeExpenseRepository
      .createQueryBuilder('transaction')
      .select('SUM(transaction.amount)', 'total')
      .where('transaction.instansiId = :instansiId', { instansiId })
      .andWhere('transaction.transactionType = :type', { type: TransactionType.EXPENSE })
      .andWhere('transaction.category = :category', { category: budget.category })
      .andWhere('transaction.transactionDate >= :startDate', { startDate: budget.startDate.toISOString().split('T')[0] })
      .andWhere('transaction.transactionDate <= :endDate', { endDate: budget.endDate.toISOString().split('T')[0] })
      .getRawOne();

    budget.actualAmount = parseFloat(actualExpenses?.total || '0');
    const saved = await this.budgetRepository.save(budget);

    return {
      id: saved.id,
      plannedAmount: parseFloat(saved.plannedAmount.toString()),
      actualAmount: parseFloat(saved.actualAmount.toString()),
      remaining: parseFloat(saved.plannedAmount.toString()) - parseFloat(saved.actualAmount.toString()),
      utilizationPercentage: saved.plannedAmount > 0
        ? (parseFloat(saved.actualAmount.toString()) / parseFloat(saved.plannedAmount.toString())) * 100
        : 0,
    };
  }

  async getBudgetSummary(instansiId: number, year?: number) {
    const queryBuilder = this.budgetRepository
      .createQueryBuilder('budget')
      .where('budget.instansiId = :instansiId', { instansiId });

    if (year) {
      queryBuilder.andWhere('budget.year = :year', { year });
    }

    const budgets = await queryBuilder.getMany();

    const totalPlanned = budgets.reduce((sum, b) => sum + parseFloat(b.plannedAmount.toString()), 0);
    const totalActual = budgets.reduce((sum, b) => sum + parseFloat(b.actualAmount.toString()), 0);
    const totalRemaining = totalPlanned - totalActual;

    const byCategory = budgets.reduce((acc, budget) => {
      const category = budget.category;
      if (!acc[category]) {
        acc[category] = { planned: 0, actual: 0 };
      }
      acc[category].planned += parseFloat(budget.plannedAmount.toString());
      acc[category].actual += parseFloat(budget.actualAmount.toString());
      return acc;
    }, {} as Record<string, { planned: number; actual: number }>);

    return {
      totalPlanned,
      totalActual,
      totalRemaining,
      utilizationPercentage: totalPlanned > 0 ? (totalActual / totalPlanned) * 100 : 0,
      byCategory: Object.entries(byCategory).map(([category, amounts]) => ({
        category,
        planned: amounts.planned,
        actual: amounts.actual,
        remaining: amounts.planned - amounts.actual,
        utilizationPercentage: amounts.planned > 0 ? (amounts.actual / amounts.planned) * 100 : 0,
      })),
    };
  }
}
