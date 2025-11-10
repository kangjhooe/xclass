import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CounselingSession } from './entities/counseling-session.entity';
import { CreateCounselingSessionDto } from './dto/create-counseling-session.dto';

@Injectable()
export class CounselingService {
  constructor(
    @InjectRepository(CounselingSession)
    private sessionRepository: Repository<CounselingSession>,
  ) {}

  async create(createDto: CreateCounselingSessionDto, instansiId: number) {
    const session = this.sessionRepository.create({
      ...createDto,
      instansiId,
      sessionDate: new Date(createDto.sessionDate),
      followUpDate: createDto.followUpDate
        ? new Date(createDto.followUpDate)
        : null,
    });

    return await this.sessionRepository.save(session);
  }

  async findAll(filters: {
    instansiId: number;
    studentId?: number;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const { instansiId, studentId, status, page = 1, limit = 20 } = filters;

    const queryBuilder = this.sessionRepository
      .createQueryBuilder('session')
      .leftJoinAndSelect('session.student', 'student')
      .leftJoinAndSelect('session.counselor', 'counselor')
      .where('session.instansiId = :instansiId', { instansiId })
      .orderBy('session.sessionDate', 'DESC');

    if (studentId) {
      queryBuilder.andWhere('session.studentId = :studentId', { studentId });
    }

    if (status) {
      queryBuilder.andWhere('session.status = :status', { status });
    }

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
    const session = await this.sessionRepository.findOne({
      where: { id, instansiId },
      relations: ['student', 'counselor'],
    });

    if (!session) {
      throw new NotFoundException(
        `Sesi konseling dengan ID ${id} tidak ditemukan`,
      );
    }

    return session;
  }

  async updateStatus(
    id: number,
    status: string,
    instansiId: number,
  ) {
    const session = await this.findOne(id, instansiId);
    session.status = status;
    return await this.sessionRepository.save(session);
  }

  async remove(id: number, instansiId: number) {
    const session = await this.findOne(id, instansiId);
    await this.sessionRepository.remove(session);
    return { message: 'Sesi konseling berhasil dihapus' };
  }
}

