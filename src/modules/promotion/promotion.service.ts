import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Promotion } from './entities/promotion.entity';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { CreateBatchPromotionDto } from './dto/create-batch-promotion.dto';
import { RejectPromotionDto } from './dto/reject-promotion.dto';
import { Student } from '../students/entities/student.entity';
import { ClassRoom } from '../classes/entities/class-room.entity';

@Injectable()
export class PromotionService {
  constructor(
    @InjectRepository(Promotion)
    private promotionRepository: Repository<Promotion>,
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    @InjectRepository(ClassRoom)
    private classRoomRepository: Repository<ClassRoom>,
  ) {}

  async create(createDto: CreatePromotionDto, instansiId: number) {
    // Validasi siswa
    const student = await this.studentRepository.findOne({
      where: { id: createDto.studentId, instansiId },
    });

    if (!student) {
      throw new NotFoundException(`Siswa dengan ID ${createDto.studentId} tidak ditemukan`);
    }

    // Validasi kelas tujuan
    const toClass = await this.classRoomRepository.findOne({
      where: { id: createDto.toClassId, instansiId },
    });

    if (!toClass) {
      throw new NotFoundException(`Kelas tujuan dengan ID ${createDto.toClassId} tidak ditemukan`);
    }

    // Validasi kelas asal (jika ada)
    if (createDto.fromClassId) {
      const fromClass = await this.classRoomRepository.findOne({
        where: { id: createDto.fromClassId, instansiId },
      });

      if (!fromClass) {
        throw new NotFoundException(`Kelas asal dengan ID ${createDto.fromClassId} tidak ditemukan`);
      }

      // Validasi siswa benar-benar ada di kelas asal
      if (student.classId !== createDto.fromClassId) {
        throw new BadRequestException(
          `Siswa tidak berada di kelas asal yang ditentukan. Siswa saat ini di kelas ID ${student.classId}`
        );
      }
    }

    // Validasi tidak ada pengajuan pending untuk siswa yang sama
    const existingPending = await this.promotionRepository.findOne({
      where: {
        studentId: createDto.studentId,
        instansiId,
        status: 'pending',
      },
    });

    if (existingPending) {
      throw new ConflictException(
        `Siswa ini sudah memiliki pengajuan kenaikan kelas yang sedang menunggu persetujuan`
      );
    }

    const promotion = this.promotionRepository.create({
      ...createDto,
      instansiId,
      status: createDto.status || 'pending',
    });

    const saved = await this.promotionRepository.save(promotion);

    // Reload dengan relations untuk transform
    const promotionWithRelations = await this.promotionRepository.findOne({
      where: { id: saved.id, instansiId },
      relations: ['student', 'fromClass', 'toClass'],
    });

    // Transform untuk frontend
    return {
      id: promotionWithRelations.id,
      academic_year_id: promotionWithRelations.academicYear,
      academic_year_name: promotionWithRelations.academicYear?.toString() || '-',
      from_class_id: promotionWithRelations.fromClassId,
      from_class_name: promotionWithRelations.fromClass?.name || '-',
      to_class_id: promotionWithRelations.toClassId,
      to_class_name: promotionWithRelations.toClass?.name || '-',
      student_id: promotionWithRelations.studentId,
      student_name: promotionWithRelations.student?.name || '-',
      student_nis: promotionWithRelations.student?.studentNumber || promotionWithRelations.student?.nisn || '-',
      status: promotionWithRelations.status,
      notes: promotionWithRelations.notes,
      created_at: promotionWithRelations.createdAt?.toISOString(),
      processed_at: promotionWithRelations.completedAt?.toISOString() || promotionWithRelations.approvedAt?.toISOString(),
    };
  }

