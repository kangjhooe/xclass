import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attendance } from './entities/attendance.entity';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private attendanceRepository: Repository<Attendance>,
  ) {}

  async create(createAttendanceDto: CreateAttendanceDto, instansiId: number) {
    const attendance = this.attendanceRepository.create({
      ...createAttendanceDto,
      instansiId,
      status: createAttendanceDto.status || 'present',
    });
    return await this.attendanceRepository.save(attendance);
  }

  async findAll(filters: {
    studentId?: number;
    scheduleId?: number;
    date?: string;
    instansiId: number;
  }) {
    const { studentId, scheduleId, date, instansiId } = filters;
    const queryBuilder = this.attendanceRepository
      .createQueryBuilder('attendance')
      .where('attendance.instansiId = :instansiId', { instansiId })
      .leftJoinAndSelect('attendance.student', 'student')
      .leftJoinAndSelect('attendance.schedule', 'schedule')
      .leftJoinAndSelect('attendance.teacher', 'teacher');

    if (studentId) {
      queryBuilder.andWhere('attendance.studentId = :studentId', { studentId });
    }

    if (scheduleId) {
      queryBuilder.andWhere('attendance.scheduleId = :scheduleId', { scheduleId });
    }

    if (date) {
      queryBuilder.andWhere('DATE(attendance.date) = :date', { date });
    }

    queryBuilder.orderBy('attendance.date', 'DESC');

    return await queryBuilder.getMany();
  }

  async findOne(id: number, instansiId: number) {
    const attendance = await this.attendanceRepository.findOne({
      where: { id, instansiId },
      relations: ['student', 'schedule', 'teacher'],
    });

    if (!attendance) {
      throw new NotFoundException(`Attendance with ID ${id} not found`);
    }

    return attendance;
  }

  async update(id: number, updateAttendanceDto: UpdateAttendanceDto, instansiId: number) {
    const attendance = await this.findOne(id, instansiId);
    Object.assign(attendance, updateAttendanceDto);
    return await this.attendanceRepository.save(attendance);
  }

  async remove(id: number, instansiId: number) {
    const attendance = await this.findOne(id, instansiId);
    await this.attendanceRepository.remove(attendance);
    return { message: 'Attendance deleted successfully' };
  }
}
