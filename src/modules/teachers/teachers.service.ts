import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Teacher } from './entities/teacher.entity';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';

@Injectable()
export class TeachersService {
  constructor(
    @InjectRepository(Teacher)
    private teachersRepository: Repository<Teacher>,
  ) {}

  async create(createTeacherDto: CreateTeacherDto, instansiId: number) {
    const teacher = this.teachersRepository.create({
      ...createTeacherDto,
      instansiId,
      isActive: createTeacherDto.isActive ?? true,
    });
    return await this.teachersRepository.save(teacher);
  }

  async findAll(filters: { search?: string; instansiId: number }) {
    const { search, instansiId } = filters;
    const queryBuilder = this.teachersRepository
      .createQueryBuilder('teacher')
      .where('teacher.instansiId = :instansiId', { instansiId });

    if (search) {
      queryBuilder.andWhere(
        '(teacher.name LIKE :search OR teacher.employeeNumber LIKE :search OR teacher.nip LIKE :search OR teacher.email LIKE :search)',
        { search: `%${search}%` },
      );
    }

    queryBuilder.orderBy('teacher.name', 'ASC');

    return await queryBuilder.getMany();
  }

  async findOne(id: number, instansiId: number) {
    const teacher = await this.teachersRepository.findOne({
      where: { id, instansiId },
      relations: ['classRooms', 'schedules', 'subjects'],
    });

    if (!teacher) {
      throw new NotFoundException(`Teacher with ID ${id} not found`);
    }

    return teacher;
  }

  async update(id: number, updateTeacherDto: UpdateTeacherDto, instansiId: number) {
    const teacher = await this.findOne(id, instansiId);
    Object.assign(teacher, updateTeacherDto);
    return await this.teachersRepository.save(teacher);
  }

  async remove(id: number, instansiId: number) {
    const teacher = await this.findOne(id, instansiId);
    await this.teachersRepository.remove(teacher);
    return { message: 'Teacher deleted successfully' };
  }
}
