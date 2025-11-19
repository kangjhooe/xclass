import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Graduation } from './entities/graduation.entity';
import { CreateGraduationDto } from './dto/create-graduation.dto';
import { CreateBatchGraduationDto } from './dto/create-batch-graduation.dto';
import { UpdateGraduationDto } from './dto/update-graduation.dto';

@Injectable()
export class GraduationService {
  constructor(
    @InjectRepository(Graduation)
    private graduationRepository: Repository<Graduation>,
  ) {}

  async create(createDto: CreateGraduationDto, instansiId: number) {
    // Extract year from academic year or use current year
    let graduationYear = createDto.graduationYear;
    if (!graduationYear && createDto.academic_year_id) {
      // If academic year ID is provided, extract year from it
      // For now, use current year as fallback
      graduationYear = new Date().getFullYear();
    }
    if (!graduationYear) {
      graduationYear = new Date().getFullYear();
    }

    const graduation = this.graduationRepository.create({
      studentId: createDto.student_id,
      academicYearId: createDto.academic_year_id,
      classId: createDto.class_id,
      graduationYear: graduationYear,
      graduationDate: createDto.graduation_date ? new Date(createDto.graduation_date) : new Date(),
      finalGrade: createDto.finalGrade,
      rank: createDto.rank,
      status: createDto.status || 'pending',
      certificateGenerated: createDto.certificateGenerated || false,
      certificateNumber: createDto.certificate_number,
      notes: createDto.notes,
      instansiId,
    });

    const saved = await this.graduationRepository.save(graduation);
    return await this.findOne(saved.id, instansiId);
  }

  async createBatch(
    batchDto: CreateBatchGraduationDto,
    instansiId: number,
  ) {
    let success = 0;
    let failed = 0;

    // Extract year from academic year or use provided graduationYear
    let graduationYear = batchDto.graduationYear;
    if (!graduationYear) {
      graduationYear = new Date().getFullYear();
    }

    for (const studentId of batchDto.student_ids) {
      try {
        const createDto: CreateGraduationDto = {
          student_id: studentId,
          academic_year_id: batchDto.academic_year_id,
          class_id: batchDto.class_id,
          graduationYear: graduationYear,
          graduation_date: batchDto.graduation_date,
          notes: batchDto.notes,
        };
        await this.create(createDto, instansiId);
        success++;
      } catch (error) {
        failed++;
      }
    }

    return { success, failed };
  }

