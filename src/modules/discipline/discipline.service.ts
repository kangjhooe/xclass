import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DisciplinaryAction } from './entities/disciplinary-action.entity';
import { CreateDisciplinaryActionDto } from './dto/create-disciplinary-action.dto';
import { UpdateDisciplinaryActionDto } from './dto/update-disciplinary-action.dto';

@Injectable()
export class DisciplineService {
  constructor(
    @InjectRepository(DisciplinaryAction)
    private actionRepository: Repository<DisciplinaryAction>,
  ) {}

  async create(createDto: CreateDisciplinaryActionDto, instansiId: number) {
    const action = this.actionRepository.create({
      ...createDto,
      instansiId,
      incidentDate: new Date(createDto.incidentDate),
    });

    return await this.actionRepository.save(action);
  }

  async findAll(filters: {
    instansiId: number;
    studentId?: number;
    status?: string;
    sanctionType?: string;
    page?: number;
    limit?: number;
  }) {
    const {
      instansiId,
      studentId,
      status,
      sanctionType,
      page = 1,
      limit = 20,
    } = filters;

    const queryBuilder = this.actionRepository
      .createQueryBuilder('action')
      .leftJoinAndSelect('action.student', 'student')
      .leftJoinAndSelect('action.reporter', 'reporter')
      .where('action.instansiId = :instansiId', { instansiId })
      .orderBy('action.incidentDate', 'DESC');

    if (studentId) {
      queryBuilder.andWhere('action.studentId = :studentId', { studentId });
    }

    if (status) {
      queryBuilder.andWhere('action.status = :status', { status });
    }

    if (sanctionType) {
      queryBuilder.andWhere('action.sanctionType = :sanctionType', {
        sanctionType,
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
    const action = await this.actionRepository.findOne({
      where: { id, instansiId },
      relations: ['student', 'reporter'],
    });

    if (!action) {
      throw new NotFoundException(
        `Tindakan disiplin dengan ID ${id} tidak ditemukan`,
      );
    }

    return action;
  }

  async update(
    id: number,
    updateDto: UpdateDisciplinaryActionDto,
    instansiId: number,
  ) {
    const action = await this.findOne(id, instansiId);

    // Update fields jika ada di updateDto
    if (updateDto.studentId !== undefined) {
      action.studentId = updateDto.studentId;
    }
    if (updateDto.reporterId !== undefined) {
      action.reporterId = updateDto.reporterId;
    }
    if (updateDto.incidentDate) {
      action.incidentDate = new Date(updateDto.incidentDate);
    }
    if (updateDto.description !== undefined) {
      action.description = updateDto.description;
    }
    if (updateDto.sanctionType !== undefined) {
      action.sanctionType = updateDto.sanctionType;
    }
    if (updateDto.sanctionDetails !== undefined) {
      action.sanctionDetails = updateDto.sanctionDetails;
    }
    if (updateDto.status !== undefined) {
      action.status = updateDto.status;
    }
    if (updateDto.notes !== undefined) {
      action.notes = updateDto.notes;
    }

    return await this.actionRepository.save(action);
  }

  async updateStatus(
    id: number,
    status: string,
    instansiId: number,
  ) {
    const action = await this.findOne(id, instansiId);
    action.status = status;
    return await this.actionRepository.save(action);
  }

  async remove(id: number, instansiId: number) {
    const action = await this.findOne(id, instansiId);
    await this.actionRepository.remove(action);
    return { message: 'Tindakan disiplin berhasil dihapus' };
  }
}

