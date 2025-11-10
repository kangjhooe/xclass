import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GradeWeight } from './entities/grade-weight.entity';
import { CreateGradeWeightDto } from './dto/create-grade-weight.dto';

@Injectable()
export class GradeWeightService {
  constructor(
    @InjectRepository(GradeWeight)
    private gradeWeightRepository: Repository<GradeWeight>,
  ) {}

  async create(createDto: CreateGradeWeightDto, instansiId: number) {
    // Check total weight
    const totalWeight = await this.gradeWeightRepository
      .createQueryBuilder('weight')
      .select('SUM(weight.weightPercentage)', 'total')
      .where('weight.instansiId = :instansiId', { instansiId })
      .andWhere('weight.isActive = :isActive', { isActive: true })
      .getRawOne();

    const currentTotal = parseFloat(totalWeight?.total || '0');
    if (currentTotal + createDto.weightPercentage > 100) {
      throw new BadRequestException(
        `Total bobot tidak boleh melebihi 100%. Total saat ini: ${currentTotal}%`,
      );
    }

    const gradeWeight = this.gradeWeightRepository.create({
      ...createDto,
      instansiId,
    });

    return await this.gradeWeightRepository.save(gradeWeight);
  }

  async findAll(instansiId: number) {
    return this.gradeWeightRepository.find({
      where: { instansiId },
      order: { assignmentType: 'ASC' },
    });
  }

  async findOne(id: number, instansiId: number) {
    const gradeWeight = await this.gradeWeightRepository.findOne({
      where: { id, instansiId },
    });

    if (!gradeWeight) {
      throw new NotFoundException(`Bobot nilai dengan ID ${id} tidak ditemukan`);
    }

    return gradeWeight;
  }

  async toggleActive(id: number, instansiId: number) {
    const gradeWeight = await this.findOne(id, instansiId);
    gradeWeight.isActive = !gradeWeight.isActive;
    return await this.gradeWeightRepository.save(gradeWeight);
  }

  async remove(id: number, instansiId: number) {
    const gradeWeight = await this.findOne(id, instansiId);
    await this.gradeWeightRepository.remove(gradeWeight);
    return { message: 'Bobot nilai berhasil dihapus' };
  }
}

