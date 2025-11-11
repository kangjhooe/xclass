import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Land, LandOwnershipStatus } from './entities/land.entity';
import { CreateLandDto } from './dto/create-land.dto';
import { UpdateLandDto } from './dto/update-land.dto';

@Injectable()
export class LandsService {
  constructor(
    @InjectRepository(Land)
    private readonly landsRepository: Repository<Land>,
  ) {}

  async create(createDto: CreateLandDto, instansiId: number) {
    const land = this.landsRepository.create({
      ...createDto,
      instansiId,
    });

    return this.landsRepository.save(land);
  }

  async findAll(instansiId: number, filters?: { search?: string; ownershipStatus?: LandOwnershipStatus }) {
    const queryBuilder = this.landsRepository
      .createQueryBuilder('land')
      .where('land.instansiId = :instansiId', { instansiId })
      .orderBy('land.name', 'ASC');

    if (filters?.search) {
      queryBuilder.andWhere('LOWER(land.name) LIKE :search', {
        search: `%${filters.search.toLowerCase()}%`,
      });
    }

    if (filters?.ownershipStatus) {
      queryBuilder.andWhere('land.ownershipStatus = :ownershipStatus', {
        ownershipStatus: filters.ownershipStatus,
      });
    }

    return queryBuilder.getMany();
  }

  async findOne(id: number, instansiId: number) {
    const land = await this.landsRepository.findOne({
      where: { id, instansiId },
      relations: ['buildings'],
    });

    if (!land) {
      throw new NotFoundException('Data lahan tidak ditemukan');
    }

    return land;
  }

  async update(id: number, updateDto: UpdateLandDto, instansiId: number) {
    const land = await this.findOne(id, instansiId);
    Object.assign(land, updateDto);
    return this.landsRepository.save(land);
  }

  async remove(id: number, instansiId: number) {
    const land = await this.findOne(id, instansiId);
    await this.landsRepository.remove(land);
    return { message: 'Data lahan berhasil dihapus' };
  }
}