  async findAll(filters: {
    instansiId: number;
    graduationYear?: number;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const { instansiId, graduationYear, status, page = 1, limit = 20 } = filters;

    const queryBuilder = this.graduationRepository
      .createQueryBuilder('graduation')
      .leftJoinAndSelect('graduation.student', 'student')
      .leftJoinAndSelect('graduation.academicYear', 'academicYear')
      .leftJoinAndSelect('graduation.classRoom', 'classRoom')
      .where('graduation.instansiId = :instansiId', { instansiId })
      .orderBy('graduation.graduationYear', 'DESC')
      .addOrderBy('graduation.finalGrade', 'DESC');

    if (graduationYear) {
      queryBuilder.andWhere('graduation.graduationYear = :graduationYear', {
        graduationYear,
      });
    }

    if (status) {
      queryBuilder.andWhere('graduation.status = :status', { status });
    }

    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    // Transform data untuk match dengan frontend interface
    const transformedData = data.map((g) => ({
      id: g.id,
      academic_year_id: g.academicYearId,
      academic_year_name: g.academicYear?.name,
      student_id: g.studentId,
      student_name: g.student?.name,
      student_nis: g.student?.nisn,
      class_id: g.classId,
      class_name: g.classRoom?.name,
      graduation_date: g.graduationDate ? g.graduationDate.toISOString().split('T')[0] : null,
      certificate_number: g.certificateNumber,
      status: g.status,
      notes: g.notes,
      created_at: g.createdAt?.toISOString(),
      approved_at: g.approvedAt?.toISOString(),
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
    const graduation = await this.graduationRepository.findOne({
      where: { id, instansiId },
      relations: ['student', 'academicYear', 'classRoom'],
    });

    if (!graduation) {
      throw new NotFoundException(
        `Kelulusan dengan ID ${id} tidak ditemukan`,
      );
    }

    // Transform untuk match dengan frontend interface
    return {
      id: graduation.id,
      academic_year_id: graduation.academicYearId,
      academic_year_name: graduation.academicYear?.name,
      student_id: graduation.studentId,
      student_name: graduation.student?.name,
      student_nis: graduation.student?.nisn,
      class_id: graduation.classId,
      class_name: graduation.classRoom?.name,
      graduation_date: graduation.graduationDate ? graduation.graduationDate.toISOString().split('T')[0] : null,
      certificate_number: graduation.certificateNumber,
      status: graduation.status,
      notes: graduation.notes,
      created_at: graduation.createdAt?.toISOString(),
      approved_at: graduation.approvedAt?.toISOString(),
    };
  }

  async update(
    id: number,
    updateDto: UpdateGraduationDto,
    instansiId: number,
  ) {
    const graduation = await this.graduationRepository.findOne({
      where: { id, instansiId },
    });

    if (!graduation) {
      throw new NotFoundException(
        `Kelulusan dengan ID ${id} tidak ditemukan`,
      );
    }

    Object.assign(graduation, {
      studentId: updateDto.student_id ?? graduation.studentId,
      academicYearId: updateDto.academic_year_id ?? graduation.academicYearId,
      classId: updateDto.class_id ?? graduation.classId,
      graduationYear: updateDto.graduationYear ?? graduation.graduationYear,
      graduationDate: updateDto.graduation_date
        ? new Date(updateDto.graduation_date)
        : graduation.graduationDate,
      finalGrade: updateDto.finalGrade ?? graduation.finalGrade,
      rank: updateDto.rank ?? graduation.rank,
      status: updateDto.status ?? graduation.status,
      certificateNumber: updateDto.certificate_number ?? graduation.certificateNumber,
      notes: updateDto.notes ?? graduation.notes,
    });

    await this.graduationRepository.save(graduation);
    return await this.findOne(id, instansiId);
  }

  async approve(id: number, instansiId: number) {
    const graduation = await this.graduationRepository.findOne({
      where: { id, instansiId },
    });

    if (!graduation) {
      throw new NotFoundException(
        `Kelulusan dengan ID ${id} tidak ditemukan`,
      );
    }

    graduation.status = 'approved';
    graduation.approvedAt = new Date();

    await this.graduationRepository.save(graduation);
    return await this.findOne(id, instansiId);
  }

  async generateCertificate(id: number, instansiId: number) {
    const graduation = await this.findOne(id, instansiId);
    const graduationEntity = await this.graduationRepository.findOne({
      where: { id, instansiId },
    });

    if (!graduationEntity) {
      throw new NotFoundException(
        `Kelulusan dengan ID ${id} tidak ditemukan`,
      );
    }

    graduationEntity.certificateGenerated = true;
    graduationEntity.certificateNumber = graduationEntity.certificateNumber || 
      `CERT-${graduationEntity.graduationYear}-${String(graduationEntity.id).padStart(4, '0')}`;
    graduationEntity.status = 'graduated';
    
    await this.graduationRepository.save(graduationEntity);
    return await this.findOne(id, instansiId);
  }

  async remove(id: number, instansiId: number) {
    const graduation = await this.graduationRepository.findOne({
      where: { id, instansiId },
    });

    if (!graduation) {
      throw new NotFoundException(
        `Kelulusan dengan ID ${id} tidak ditemukan`,
      );
    }

    await this.graduationRepository.remove(graduation);
    return { message: 'Kelulusan berhasil dihapus' };
  }
}

