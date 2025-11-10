import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Graduation } from './entities/graduation.entity';
import { CreateGraduationDto } from './dto/create-graduation.dto';

@Injectable()
export class GraduationService {
  constructor(
    @InjectRepository(Graduation)
    private graduationRepository: Repository<Graduation>,
  ) {}

  async create(createDto: CreateGraduationDto, instansiId: number) {
    const graduation = this.graduationRepository.create({
      ...createDto,
      instansiId,
      graduationDate: new Date(createDto.graduationDate),
    });

    return await this.graduationRepository.save(graduation);
  }

  async findAll(filters: {
    instansiId: number;
    graduationYear?: number;
    page?: number;
    limit?: number;
  }) {
    const { instansiId, graduationYear, page = 1, limit = 20 } = filters;

    const queryBuilder = this.graduationRepository
      .createQueryBuilder('graduation')
      .leftJoinAndSelect('graduation.student', 'student')
      .where('graduation.instansiId = :instansiId', { instansiId })
      .orderBy('graduation.graduationYear', 'DESC')
      .addOrderBy('graduation.finalGrade', 'DESC');

    if (graduationYear) {
      queryBuilder.andWhere('graduation.graduationYear = :graduationYear', {
        graduationYear,
      });
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
    const graduation = await this.graduationRepository.findOne({
      where: { id, instansiId },
      relations: ['student'],
    });

    if (!graduation) {
      throw new NotFoundException(
        `Kelulusan dengan ID ${id} tidak ditemukan`,
      );
    }

    return graduation;
  }

  async generateCertificate(id: number, instansiId: number) {
    const graduation = await this.findOne(id, instansiId);
    graduation.certificateGenerated = true;
    graduation.certificateNumber = `CERT-${graduation.graduationYear}-${String(graduation.id).padStart(4, '0')}`;
    return await this.graduationRepository.save(graduation);
  }

  async remove(id: number, instansiId: number) {
    const graduation = await this.findOne(id, instansiId);
    await this.graduationRepository.remove(graduation);
    return { message: 'Kelulusan berhasil dihapus' };
  }
}

