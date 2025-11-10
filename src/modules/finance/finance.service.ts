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
import { CreateSppPaymentDto } from './dto/create-spp-payment.dto';
import { UpdateSppPaymentDto } from './dto/update-spp-payment.dto';
import { MarkPaymentPaidDto } from './dto/mark-payment-paid.dto';

@Injectable()
export class FinanceService {
  constructor(
    @InjectRepository(SppPayment)
    private sppPaymentsRepository: Repository<SppPayment>,
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

    return await this.sppPaymentsRepository.save(payment);
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

    return {
      data,
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

    return payment;
  }

  async update(
    id: number,
    updateDto: UpdateSppPaymentDto,
    instansiId: number,
  ) {
    const payment = await this.findOne(id, instansiId);

    if (updateDto.dueDate) {
      payment.dueDate = new Date(updateDto.dueDate);
    }

    Object.assign(payment, updateDto);
    return await this.sppPaymentsRepository.save(payment);
  }

  async remove(id: number, instansiId: number) {
    const payment = await this.findOne(id, instansiId);
    await this.sppPaymentsRepository.remove(payment);
    return { message: 'Payment deleted successfully' };
  }

  async markAsPaid(
    id: number,
    markPaidDto: MarkPaymentPaidDto,
    instansiId: number,
    verifiedBy?: number,
  ) {
    const payment = await this.findOne(id, instansiId);

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

    return await this.sppPaymentsRepository.save(payment);
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
}

