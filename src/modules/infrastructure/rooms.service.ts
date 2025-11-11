import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from './entities/room.entity';
import { Building } from './entities/building.entity';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';

@Injectable()
export class RoomsService {
  constructor(
    @InjectRepository(Room)
    private readonly roomsRepository: Repository<Room>,
    @InjectRepository(Building)
    private readonly buildingsRepository: Repository<Building>,
  ) {}

  async create(createDto: CreateRoomDto, instansiId: number) {
    const building = await this.buildingsRepository.findOne({
      where: { id: createDto.buildingId, instansiId },
    });

    if (!building) {
      throw new BadRequestException('Gedung tidak valid atau tidak ditemukan');
    }

    if (createDto.floorNumber > building.floorCount) {
      throw new BadRequestException('Nomor lantai melebihi jumlah lantai gedung');
    }

    const room = this.roomsRepository.create({
      ...createDto,
      instansiId,
    });

    return this.roomsRepository.save(room);
  }

  async findAll(
    instansiId: number,
    filters?: { buildingId?: number; usageType?: string; condition?: string },
  ) {
    const queryBuilder = this.roomsRepository
      .createQueryBuilder('room')
      .leftJoinAndSelect('room.building', 'building')
      .where('room.instansiId = :instansiId', { instansiId })
      .orderBy('building.name', 'ASC')
      .addOrderBy('room.floorNumber', 'ASC')
      .addOrderBy('room.name', 'ASC');

    if (filters?.buildingId) {
      queryBuilder.andWhere('room.buildingId = :buildingId', { buildingId: filters.buildingId });
    }

    if (filters?.usageType) {
      queryBuilder.andWhere('room.usageType = :usageType', { usageType: filters.usageType });
    }

    if (filters?.condition) {
      queryBuilder.andWhere('room.condition = :condition', { condition: filters.condition });
    }

    return queryBuilder.getMany();
  }

  async findOne(id: number, instansiId: number) {
    const room = await this.roomsRepository.findOne({
      where: { id, instansiId },
      relations: ['building', 'building.land'],
    });

    if (!room) {
      throw new NotFoundException('Data ruangan tidak ditemukan');
    }

    return room;
  }

  async update(id: number, updateDto: UpdateRoomDto, instansiId: number) {
    const room = await this.findOne(id, instansiId);
    let targetBuilding = room.building;

    if (updateDto.buildingId && updateDto.buildingId !== room.buildingId) {
      const building = await this.buildingsRepository.findOne({
        where: { id: updateDto.buildingId, instansiId },
      });

      if (!building) {
        throw new BadRequestException('Gedung tujuan tidak valid atau tidak ditemukan');
      }

      const floorToValidate = updateDto.floorNumber ?? room.floorNumber;
      if (floorToValidate > building.floorCount) {
        throw new BadRequestException('Nomor lantai melebihi jumlah lantai gedung');
      }

      targetBuilding = building;
    }

    if (
      updateDto.floorNumber &&
      (!updateDto.buildingId || updateDto.buildingId === room.buildingId) &&
      updateDto.floorNumber > room.building.floorCount
    ) {
      throw new BadRequestException('Nomor lantai melebihi jumlah lantai gedung');
    }

    Object.assign(room, updateDto);
    room.building = targetBuilding;

    return this.roomsRepository.save(room);
  }

  async remove(id: number, instansiId: number) {
    const room = await this.findOne(id, instansiId);
    await this.roomsRepository.remove(room);
    return { message: 'Data ruangan berhasil dihapus' };
  }
}


