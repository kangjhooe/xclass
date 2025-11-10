import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Facility } from './entities/facility.entity';
import { CreateFacilityDto } from './dto/create-facility.dto';

@Injectable()
export class FacilityService {
  constructor(
    @InjectRepository(Facility)
    private facilityRepository: Repository<Facility>,
  ) {}

  async create(createDto: CreateFacilityDto, instansiId: number) {
    const facility = this.facilityRepository.create({
      ...createDto,
      instansiId,
    });

    return await this.facilityRepository.save(facility);
  }

  async findAll(instansiId: number, type?: string) {
    const queryBuilder = this.facilityRepository
      .createQueryBuilder('facility')
      .where('facility.instansiId = :instansiId', { instansiId })
      .orderBy('facility.name', 'ASC');

    if (type) {
      queryBuilder.andWhere('facility.type = :type', { type });
    }

    return queryBuilder.getMany();
  }

  async findOne(id: number, instansiId: number) {
    const facility = await this.facilityRepository.findOne({
      where: { id, instansiId },
    });

    if (!facility) {
      throw new NotFoundException(`Fasilitas dengan ID ${id} tidak ditemukan`);
    }

    return facility;
  }

  async remove(id: number, instansiId: number) {
    const facility = await this.findOne(id, instansiId);
    await this.facilityRepository.remove(facility);
    return { message: 'Fasilitas berhasil dihapus' };
  }
}

