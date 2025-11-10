import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClassRoom } from './entities/class-room.entity';
import { CreateClassRoomDto } from './dto/create-class-room.dto';
import { UpdateClassRoomDto } from './dto/update-class-room.dto';

@Injectable()
export class ClassesService {
  constructor(
    @InjectRepository(ClassRoom)
    private classRoomRepository: Repository<ClassRoom>,
  ) {}

  async create(createClassRoomDto: CreateClassRoomDto, instansiId: number) {
    const classRoom = this.classRoomRepository.create({
      ...createClassRoomDto,
      instansiId,
      isActive: createClassRoomDto.isActive ?? true,
    });
    return await this.classRoomRepository.save(classRoom);
  }

  async findAll(filters: { search?: string; instansiId: number }) {
    const { search, instansiId } = filters;
    const queryBuilder = this.classRoomRepository
      .createQueryBuilder('classRoom')
      .where('classRoom.instansiId = :instansiId', { instansiId })
      .leftJoinAndSelect('classRoom.homeroomTeacher', 'teacher')
      .leftJoinAndSelect('classRoom.students', 'students')
      .leftJoinAndSelect('classRoom.room', 'room');

    if (search) {
      queryBuilder.andWhere(
        '(classRoom.name LIKE :search OR classRoom.level LIKE :search)',
        { search: `%${search}%` },
      );
    }

    return await queryBuilder.getMany();
  }

  async findOne(id: number, instansiId: number) {
    const classRoom = await this.classRoomRepository.findOne({
      where: { id, instansiId },
      relations: ['homeroomTeacher', 'students', 'schedules', 'room'],
    });

    if (!classRoom) {
      throw new NotFoundException(`ClassRoom with ID ${id} not found`);
    }

    return classRoom;
  }

  async update(id: number, updateClassRoomDto: UpdateClassRoomDto, instansiId: number) {
    const classRoom = await this.findOne(id, instansiId);
    Object.assign(classRoom, updateClassRoomDto);
    return await this.classRoomRepository.save(classRoom);
  }

  async remove(id: number, instansiId: number) {
    const classRoom = await this.findOne(id, instansiId);
    await this.classRoomRepository.remove(classRoom);
    return { message: 'ClassRoom deleted successfully' };
  }
}
