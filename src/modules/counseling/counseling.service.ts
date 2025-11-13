import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CounselingSession } from './entities/counseling-session.entity';
import { CreateCounselingSessionDto } from './dto/create-counseling-session.dto';
import { UpdateCounselingSessionDto } from './dto/update-counseling-session.dto';
import { StudentsService } from '../students/students.service';
import { TeachersService } from '../teachers/teachers.service';

@Injectable()
export class CounselingService {
  private readonly VALID_STATUSES = ['scheduled', 'in_progress', 'completed', 'cancelled'];

  constructor(
    @InjectRepository(CounselingSession)
    private sessionRepository: Repository<CounselingSession>,
    private studentsService: StudentsService,
    private teachersService: TeachersService,
  ) {}

  async create(createDto: CreateCounselingSessionDto, instansiId: number) {
    // Validasi studentId
    try {
      await this.studentsService.findOne(createDto.studentId, instansiId);
    } catch (error) {
      throw new NotFoundException(
        `Siswa dengan ID ${createDto.studentId} tidak ditemukan di instansi ini`,
      );
    }

    // Validasi counselorId jika ada
    if (createDto.counselorId) {
      try {
        await this.teachersService.findOne(createDto.counselorId, instansiId);
      } catch (error) {
        throw new NotFoundException(
          `Konselor dengan ID ${createDto.counselorId} tidak ditemukan di instansi ini`,
        );
      }
    }

    // Validasi sessionDate tidak di masa lalu jika status completed
    const sessionDate = new Date(createDto.sessionDate);
    if (createDto.status === 'completed' && sessionDate > new Date()) {
      throw new BadRequestException(
        'Sesi yang sudah selesai tidak boleh memiliki tanggal di masa depan',
      );
    }

    const session = this.sessionRepository.create({
      ...createDto,
      instansiId,
      sessionDate,
      followUpDate: createDto.followUpDate
        ? new Date(createDto.followUpDate)
        : null,
    });

    return await this.sessionRepository.save(session);
  }

  async findAll(filters: {
    instansiId: number;
    studentId?: number;
    counselorId?: number;
    status?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const {
      instansiId,
      studentId,
      counselorId,
      status,
      startDate,
      endDate,
      search,
      page = 1,
      limit = 20,
    } = filters;

    const queryBuilder = this.sessionRepository
      .createQueryBuilder('session')
      .leftJoinAndSelect('session.student', 'student')
      .leftJoinAndSelect('session.counselor', 'counselor')
      .where('session.instansiId = :instansiId', { instansiId })
      .orderBy('session.sessionDate', 'DESC');

    if (studentId) {
      queryBuilder.andWhere('session.studentId = :studentId', { studentId });
    }

    if (counselorId) {
      queryBuilder.andWhere('session.counselorId = :counselorId', {
        counselorId,
      });
    }

    if (status) {
      if (!this.VALID_STATUSES.includes(status)) {
        throw new BadRequestException(
          `Status tidak valid. Status yang valid: ${this.VALID_STATUSES.join(', ')}`,
        );
      }
      queryBuilder.andWhere('session.status = :status', { status });
    }

    if (startDate) {
      queryBuilder.andWhere('session.sessionDate >= :startDate', {
        startDate: new Date(startDate),
      });
    }

    if (endDate) {
      queryBuilder.andWhere('session.sessionDate <= :endDate', {
        endDate: new Date(endDate),
      });
    }

    if (search) {
      queryBuilder.andWhere(
        '(session.issue LIKE :search OR session.notes LIKE :search OR session.followUp LIKE :search OR student.name LIKE :search OR counselor.name LIKE :search)',
        { search: `%${search}%` },
      );
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

  async update(
    id: number,
    updateDto: UpdateCounselingSessionDto,
    instansiId: number,
  ) {
    const session = await this.findOne(id, instansiId);

    // Validasi studentId jika diupdate
    if (updateDto.studentId && updateDto.studentId !== session.studentId) {
      try {
        await this.studentsService.findOne(updateDto.studentId, instansiId);
      } catch (error) {
        throw new NotFoundException(
          `Siswa dengan ID ${updateDto.studentId} tidak ditemukan di instansi ini`,
        );
      }
    }

    // Validasi counselorId jika diupdate
    if (updateDto.counselorId !== undefined) {
      if (updateDto.counselorId !== null) {
        try {
          await this.teachersService.findOne(updateDto.counselorId, instansiId);
        } catch (error) {
          throw new NotFoundException(
            `Konselor dengan ID ${updateDto.counselorId} tidak ditemukan di instansi ini`,
          );
        }
      }
    }

    // Validasi status jika diupdate
    if (updateDto.status && !this.VALID_STATUSES.includes(updateDto.status)) {
      throw new BadRequestException(
        `Status tidak valid. Status yang valid: ${this.VALID_STATUSES.join(', ')}`,
      );
    }

    // Validasi business logic
    const sessionDate = updateDto.sessionDate
      ? new Date(updateDto.sessionDate)
      : session.sessionDate;
    if (
      (updateDto.status || session.status) === 'completed' &&
      sessionDate > new Date()
    ) {
      throw new BadRequestException(
        'Sesi yang sudah selesai tidak boleh memiliki tanggal di masa depan',
      );
    }

    // Update fields
    if (updateDto.studentId !== undefined) {
      session.studentId = updateDto.studentId;
    }
    if (updateDto.counselorId !== undefined) {
      session.counselorId = updateDto.counselorId;
    }
    if (updateDto.sessionDate) {
      session.sessionDate = new Date(updateDto.sessionDate);
    }
    if (updateDto.issue !== undefined) {
      session.issue = updateDto.issue;
    }
    if (updateDto.notes !== undefined) {
      session.notes = updateDto.notes;
    }
    if (updateDto.status !== undefined) {
      session.status = updateDto.status;
    }
    if (updateDto.followUp !== undefined) {
      session.followUp = updateDto.followUp;
    }
    if (updateDto.followUpDate !== undefined) {
      session.followUpDate = updateDto.followUpDate
        ? new Date(updateDto.followUpDate)
        : null;
    }

    return await this.sessionRepository.save(session);
  }

  async updateStatus(
    id: number,
    status: string,
    instansiId: number,
  ) {
    // Validasi status
    if (!this.VALID_STATUSES.includes(status)) {
      throw new BadRequestException(
        `Status tidak valid. Status yang valid: ${this.VALID_STATUSES.join(', ')}`,
      );
    }

    const session = await this.findOne(id, instansiId);

    // Validasi business logic
    if (status === 'completed' && session.sessionDate > new Date()) {
      throw new BadRequestException(
        'Sesi yang sudah selesai tidak boleh memiliki tanggal di masa depan',
      );
    }

    session.status = status;
    return await this.sessionRepository.save(session);
  }

  async remove(id: number, instansiId: number) {
    const session = await this.findOne(id, instansiId);
    await this.sessionRepository.remove(session);
    return { message: 'Sesi konseling berhasil dihapus' };
  }
}

