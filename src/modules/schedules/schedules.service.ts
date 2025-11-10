import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Schedule } from './entities/schedule.entity';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';

@Injectable()
export class SchedulesService {
  constructor(
    @InjectRepository(Schedule)
    private schedulesRepository: Repository<Schedule>,
  ) {}

  async create(createScheduleDto: CreateScheduleDto, instansiId: number) {
    const schedule = this.schedulesRepository.create({
      ...createScheduleDto,
      instansiId,
      isActive: createScheduleDto.isActive ?? true,
    });
    return await this.schedulesRepository.save(schedule);
  }

  async findAll(filters: {
    classId?: number;
    teacherId?: number;
    dayOfWeek?: number;
    instansiId: number;
  }) {
    const { classId, teacherId, dayOfWeek, instansiId } = filters;
    const queryBuilder = this.schedulesRepository
      .createQueryBuilder('schedule')
      .where('schedule.instansiId = :instansiId', { instansiId })
      .leftJoinAndSelect('schedule.classRoom', 'classRoom')
      .leftJoinAndSelect('schedule.subject', 'subject')
      .leftJoinAndSelect('schedule.teacher', 'teacher');

    if (classId) {
      queryBuilder.andWhere('schedule.classId = :classId', { classId });
    }

    if (teacherId) {
      queryBuilder.andWhere('schedule.teacherId = :teacherId', { teacherId });
    }

    if (dayOfWeek !== undefined) {
      queryBuilder.andWhere('schedule.dayOfWeek = :dayOfWeek', { dayOfWeek });
    }

    queryBuilder.orderBy('schedule.dayOfWeek', 'ASC').addOrderBy('schedule.startTime', 'ASC');

    return await queryBuilder.getMany();
  }

  async findOne(id: number, instansiId: number) {
    const schedule = await this.schedulesRepository.findOne({
      where: { id, instansiId },
      relations: ['classRoom', 'subject', 'teacher'],
    });

    if (!schedule) {
      throw new NotFoundException(`Schedule with ID ${id} not found`);
    }

    return schedule;
  }

  async update(id: number, updateScheduleDto: UpdateScheduleDto, instansiId: number) {
    const schedule = await this.findOne(id, instansiId);
    Object.assign(schedule, updateScheduleDto);
    return await this.schedulesRepository.save(schedule);
  }

  async remove(id: number, instansiId: number) {
    const schedule = await this.findOne(id, instansiId);
    await this.schedulesRepository.remove(schedule);
    return { message: 'Schedule deleted successfully' };
  }
}
