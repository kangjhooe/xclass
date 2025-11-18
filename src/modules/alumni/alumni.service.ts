import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Alumni } from './entities/alumni.entity';
import { CreateAlumniDto } from './dto/create-alumni.dto';
import { UpdateAlumniDto } from './dto/update-alumni.dto';
import { StudentsService } from '../students/students.service';

@Injectable()
export class AlumniService {
  constructor(
    @InjectRepository(Alumni)
    private alumniRepository: Repository<Alumni>,
    private studentsService: StudentsService,
  ) {}

  async create(createDto: CreateAlumniDto, instansiId: number) {
    // Validasi studentId exists
    try {
      await this.studentsService.findOne(createDto.studentId, instansiId);
    } catch (error) {
      throw new NotFoundException(
        `Siswa dengan ID ${createDto.studentId} tidak ditemukan di instansi ini`,
      );
    }

    // Validasi tidak ada duplikat alumni untuk student yang sama
    const existingAlumni = await this.alumniRepository.findOne({
      where: {
        studentId: createDto.studentId,
        instansiId,
      },
    });

    if (existingAlumni) {
      throw new BadRequestException(
        `Alumni untuk siswa dengan ID ${createDto.studentId} sudah terdaftar`,
      );
    }

    const alumni = this.alumniRepository.create({
      ...createDto,
      instansiId,
      graduationDate: new Date(createDto.graduationDate),
    });

    return await this.alumniRepository.save(alumni);
  }

  async findAll(filters: {
    instansiId: number;
    status?: string;
    graduationYear?: number;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const {
      instansiId,
      status,
      graduationYear,
      search,
      page = 1,
      limit = 20,
    } = filters;

    const queryBuilder = this.alumniRepository
      .createQueryBuilder('alumni')
      .leftJoinAndSelect('alumni.student', 'student')
      .where('alumni.instansiId = :instansiId', { instansiId })
      .orderBy('alumni.graduationYear', 'DESC')
      .addOrderBy('alumni.finalGrade', 'DESC');

    if (status) {
      queryBuilder.andWhere('alumni.status = :status', { status });
    }

    if (graduationYear) {
      queryBuilder.andWhere('alumni.graduationYear = :graduationYear', {
        graduationYear,
      });
    }

    if (search) {
      queryBuilder.andWhere(
        '(student.name LIKE :search OR alumni.currentOccupation LIKE :search)',
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
    const alumni = await this.alumniRepository.findOne({
      where: { id, instansiId },
      relations: ['student'],
    });

    if (!alumni) {
      throw new NotFoundException(`Alumni dengan ID ${id} tidak ditemukan`);
    }

    return alumni;
  }

  async update(
    id: number,
    updateDto: UpdateAlumniDto,
    instansiId: number,
  ) {
    const alumni = await this.findOne(id, instansiId);

    Object.assign(alumni, {
      ...updateDto,
      graduationDate: updateDto.graduationDate
        ? new Date(updateDto.graduationDate)
        : alumni.graduationDate,
    });

    return await this.alumniRepository.save(alumni);
  }

  async remove(id: number, instansiId: number) {
    const alumni = await this.findOne(id, instansiId);
    await this.alumniRepository.remove(alumni);
    return { message: 'Alumni berhasil dihapus' };
  }

  async getStatistics(instansiId: number) {
    const total = await this.alumniRepository.count({
      where: { instansiId },
    });

    const byStatus = await this.alumniRepository
      .createQueryBuilder('alumni')
      .select('alumni.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('alumni.instansiId = :instansiId', { instansiId })
      .groupBy('alumni.status')
      .getRawMany();

    return {
      total,
      byStatus,
    };
  }
}

