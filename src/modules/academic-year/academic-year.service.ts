import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AcademicYear } from './entities/academic-year.entity';
import { CreateAcademicYearDto } from './dto/create-academic-year.dto';
import { UpdateAcademicYearDto } from './dto/update-academic-year.dto';

@Injectable()
export class AcademicYearService {
  constructor(
    @InjectRepository(AcademicYear)
    private academicYearRepository: Repository<AcademicYear>,
  ) {}

  async create(
    createDto: CreateAcademicYearDto,
    instansiId: number,
  ) {
    // If setting as active, deactivate others
    if (createDto.isActive) {
      await this.academicYearRepository.update(
        { instansiId },
        { isActive: false },
      );
    }

    const academicYear = this.academicYearRepository.create({
      ...createDto,
      instansiId,
      startDate: new Date(createDto.startDate),
      endDate: new Date(createDto.endDate),
    });

    return await this.academicYearRepository.save(academicYear);
  }

  async findAll(instansiId: number) {
    return this.academicYearRepository.find({
      where: { instansiId },
      order: { startDate: 'DESC' },
    });
  }

  async findOne(id: number, instansiId: number) {
    const academicYear = await this.academicYearRepository.findOne({
      where: { id, instansiId },
    });

    if (!academicYear) {
      throw new NotFoundException(`Tahun ajaran dengan ID ${id} tidak ditemukan`);
    }

    return academicYear;
  }

  async update(
    id: number,
    updateDto: UpdateAcademicYearDto,
    instansiId: number,
  ) {
    const academicYear = await this.findOne(id, instansiId);

    // If setting as active, deactivate others
    if (updateDto.isActive) {
      await this.academicYearRepository
        .createQueryBuilder()
        .update(AcademicYear)
        .set({ isActive: false })
        .where('instansiId = :instansiId', { instansiId })
        .andWhere('id != :id', { id })
        .execute();
    }

    Object.assign(academicYear, {
      ...updateDto,
      startDate: updateDto.startDate
        ? new Date(updateDto.startDate)
        : academicYear.startDate,
      endDate: updateDto.endDate
        ? new Date(updateDto.endDate)
        : academicYear.endDate,
    });

    return await this.academicYearRepository.save(academicYear);
  }

  async remove(id: number, instansiId: number) {
    const academicYear = await this.findOne(id, instansiId);
    await this.academicYearRepository.remove(academicYear);
    return { message: 'Tahun ajaran berhasil dihapus' };
  }

  async setActive(id: number, instansiId: number) {
    const academicYear = await this.findOne(id, instansiId);

    // Deactivate all others
    await this.academicYearRepository.update(
      { instansiId },
      { isActive: false },
    );

    // Activate this one
    academicYear.isActive = true;
    return await this.academicYearRepository.save(academicYear);
  }

  async getActive(instansiId: number) {
    return this.academicYearRepository.findOne({
      where: { instansiId, isActive: true },
    });
  }
}

