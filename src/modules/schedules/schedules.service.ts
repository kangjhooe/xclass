import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Schedule } from './entities/schedule.entity';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { CheckScheduleConflictDto } from './dto/check-schedule-conflict.dto';

@Injectable()
export class SchedulesService {
  constructor(
    @InjectRepository(Schedule)
    private schedulesRepository: Repository<Schedule>,
  ) {}

  async create(createScheduleDto: CreateScheduleDto, instansiId: number) {
    this.ensureValidTimeRange(createScheduleDto.startTime, createScheduleDto.endTime);

    const conflicts = await this.findConflictingSchedules(
      {
        ...createScheduleDto,
      },
      instansiId,
    );

    if (conflicts.hasConflict) {
      throw new BadRequestException({
        message: 'Schedule conflicts detected',
        conflicts: conflicts.conflicts,
      });
    }

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

    if (updateScheduleDto.startTime || updateScheduleDto.endTime) {
      this.ensureValidTimeRange(
        updateScheduleDto.startTime ?? schedule.startTime,
        updateScheduleDto.endTime ?? schedule.endTime,
      );
    }

    const conflicts = await this.checkScheduleConflicts(
      {
        classId: updateScheduleDto.classId ?? schedule.classId,
        subjectId: updateScheduleDto.subjectId ?? schedule.subjectId,
        teacherId: updateScheduleDto.teacherId ?? schedule.teacherId,
        dayOfWeek: updateScheduleDto.dayOfWeek ?? schedule.dayOfWeek,
        startTime: updateScheduleDto.startTime ?? schedule.startTime,
        endTime: updateScheduleDto.endTime ?? schedule.endTime,
        room: updateScheduleDto.room ?? schedule.room,
        scheduleId: id,
      },
      instansiId,
    );

    if (conflicts.hasConflict) {
      throw new BadRequestException({
        message: 'Schedule conflicts detected',
        conflicts: conflicts.conflicts,
      });
    }

    Object.assign(schedule, updateScheduleDto);
    return await this.schedulesRepository.save(schedule);
  }

  async remove(id: number, instansiId: number) {
    const schedule = await this.findOne(id, instansiId);
    await this.schedulesRepository.remove(schedule);
    return { message: 'Schedule deleted successfully' };
  }

  async checkScheduleConflicts(dto: CheckScheduleConflictDto, instansiId: number) {
    this.ensureValidTimeRange(dto.startTime, dto.endTime);
    return this.findConflictingSchedules(dto, instansiId);
  }

  private ensureValidTimeRange(startTime: string, endTime: string) {
    const startMinutes = this.timeToMinutes(startTime);
    const endMinutes = this.timeToMinutes(endTime);

    if (startMinutes >= endMinutes) {
      throw new BadRequestException('startTime must be earlier than endTime');
    }
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map((value) => parseInt(value, 10));
    if (Number.isNaN(hours) || Number.isNaN(minutes)) {
      throw new BadRequestException('Invalid time format. Expected HH:mm');
    }
    return hours * 60 + minutes;
  }

  private async findConflictingSchedules(
    dto: CheckScheduleConflictDto,
    instansiId: number,
  ): Promise<{
    hasConflict: boolean;
    conflicts: Array<{
      type: 'class' | 'teacher' | 'room';
      schedules: Schedule[];
    }>;
  }> {
    const { classId, teacherId, dayOfWeek, startTime, endTime, room, scheduleId } = dto;

    const baseQuery = this.schedulesRepository
      .createQueryBuilder('schedule')
      .where('schedule.instansiId = :instansiId', { instansiId })
      .andWhere('schedule.dayOfWeek = :dayOfWeek', { dayOfWeek })
      .andWhere('schedule.startTime < :endTime AND schedule.endTime > :startTime', {
        startTime,
        endTime,
      })
      .leftJoinAndSelect('schedule.classRoom', 'classRoom')
      .leftJoinAndSelect('schedule.subject', 'subject')
      .leftJoinAndSelect('schedule.teacher', 'teacher');

    if (scheduleId) {
      baseQuery.andWhere('schedule.id != :scheduleId', { scheduleId });
    }

    const conflicts: Array<{
      type: 'class' | 'teacher' | 'room';
      schedules: Schedule[];
    }> = [];

    const [classConflicts, teacherConflicts, roomConflicts] = await Promise.all([
      baseQuery.clone().andWhere('schedule.classId = :classId', { classId }).getMany(),
      baseQuery.clone().andWhere('schedule.teacherId = :teacherId', { teacherId }).getMany(),
      room
        ? baseQuery.clone().andWhere('schedule.room = :room', { room }).getMany()
        : Promise.resolve([]),
    ]);

    if (classConflicts.length > 0) {
      conflicts.push({ type: 'class', schedules: classConflicts });
    }

    if (teacherConflicts.length > 0) {
      conflicts.push({ type: 'teacher', schedules: teacherConflicts });
    }

    if (roomConflicts.length > 0) {
      conflicts.push({ type: 'room', schedules: roomConflicts });
    }

    return {
      hasConflict: conflicts.length > 0,
      conflicts,
    };
  }
}