  async findAll(filters: {
    instansiId: number;
    status?: string;
    academicYear?: number;
    page?: number;
    limit?: number;
  }) {
    const {
      instansiId,
      status,
      academicYear,
      page = 1,
      limit = 20,
    } = filters;

    const queryBuilder = this.promotionRepository
      .createQueryBuilder('promotion')
      .leftJoinAndSelect('promotion.student', 'student')
      .leftJoinAndSelect('promotion.fromClass', 'fromClass')
      .leftJoinAndSelect('promotion.toClass', 'toClass')
      .where('promotion.instansiId = :instansiId', { instansiId })
      .orderBy('promotion.createdAt', 'DESC');

    if (status) {
      queryBuilder.andWhere('promotion.status = :status', { status });
    }

    if (academicYear) {
      queryBuilder.andWhere('promotion.academicYear = :academicYear', {
        academicYear,
      });
    }

    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    // Transform data untuk frontend
    const transformedData = data.map((promotion) => ({
      id: promotion.id,
      academic_year_id: promotion.academicYear,
      academic_year_name: promotion.academicYear?.toString() || '-',
      from_class_id: promotion.fromClassId,
      from_class_name: promotion.fromClass?.name || '-',
      to_class_id: promotion.toClassId,
      to_class_name: promotion.toClass?.name || '-',
      student_id: promotion.studentId,
      student_name: promotion.student?.name || '-',
      student_nis: promotion.student?.studentNumber || promotion.student?.nisn || '-',
      // Map cancelled ke rejected untuk frontend
      status: promotion.status === 'cancelled' && promotion.notes?.includes('[Ditolak:') 
        ? 'rejected' 
        : promotion.status,
      notes: promotion.notes,
      created_at: promotion.createdAt?.toISOString(),
      processed_at: promotion.completedAt?.toISOString() || promotion.approvedAt?.toISOString(),
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
    const promotion = await this.promotionRepository.findOne({
      where: { id, instansiId },
      relations: ['student', 'fromClass', 'toClass'],
    });

    if (!promotion) {
      throw new NotFoundException(`Kenaikan kelas dengan ID ${id} tidak ditemukan`);
    }

    // Transform untuk frontend
    return {
      id: promotion.id,
      academic_year_id: promotion.academicYear,
      academic_year_name: promotion.academicYear?.toString() || '-',
      from_class_id: promotion.fromClassId,
      from_class_name: promotion.fromClass?.name || '-',
      to_class_id: promotion.toClassId,
      to_class_name: promotion.toClass?.name || '-',
      student_id: promotion.studentId,
      student_name: promotion.student?.name || '-',
      student_nis: promotion.student?.studentNumber || promotion.student?.nisn || '-',
      status: promotion.status === 'cancelled' && promotion.notes?.includes('[Ditolak:') 
        ? 'rejected' 
        : promotion.status,
      notes: promotion.notes,
      created_at: promotion.createdAt?.toISOString(),
      processed_at: promotion.completedAt?.toISOString() || promotion.approvedAt?.toISOString(),
    };
  }

  async approve(id: number, instansiId: number, userId: number) {
    const promotion = await this.promotionRepository.findOne({
      where: { id, instansiId },
      relations: ['student', 'fromClass', 'toClass'],
    });

    if (!promotion) {
      throw new NotFoundException(`Kenaikan kelas dengan ID ${id} tidak ditemukan`);
    }

    if (promotion.status !== 'pending') {
      throw new BadRequestException('Hanya pengajuan yang pending yang bisa disetujui');
    }

    promotion.status = 'approved';
    promotion.approvedBy = userId;
    promotion.approvedAt = new Date();
    const saved = await this.promotionRepository.save(promotion);

    // Transform untuk frontend
    return {
      id: saved.id,
      academic_year_id: saved.academicYear,
      academic_year_name: saved.academicYear?.toString() || '-',
      from_class_id: saved.fromClassId,
      from_class_name: saved.fromClass?.name || '-',
      to_class_id: saved.toClassId,
      to_class_name: saved.toClass?.name || '-',
      student_id: saved.studentId,
      student_name: saved.student?.name || '-',
      student_nis: saved.student?.studentNumber || saved.student?.nisn || '-',
      status: saved.status,
      notes: saved.notes,
      created_at: saved.createdAt?.toISOString(),
      processed_at: saved.completedAt?.toISOString() || saved.approvedAt?.toISOString(),
    };
  }

  async complete(id: number, instansiId: number) {
    const promotion = await this.promotionRepository.findOne({
      where: { id, instansiId },
      relations: ['student', 'fromClass', 'toClass'],
    });

    if (!promotion) {
      throw new NotFoundException(`Kenaikan kelas dengan ID ${id} tidak ditemukan`);
    }

    if (promotion.status !== 'approved') {
      throw new BadRequestException('Hanya pengajuan yang sudah disetujui yang bisa diselesaikan');
    }

    // Update kelas siswa
    const student = await this.studentRepository.findOne({
      where: { id: promotion.studentId, instansiId },
    });

    if (!student) {
      throw new NotFoundException(`Siswa dengan ID ${promotion.studentId} tidak ditemukan`);
    }

    // Update classId siswa
    student.classId = promotion.toClassId;
    await this.studentRepository.save(student);

    // Update status promotion
    promotion.status = 'completed';
    promotion.completedAt = new Date();
    const saved = await this.promotionRepository.save(promotion);

    // Transform untuk frontend
    return {
      id: saved.id,
      academic_year_id: saved.academicYear,
      academic_year_name: saved.academicYear?.toString() || '-',
      from_class_id: saved.fromClassId,
      from_class_name: saved.fromClass?.name || '-',
      to_class_id: saved.toClassId,
      to_class_name: saved.toClass?.name || '-',
      student_id: saved.studentId,
      student_name: saved.student?.name || '-',
      student_nis: saved.student?.studentNumber || saved.student?.nisn || '-',
      status: saved.status,
      notes: saved.notes,
      created_at: saved.createdAt?.toISOString(),
      processed_at: saved.completedAt?.toISOString() || saved.approvedAt?.toISOString(),
    };
  }

  async reject(id: number, instansiId: number, rejectDto: RejectPromotionDto) {
    const promotion = await this.promotionRepository.findOne({
      where: { id, instansiId },
      relations: ['student', 'fromClass', 'toClass'],
    });

    if (!promotion) {
      throw new NotFoundException(`Kenaikan kelas dengan ID ${id} tidak ditemukan`);
    }

    if (promotion.status !== 'pending') {
      throw new BadRequestException('Hanya pengajuan yang pending yang bisa ditolak');
    }

    // Gunakan status 'cancelled' untuk rejected (sesuai enum entity)
    // Frontend akan melihat status ini sebagai 'rejected'
    promotion.status = 'cancelled';
    if (rejectDto.reason) {
      promotion.notes = promotion.notes 
        ? `${promotion.notes}\n[Ditolak: ${rejectDto.reason}]`
        : `[Ditolak: ${rejectDto.reason}]`;
    }

    const saved = await this.promotionRepository.save(promotion);

    // Transform untuk frontend
    return {
      id: saved.id,
      academic_year_id: saved.academicYear,
      academic_year_name: saved.academicYear?.toString() || '-',
      from_class_id: saved.fromClassId,
      from_class_name: saved.fromClass?.name || '-',
      to_class_id: saved.toClassId,
      to_class_name: saved.toClass?.name || '-',
      student_id: saved.studentId,
      student_name: saved.student?.name || '-',
      student_nis: saved.student?.studentNumber || saved.student?.nisn || '-',
      status: 'rejected', // Frontend mengharapkan 'rejected'
      notes: saved.notes,
      created_at: saved.createdAt?.toISOString(),
      processed_at: saved.completedAt?.toISOString() || saved.approvedAt?.toISOString(),
    };
  }

  async cancel(id: number, instansiId: number) {
    const promotion = await this.promotionRepository.findOne({
      where: { id, instansiId },
      relations: ['student', 'fromClass', 'toClass'],
    });

    if (!promotion) {
      throw new NotFoundException(`Kenaikan kelas dengan ID ${id} tidak ditemukan`);
    }

    promotion.status = 'cancelled';
    const saved = await this.promotionRepository.save(promotion);

    // Transform untuk frontend
    return {
      id: saved.id,
      academic_year_id: saved.academicYear,
      academic_year_name: saved.academicYear?.toString() || '-',
      from_class_id: saved.fromClassId,
      from_class_name: saved.fromClass?.name || '-',
      to_class_id: saved.toClassId,
      to_class_name: saved.toClass?.name || '-',
      student_id: saved.studentId,
      student_name: saved.student?.name || '-',
      student_nis: saved.student?.studentNumber || saved.student?.nisn || '-',
      status: saved.status,
      notes: saved.notes,
      created_at: saved.createdAt?.toISOString(),
      processed_at: saved.completedAt?.toISOString() || saved.approvedAt?.toISOString(),
    };
  }

  async createBatch(createBatchDto: CreateBatchPromotionDto, instansiId: number) {
    // Validasi kelas tujuan
    const toClass = await this.classRoomRepository.findOne({
      where: { id: createBatchDto.toClassId, instansiId },
    });

    if (!toClass) {
      throw new NotFoundException(`Kelas tujuan dengan ID ${createBatchDto.toClassId} tidak ditemukan`);
    }

    // Validasi kelas asal (jika ada)
    if (createBatchDto.fromClassId) {
      const fromClass = await this.classRoomRepository.findOne({
        where: { id: createBatchDto.fromClassId, instansiId },
      });

      if (!fromClass) {
        throw new NotFoundException(`Kelas asal dengan ID ${createBatchDto.fromClassId} tidak ditemukan`);
      }
    }

    const results = {
      success: 0,
      failed: 0,
      errors: [] as Array<{ studentId: number; error: string }>,
    };

    // Buat promotion untuk setiap siswa
    for (const studentId of createBatchDto.studentIds) {
      try {
        // Validasi siswa
        const student = await this.studentRepository.findOne({
          where: { id: studentId, instansiId },
        });

        if (!student) {
          results.failed++;
          results.errors.push({
            studentId,
            error: 'Siswa tidak ditemukan',
          });
          continue;
        }

        // Validasi kelas asal (jika ada)
        if (createBatchDto.fromClassId && student.classId !== createBatchDto.fromClassId) {
          results.failed++;
          results.errors.push({
            studentId,
            error: `Siswa tidak berada di kelas asal yang ditentukan`,
          });
          continue;
        }

        // Validasi tidak ada pengajuan pending
        const existingPending = await this.promotionRepository.findOne({
          where: {
            studentId,
            instansiId,
            status: 'pending',
          },
        });

        if (existingPending) {
          results.failed++;
          results.errors.push({
            studentId,
            error: 'Siswa sudah memiliki pengajuan pending',
          });
          continue;
        }

        // Buat promotion
        const promotion = this.promotionRepository.create({
          studentId,
          fromClassId: createBatchDto.fromClassId,
          toClassId: createBatchDto.toClassId,
          academicYear: createBatchDto.academicYear,
          instansiId,
          status: 'pending',
          notes: createBatchDto.notes,
        });

        await this.promotionRepository.save(promotion);
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          studentId,
          error: error.message || 'Terjadi kesalahan',
        });
      }
    }

    return results;
  }

  async remove(id: number, instansiId: number) {
    const promotion = await this.promotionRepository.findOne({
      where: { id, instansiId },
    });

    if (!promotion) {
      throw new NotFoundException(`Kenaikan kelas dengan ID ${id} tidak ditemukan`);
    }
    
    if (promotion.status === 'completed') {
      throw new BadRequestException('Tidak bisa menghapus pengajuan yang sudah selesai');
    }

    await this.promotionRepository.remove(promotion);
    return { message: 'Kenaikan kelas berhasil dihapus' };
  }
}

