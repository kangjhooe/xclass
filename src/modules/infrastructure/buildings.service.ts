import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Building } from './entities/building.entity';
import { Land } from './entities/land.entity';
import { CreateBuildingDto } from './dto/create-building.dto';
import { UpdateBuildingDto } from './dto/update-building.dto';

@Injectable()
export class BuildingsService {
  constructor(
    @InjectRepository(Building)
    private readonly buildingsRepository: Repository<Building>,
    @InjectRepository(Land)
    private readonly landsRepository: Repository<Land>,
  ) {}

  async create(createDto: CreateBuildingDto, instansiId: number) {
    const land = await this.landsRepository.findOne({
      where: { id: createDto.landId, instansiId },
    });

    if (!land) {
      throw new BadRequestException('Lahan tidak valid atau tidak ditemukan');
    }

    const building = this.buildingsRepository.create({
      ...createDto,
      instansiId,
    });

    return this.buildingsRepository.save(building);
  }

  async findAll(instansiId: number, filters?: { landId?: number }) {
    const queryBuilder = this.buildingsRepository
      .createQueryBuilder('building')
      .leftJoinAndSelect('building.land', 'land')
      .where('building.instansiId = :instansiId', { instansiId })
      .orderBy('building.name', 'ASC');

    if (filters?.landId) {
      queryBuilder.andWhere('building.landId = :landId', { landId: filters.landId });
    }

    return queryBuilder.getMany();
  }

  async findOne(id: number, instansiId: number) {
    const building = await this.buildingsRepository.findOne({
      where: { id, instansiId },
      relations: ['land', 'rooms'],
    });

    if (!building) {
      throw new NotFoundException('Data gedung tidak ditemukan');
    }

    return building;
  }

  async update(id: number, updateDto: UpdateBuildingDto, instansiId: number) {
    const building = await this.findOne(id, instansiId);

    if (updateDto.landId && updateDto.landId !== building.landId) {
      const land = await this.landsRepository.findOne({
        where: { id: updateDto.landId, instansiId },
      });

      if (!land) {
        throw new BadRequestException('Lahan tujuan tidak valid atau tidak ditemukan');
      }
    }

    Object.assign(building, updateDto);
    return this.buildingsRepository.save(building);
  }

  async remove(id: number, instansiId: number) {
    const building = await this.findOne(id, instansiId);
    await this.buildingsRepository.remove(building);
    return { message: 'Data gedung berhasil dihapus' };
  }
}


