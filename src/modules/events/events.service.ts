import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual, LessThanOrEqual, DataSource } from 'typeorm';
import { Event, EventStatus } from './entities/event.entity';
import {
  EventRegistration,
  RegistrationStatus,
} from './entities/event-registration.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { CreateEventRegistrationDto } from './dto/create-event-registration.dto';
import { IncomeExpense, TransactionType, IncomeCategory } from '../finance/entities/income-expense.entity';
import { FinanceService } from '../finance/finance.service';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private eventsRepository: Repository<Event>,
    @InjectRepository(EventRegistration)
    private registrationsRepository: Repository<EventRegistration>,
    @InjectRepository(IncomeExpense)
    private incomeExpenseRepository: Repository<IncomeExpense>,
    private financeService: FinanceService,
    private dataSource: DataSource,
  ) {}

  // ========== Events ==========
  async create(createDto: CreateEventDto, instansiId: number, createdBy?: number) {
    const startDate = new Date(createDto.startDate);
    const endDate = new Date(createDto.endDate);

    // Validate endDate is after startDate
    if (endDate < startDate) {
      throw new BadRequestException('End date must be after start date');
    }

    // Validate registrationDeadline is before startDate
    if (createDto.registrationDeadline) {
      const deadline = new Date(createDto.registrationDeadline);
      if (deadline >= startDate) {
        throw new BadRequestException('Registration deadline must be before event start date');
      }
    }

    // Validate maxParticipants if registrationRequired
    if (createDto.registrationRequired && createDto.maxParticipants && createDto.maxParticipants < 1) {
      throw new BadRequestException('Max participants must be at least 1 when registration is required');
    }

    const event = this.eventsRepository.create({
      ...createDto,
      instansiId,
      createdBy,
      startDate,
      endDate,
      startTime: createDto.startTime ? new Date(createDto.startTime) : null,
      endTime: createDto.endTime ? new Date(createDto.endTime) : null,
      registrationDeadline: createDto.registrationDeadline
        ? new Date(createDto.registrationDeadline)
        : null,
      status: createDto.status || EventStatus.DRAFT,
      registrationRequired: createDto.registrationRequired ?? false,
      isPublic: createDto.isPublic ?? false,
    });

    return await this.eventsRepository.save(event);
  }

  async findAll(filters: {
    search?: string;
    eventType?: string;
    category?: string;
    status?: EventStatus;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
    instansiId: number;
  }) {
    const {
      search,
      eventType,
      category,
      status,
      startDate,
      endDate,
      page = 1,
      limit = 20,
      instansiId,
    } = filters;

    const queryBuilder = this.eventsRepository
      .createQueryBuilder('event')
      .where('event.instansiId = :instansiId', { instansiId })
      .leftJoinAndSelect('event.registrations', 'registrations');

    if (search) {
      queryBuilder.andWhere(
        '(event.title LIKE :search OR event.description LIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (eventType) {
      queryBuilder.andWhere('event.eventType = :eventType', { eventType });
    }

    if (category) {
      queryBuilder.andWhere('event.category = :category', { category });
    }

    if (status) {
      queryBuilder.andWhere('event.status = :status', { status });
    }

    if (startDate) {
      queryBuilder.andWhere('event.startDate >= :startDate', { startDate });
    }

    if (endDate) {
      queryBuilder.andWhere('event.endDate <= :endDate', { endDate });
    }

    queryBuilder.orderBy('event.startDate', 'ASC');

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
    const event = await this.eventsRepository.findOne({
      where: { id, instansiId },
      relations: [
        'registrations',
        'registrations.student',
        'registrations.teacher',
        'registrations.incomeExpense',
      ],
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    return event;
  }

  async update(id: number, updateDto: UpdateEventDto, instansiId: number) {
    const event = await this.findOne(id, instansiId);

    // Check if event has registrations and trying to change critical fields
    const hasRegistrations = await this.registrationsRepository.count({
      where: { eventId: id, instansiId },
    });

    if (hasRegistrations > 0) {
      // Prevent changing cost if there are paid registrations
      if (updateDto.cost !== undefined && updateDto.cost !== event.cost) {
        const paidCount = await this.registrationsRepository.count({
          where: {
            eventId: id,
            instansiId,
            paymentStatus: true,
          },
        });
        if (paidCount > 0) {
          throw new BadRequestException('Cannot change cost for event with paid registrations');
        }
      }

      // Prevent changing maxParticipants to less than confirmed registrations
      if (updateDto.maxParticipants !== undefined && updateDto.maxParticipants < event.maxParticipants) {
        const confirmedCount = await this.registrationsRepository.count({
          where: {
            eventId: id,
            instansiId,
            status: RegistrationStatus.CONFIRMED,
          },
        });
        if (updateDto.maxParticipants < confirmedCount) {
          throw new BadRequestException(
            `Cannot set max participants to ${updateDto.maxParticipants}. There are already ${confirmedCount} confirmed registrations`,
          );
        }
      }
    }

    if (updateDto.startDate) {
      event.startDate = new Date(updateDto.startDate);
    }
    if (updateDto.endDate) {
      event.endDate = new Date(updateDto.endDate);
    }
    if (updateDto.startTime) {
      event.startTime = new Date(updateDto.startTime);
    }
    if (updateDto.endTime) {
      event.endTime = new Date(updateDto.endTime);
    }
    if (updateDto.registrationDeadline) {
      event.registrationDeadline = new Date(updateDto.registrationDeadline);
    }

    Object.assign(event, updateDto);
    return await this.eventsRepository.save(event);
  }

  async remove(id: number, instansiId: number) {
    const event = await this.findOne(id, instansiId);

    // Check if event has registrations
    const registrationsCount = await this.registrationsRepository.count({
      where: { eventId: id, instansiId },
    });

    if (registrationsCount > 0) {
      // Check if there are paid registrations
      const paidCount = await this.registrationsRepository.count({
        where: {
          eventId: id,
          instansiId,
          paymentStatus: true,
        },
      });

      if (paidCount > 0) {
        throw new BadRequestException(
          'Cannot delete event with paid registrations. Please cancel the event instead.',
        );
      }

      // Soft delete: cancel the event instead of deleting
      event.status = EventStatus.CANCELLED;
      return await this.eventsRepository.save(event);
    }

    await this.eventsRepository.remove(event);
    return { message: 'Event deleted successfully' };
  }

  // ========== Event Registrations ==========
  async createRegistration(
    createDto: CreateEventRegistrationDto,
    instansiId: number,
    createdBy?: number,
  ) {
    // Validate at least one participant
    if (!createDto.studentId && !createDto.teacherId && !createDto.parentId && !createDto.staffId) {
      throw new BadRequestException('At least one participant (student, teacher, parent, or staff) is required');
    }

    const event = await this.findOne(createDto.eventId, instansiId);

    // Check event status
    if (event.status === EventStatus.CANCELLED) {
      throw new BadRequestException('Cannot register for a cancelled event');
    }

    if (event.status === EventStatus.COMPLETED) {
      throw new BadRequestException('Cannot register for a completed event');
    }

    // Check if registration is required
    if (event.registrationRequired) {
      if (event.registrationDeadline && new Date() > event.registrationDeadline) {
        throw new BadRequestException('Registration deadline has passed');
      }

      // Check max participants
      const confirmedCount = await this.registrationsRepository.count({
        where: {
          eventId: event.id,
          status: RegistrationStatus.CONFIRMED,
          instansiId,
        },
      });

      if (event.maxParticipants && confirmedCount >= event.maxParticipants) {
        throw new BadRequestException('Event is full');
      }
    }

    // Check if already registered
    const existing = await this.registrationsRepository.findOne({
      where: {
        eventId: event.id,
        instansiId,
        studentId: createDto.studentId || null,
        teacherId: createDto.teacherId || null,
        parentId: createDto.parentId || null,
        staffId: createDto.staffId || null,
      },
    });

    if (existing && existing.status !== RegistrationStatus.CANCELLED) {
      throw new BadRequestException('Already registered for this event');
    }

    const registration = this.registrationsRepository.create({
      ...createDto,
      instansiId,
      createdBy,
      registrationDate: new Date(),
      status: createDto.status || RegistrationStatus.PENDING,
      paymentAmount: createDto.paymentAmount || event.cost || 0,
    });

    return await this.registrationsRepository.save(registration);
  }

  async findAllRegistrations(filters: {
    eventId?: number;
    studentId?: number;
    status?: RegistrationStatus;
    page?: number;
    limit?: number;
    instansiId: number;
  }) {
    const {
      eventId,
      studentId,
      status,
      page = 1,
      limit = 20,
      instansiId,
    } = filters;

    const queryBuilder = this.registrationsRepository
      .createQueryBuilder('registration')
      .where('registration.instansiId = :instansiId', { instansiId })
      .leftJoinAndSelect('registration.event', 'event')
      .leftJoinAndSelect('registration.student', 'student')
      .leftJoinAndSelect('registration.teacher', 'teacher')
      .leftJoinAndSelect('registration.incomeExpense', 'incomeExpense');

    if (eventId) {
      queryBuilder.andWhere('registration.eventId = :eventId', { eventId });
    }

    if (studentId) {
      queryBuilder.andWhere('registration.studentId = :studentId', { studentId });
    }

    if (status) {
      queryBuilder.andWhere('registration.status = :status', { status });
    }

    queryBuilder.orderBy('registration.registrationDate', 'DESC');

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

  async updateRegistrationStatus(
    id: number,
    status: RegistrationStatus,
    instansiId: number,
  ) {
    const registration = await this.registrationsRepository.findOne({
      where: { id, instansiId },
      relations: ['event', 'student', 'teacher'],
    });

    if (!registration) {
      throw new NotFoundException(
        `Registration with ID ${id} not found`,
      );
    }

    registration.status = status;
    return await this.registrationsRepository.save(registration);
  }

  /**
   * Confirm payment for event registration and create income record
   * Uses transaction to ensure data consistency
   */
  async confirmPayment(
    id: number,
    instansiId: number,
    paymentReceipt?: string,
    createdBy?: number,
  ) {
    const registration = await this.registrationsRepository.findOne({
      where: { id, instansiId },
      relations: ['event', 'student', 'teacher'],
    });

    if (!registration) {
      throw new NotFoundException(
        `Registration with ID ${id} not found`,
      );
    }

    if (registration.paymentStatus) {
      throw new BadRequestException('Payment already confirmed');
    }

    if (!registration.paymentAmount || registration.paymentAmount <= 0) {
      throw new BadRequestException('Payment amount is invalid');
    }

    // Check if event is still active
    if (registration.event.status === EventStatus.CANCELLED) {
      throw new BadRequestException('Cannot confirm payment for cancelled event');
    }

    // Use transaction to ensure data consistency
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Update payment status
      registration.paymentStatus = true;
      if (paymentReceipt) {
        registration.paymentReceipt = paymentReceipt;
      }

      // Create income record in finance module
      const participantName = registration.student?.name 
        || registration.teacher?.name 
        || 'Event Participant';

      const income = this.incomeExpenseRepository.create({
        transactionType: TransactionType.INCOME,
        category: IncomeCategory.ACTIVITY_REVENUE,
        title: `Pembayaran Event: ${registration.event.title}`,
        description: `Pembayaran registrasi event "${registration.event.title}" oleh ${participantName}`,
        amount: registration.paymentAmount,
        transactionDate: new Date(),
        referenceNumber: `EVENT-REG-${registration.id}`,
        recipient: participantName,
        notes: `Pembayaran untuk event registration ID: ${registration.id}, Event ID: ${registration.event.id}`,
        createdBy,
        instansiId,
      });

      const savedIncome = await queryRunner.manager.save(IncomeExpense, income);

      // Link income to registration
      registration.incomeExpenseId = savedIncome.id;
      registration.status = RegistrationStatus.CONFIRMED;

      await queryRunner.manager.save(EventRegistration, registration);

      await queryRunner.commitTransaction();

      // Reload with relations
      return await this.registrationsRepository.findOne({
        where: { id, instansiId },
        relations: ['event', 'student', 'teacher', 'incomeExpense'],
      });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getUpcomingEvents(instansiId: number) {
    const today = new Date();
    return await this.eventsRepository.find({
      where: {
        instansiId,
        startDate: MoreThanOrEqual(today),
        status: EventStatus.PUBLISHED,
      },
      order: { startDate: 'ASC' },
      take: 10,
    });
  }

  async getStatistics(instansiId: number) {
    const total = await this.eventsRepository.count({ where: { instansiId } });
    const upcoming = await this.eventsRepository.count({
      where: {
        instansiId,
        startDate: MoreThanOrEqual(new Date()),
        status: EventStatus.PUBLISHED,
      },
    });
    const totalRegistrations = await this.registrationsRepository.count({
      where: { instansiId },
    });

    return {
      total,
      upcoming,
      totalRegistrations,
    };
  }
}

