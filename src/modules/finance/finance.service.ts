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
import { CreateSppPaymentDto } from './dto/create-spp-payment.dto';
import { UpdateSppPaymentDto } from './dto/update-spp-payment.dto';
import { MarkPaymentPaidDto } from './dto/mark-payment-paid.dto';
import { CreateSavingsDto } from './dto/create-savings.dto';
import { UpdateSavingsDto } from './dto/update-savings.dto';
import { CreateOtherBillDto } from './dto/create-other-bill.dto';
import { UpdateOtherBillDto } from './dto/update-other-bill.dto';
import { CreateIncomeExpenseDto } from './dto/create-income-expense.dto';
import { UpdateIncomeExpenseDto } from './dto/update-income-expense.dto';

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
}

