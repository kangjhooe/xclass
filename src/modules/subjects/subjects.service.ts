import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subject } from './entities/subject.entity';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';

@Injectable()
export class SubjectsService {
  constructor(
    @InjectRepository(Subject)
    private subjectsRepository: Repository<Subject>,
  ) {}

  async create(createSubjectDto: CreateSubjectDto, instansiId: number) {
    const subject = this.subjectsRepository.create({
      ...createSubjectDto,
      instansiId,
      isActive: createSubjectDto.isActive ?? true,
    });
    return await this.subjectsRepository.save(subject);
  }

  async findAll(filters: { search?: string; instansiId: number }) {
    const { search, instansiId } = filters;
    const queryBuilder = this.subjectsRepository
      .createQueryBuilder('subject')
      .where('subject.instansiId = :instansiId', { instansiId });

    if (search) {
      queryBuilder.andWhere(
        '(subject.name LIKE :search OR subject.code LIKE :search)',
        { search: `%${search}%` },
      );
    }

    queryBuilder.orderBy('subject.name', 'ASC');

    return await queryBuilder.getMany();
  }

  async findOne(id: number, instansiId: number) {
    const subject = await this.subjectsRepository.findOne({
      where: { id, instansiId },
      relations: ['teachers', 'schedules'],
    });

    if (!subject) {
      throw new NotFoundException(`Subject with ID ${id} not found`);
    }

    return subject;
  }

  async update(id: number, updateSubjectDto: UpdateSubjectDto, instansiId: number) {
    const subject = await this.findOne(id, instansiId);
    Object.assign(subject, updateSubjectDto);
    return await this.subjectsRepository.save(subject);
  }

  async remove(id: number, instansiId: number) {
    const subject = await this.findOne(id, instansiId);
    await this.subjectsRepository.remove(subject);
    return { message: 'Subject deleted successfully' };
  }
}
