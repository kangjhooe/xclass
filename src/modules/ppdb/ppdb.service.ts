import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  PpdbRegistration,
  RegistrationStatus,
} from './entities/ppdb-registration.entity';
import { CreatePpdbRegistrationDto } from './dto/create-ppdb-registration.dto';
import { UpdatePpdbRegistrationDto } from './dto/update-ppdb-registration.dto';

@Injectable()
export class PpdbService {
  constructor(
    @InjectRepository(PpdbRegistration)
    private registrationsRepository: Repository<PpdbRegistration>,
  ) {}

  async generateRegistrationNumber(instansiId: number): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.registrationsRepository.count({
      where: { instansiId },
    });
    return `PPDB-${year}-${String(count + 1).padStart(6, '0')}`;
  }

  async create(
    createDto: CreatePpdbRegistrationDto,
    instansiId: number,
  ): Promise<PpdbRegistration> {
    // Check if NISN already exists
    const existing = await this.registrationsRepository.findOne({
      where: { studentNisn: createDto.studentNisn, instansiId },
    });

    if (existing) {
      throw new BadRequestException('NISN already registered');
    }

    const registrationNumber = await this.generateRegistrationNumber(instansiId);

    const registration = this.registrationsRepository.create({
      ...createDto,
      registrationNumber,
      instansiId,
      birthDate: new Date(createDto.birthDate),
      registrationDate: new Date(),
      status: createDto.status || RegistrationStatus.PENDING,
    });

    return await this.registrationsRepository.save(registration);
  }

  async findAll(filters: {
    search?: string;
    status?: RegistrationStatus;
    registrationPath?: string;
    page?: number;
    limit?: number;
    instansiId: number;
  }) {
    const {
      search,
      status,
      registrationPath,
      page = 1,
      limit = 20,
      instansiId,
    } = filters;

    const queryBuilder = this.registrationsRepository
      .createQueryBuilder('registration')
      .where('registration.instansiId = :instansiId', { instansiId });

    if (search) {
      queryBuilder.andWhere(
        '(registration.studentName LIKE :search OR registration.registrationNumber LIKE :search OR registration.studentNisn LIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (status) {
      queryBuilder.andWhere('registration.status = :status', { status });
    }

    if (registrationPath) {
      queryBuilder.andWhere('registration.registrationPath = :path', {
        path: registrationPath,
      });
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

  async findOne(id: number, instansiId: number) {
    const registration = await this.registrationsRepository.findOne({
      where: { id, instansiId },
    });

    if (!registration) {
      throw new NotFoundException(
        `Registration with ID ${id} not found`,
      );
    }

    return registration;
  }

  async update(
    id: number,
    updateDto: UpdatePpdbRegistrationDto,
    instansiId: number,
  ) {
    const registration = await this.findOne(id, instansiId);

    if (updateDto.birthDate) {
      registration.birthDate = new Date(updateDto.birthDate);
    }

    Object.assign(registration, updateDto);

    // Calculate total score if scores are provided
    if (
      updateDto.selectionScore !== undefined ||
      updateDto.interviewScore !== undefined ||
      updateDto.documentScore !== undefined
    ) {
      const selection = updateDto.selectionScore ?? registration.selectionScore ?? 0;
      const interview = updateDto.interviewScore ?? registration.interviewScore ?? 0;
      const document = updateDto.documentScore ?? registration.documentScore ?? 0;
      registration.totalScore = selection + interview + document;
    }

    return await this.registrationsRepository.save(registration);
  }

  async remove(id: number, instansiId: number) {
    const registration = await this.findOne(id, instansiId);
    await this.registrationsRepository.remove(registration);
    return { message: 'Registration deleted successfully' };
  }

  async updateStatus(
    id: number,
    status: RegistrationStatus,
    instansiId: number,
    notes?: string,
  ) {
    const registration = await this.findOne(id, instansiId);

    registration.status = status;

    if (status === RegistrationStatus.ANNOUNCED) {
      registration.announcementDate = new Date();
    } else if (status === RegistrationStatus.ACCEPTED) {
      registration.acceptedDate = new Date();
    }

    if (notes) {
      registration.notes = notes;
    }

    return await this.registrationsRepository.save(registration);
  }

  async getStatistics(instansiId: number) {
    const total = await this.registrationsRepository.count({
      where: { instansiId },
    });

    const byStatus = await this.registrationsRepository
      .createQueryBuilder('registration')
      .select('registration.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('registration.instansiId = :instansiId', { instansiId })
      .groupBy('registration.status')
      .getRawMany();

    const byPath = await this.registrationsRepository
      .createQueryBuilder('registration')
      .select('registration.registrationPath', 'path')
      .addSelect('COUNT(*)', 'count')
      .where('registration.instansiId = :instansiId', { instansiId })
      .groupBy('registration.registrationPath')
      .getRawMany();

    return {
      total,
      byStatus: byStatus.reduce((acc, item) => {
        acc[item.status] = parseInt(item.count);
        return acc;
      }, {}),
      byPath: byPath.reduce((acc, item) => {
        acc[item.path] = parseInt(item.count);
        return acc;
      }, {}),
    };
  }
}

