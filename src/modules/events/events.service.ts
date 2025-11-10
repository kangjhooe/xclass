import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Event, EventStatus } from './entities/event.entity';
import {
  EventRegistration,
  RegistrationStatus,
} from './entities/event-registration.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { CreateEventRegistrationDto } from './dto/create-event-registration.dto';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private eventsRepository: Repository<Event>,
    @InjectRepository(EventRegistration)
    private registrationsRepository: Repository<EventRegistration>,
  ) {}

  // ========== Events ==========
  async create(createDto: CreateEventDto, instansiId: number, createdBy?: number) {
    const event = this.eventsRepository.create({
      ...createDto,
      instansiId,
      createdBy,
      startDate: new Date(createDto.startDate),
      endDate: new Date(createDto.endDate),
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
      relations: ['registrations', 'registrations.student', 'registrations.teacher'],
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    return event;
  }

  async update(id: number, updateDto: UpdateEventDto, instansiId: number) {
    const event = await this.findOne(id, instansiId);

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
    await this.eventsRepository.remove(event);
    return { message: 'Event deleted successfully' };
  }

  // ========== Event Registrations ==========
  async createRegistration(
    createDto: CreateEventRegistrationDto,
    instansiId: number,
    createdBy?: number,
  ) {
    const event = await this.findOne(createDto.eventId, instansiId);

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
      .leftJoinAndSelect('registration.teacher', 'teacher');

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
      relations: ['event'],
    });

    if (!registration) {
      throw new NotFoundException(
        `Registration with ID ${id} not found`,
      );
    }

    registration.status = status;
    return await this.registrationsRepository.save(registration);
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

