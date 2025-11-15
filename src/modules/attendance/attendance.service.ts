import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attendance } from './entities/attendance.entity';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { Schedule } from '../schedules/entities/schedule.entity';
import { Student } from '../students/entities/student.entity';
import { Teacher } from '../teachers/entities/teacher.entity';
import { User } from '../users/entities/user.entity';
import { parseISO, isAfter, isBefore, isValid as isValidDate, getDay } from 'date-fns';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private attendanceRepository: Repository<Attendance>,
    @InjectRepository(Schedule)
    private scheduleRepository: Repository<Schedule>,
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    @InjectRepository(Teacher)
    private teacherRepository: Repository<Teacher>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createAttendanceDto: CreateAttendanceDto, instansiId: number) {
    await this.ensureStudent(createAttendanceDto.studentId, instansiId);
    const schedule = await this.ensureSchedule(createAttendanceDto.scheduleId, instansiId);
    this.ensureDateMatchesSchedule(createAttendanceDto.date, schedule);

    if (createAttendanceDto.teacherId) {
      await this.ensureTeacher(createAttendanceDto.teacherId, instansiId);
    }

    await this.ensureNotDuplicate({
      studentId: createAttendanceDto.studentId,
      scheduleId: createAttendanceDto.scheduleId,
      date: createAttendanceDto.date,
      instansiId,
    });

    const attendance = this.attendanceRepository.create({
      ...createAttendanceDto,
      instansiId,
      status: createAttendanceDto.status || 'present',
      teacherId: createAttendanceDto.teacherId ?? schedule.teacherId ?? null,
    });
    return await this.attendanceRepository.save(attendance);
  }

  async findAll(
    filters: {
      studentId?: number;
      scheduleId?: number;
      date?: string;
      instansiId: number;
      startDate?: string;
      endDate?: string;
    },
    user?: { userId?: number; role?: string; email?: string },
  ) {
    const { studentId, scheduleId, date, startDate, endDate, instansiId } = filters;

    this.ensureValidDateRange(startDate, endDate);
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

    if (startDate) {
      queryBuilder.andWhere('DATE(attendance.date) >= :startDate', { startDate });
    }

    if (endDate) {
      queryBuilder.andWhere('DATE(attendance.date) <= :endDate', { endDate });
    }

    // Filter by teacher if user is a teacher
    if (user?.role === 'teacher' && user.userId) {
      // Get user to find email
      const userEntity = await this.userRepository.findOne({
        where: { id: user.userId, instansiId },
      });

      if (userEntity) {
        // Find teacher by email or by NIK (if email is generated)
        let teacher = await this.teacherRepository.findOne({
          where: { email: userEntity.email, instansiId },
        });

        // If not found by email, try to find by NIK from generated email
        if (!teacher && userEntity.email?.includes('@xclass.local')) {
          const nikMatch = userEntity.email.match(/teacher_(\d+)@xclass\.local/);
          if (nikMatch && nikMatch[1]) {
            teacher = await this.teacherRepository.findOne({
              where: { nik: nikMatch[1], instansiId },
            });
          }
        }

        if (teacher) {
          // Filter attendance where teacher is assigned or schedule teacher matches
          queryBuilder.andWhere(
            '(attendance.teacherId = :teacherId OR schedule.teacherId = :teacherId)',
            { teacherId: teacher.id },
          );
        } else {
          // If teacher not found, return empty result
          queryBuilder.andWhere('1 = 0');
        }
      } else {
        // If user not found, return empty result
        queryBuilder.andWhere('1 = 0');
      }
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

    const nextScheduleId = updateAttendanceDto.scheduleId ?? attendance.scheduleId;
    const nextStudentId = updateAttendanceDto.studentId ?? attendance.studentId;
    const nextDate =
      updateAttendanceDto.date ??
      (attendance.date instanceof Date
        ? attendance.date.toISOString().split('T')[0]
        : attendance.date);

    await this.ensureStudent(nextStudentId, instansiId);
    const schedule = await this.ensureSchedule(nextScheduleId, instansiId);
    this.ensureDateMatchesSchedule(nextDate, schedule);

    const teacherIdToValidate =
      updateAttendanceDto.teacherId ?? attendance.teacherId ?? schedule.teacherId ?? undefined;
    if (teacherIdToValidate) {
      await this.ensureTeacher(teacherIdToValidate, instansiId);
    }

    await this.ensureNotDuplicate(
      {
        studentId: nextStudentId,
        scheduleId: nextScheduleId,
        date: nextDate,
        instansiId,
      },
      id,
    );

    Object.assign(attendance, updateAttendanceDto);

    if (!updateAttendanceDto.teacherId && !attendance.teacherId && schedule.teacherId) {
      attendance.teacherId = schedule.teacherId;
    }

    return await this.attendanceRepository.save(attendance);
  }

  async remove(id: number, instansiId: number) {
    const attendance = await this.findOne(id, instansiId);
    await this.attendanceRepository.remove(attendance);
    return { message: 'Attendance deleted successfully' };
  }

  async getStats(filters: {
    scheduleId?: number;
    date?: string;
    startDate?: string;
    endDate?: string;
    instansiId: number;
  }) {
    const { scheduleId, date, startDate, endDate, instansiId } = filters;

    this.ensureValidDateRange(startDate, endDate);

    const queryBuilder = this.attendanceRepository
      .createQueryBuilder('attendance')
      .select('attendance.status', 'status')
      .addSelect('COUNT(attendance.id)', 'count')
      .where('attendance.instansiId = :instansiId', { instansiId });

    if (scheduleId) {
      queryBuilder.andWhere('attendance.scheduleId = :scheduleId', { scheduleId });
    }

    if (date) {
      queryBuilder.andWhere('DATE(attendance.date) = :date', { date });
    }

    if (startDate) {
      queryBuilder.andWhere('DATE(attendance.date) >= :startDate', { startDate });
    }

    if (endDate) {
      queryBuilder.andWhere('DATE(attendance.date) <= :endDate', { endDate });
    }

    const rows = await queryBuilder.groupBy('attendance.status').getRawMany<{
      status: Attendance['status'];
      count: string;
    }>();

    const statusKeys = ['present', 'absent', 'late', 'excused'] as const;
    const summary: Record<(typeof statusKeys)[number] | 'total', number> = {
      total: 0,
      present: 0,
      absent: 0,
      late: 0,
      excused: 0,
    };

    rows.forEach((row) => {
      const count = Number(row.count) || 0;
      summary.total += count;
      if (statusKeys.includes(row.status as (typeof statusKeys)[number])) {
        summary[row.status as (typeof statusKeys)[number]] = count;
      }
    });

    return summary;
  }

  async getDailyStats(filters: {
    scheduleId?: number;
    startDate: string;
    endDate: string;
    instansiId: number;
  }) {
    const { scheduleId, startDate, endDate, instansiId } = filters;

    if (!startDate || !endDate) {
      throw new BadRequestException('startDate dan endDate wajib diisi untuk ringkasan harian');
    }

    this.ensureValidDateRange(startDate, endDate);

    const queryBuilder = this.attendanceRepository
      .createQueryBuilder('attendance')
      .select('DATE(attendance.date)', 'date')
      .addSelect('attendance.status', 'status')
      .addSelect('COUNT(attendance.id)', 'count')
      .where('attendance.instansiId = :instansiId', { instansiId })
      .andWhere('DATE(attendance.date) BETWEEN :startDate AND :endDate', { startDate, endDate });

    if (scheduleId) {
      queryBuilder.andWhere('attendance.scheduleId = :scheduleId', { scheduleId });
    }

    const rows = await queryBuilder
      .groupBy('DATE(attendance.date)')
      .addGroupBy('attendance.status')
      .orderBy('DATE(attendance.date)', 'ASC')
      .getRawMany<{ date: string; status: Attendance['status']; count: string }>();

    const statusKeys = ['present', 'absent', 'late', 'excused'] as const;

    const summaryByDate: Record<
      string,
      { date: string; total: number; present: number; absent: number; late: number; excused: number }
    > = {};

    rows.forEach((row) => {
      if (!summaryByDate[row.date]) {
        summaryByDate[row.date] = {
          date: row.date,
          total: 0,
          present: 0,
          absent: 0,
          late: 0,
          excused: 0,
        };
      }

      const count = Number(row.count) || 0;
      summaryByDate[row.date].total += count;

      if (statusKeys.includes(row.status as (typeof statusKeys)[number])) {
        const statusKey = row.status as (typeof statusKeys)[number];
        summaryByDate[row.date][statusKey] += count;
      }
    });

    return Object.values(summaryByDate).sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  }

  async getScheduleStats(filters: {
    instansiId: number;
    startDate?: string;
    endDate?: string;
    status?: Attendance['status'];
  }) {
    const { instansiId, startDate, endDate, status } = filters;

    this.ensureValidDateRange(startDate, endDate);

    const queryBuilder = this.attendanceRepository
      .createQueryBuilder('attendance')
      .leftJoin('attendance.schedule', 'schedule')
      .leftJoin('schedule.classRoom', 'classRoom')
      .leftJoin('schedule.subject', 'subject')
      .leftJoin('schedule.teacher', 'teacher')
      .select('attendance.scheduleId', 'scheduleId')
      .addSelect('COUNT(attendance.id)', 'total')
      .addSelect("SUM(CASE WHEN attendance.status = 'present' THEN 1 ELSE 0 END)", 'present')
      .addSelect("SUM(CASE WHEN attendance.status = 'absent' THEN 1 ELSE 0 END)", 'absent')
      .addSelect("SUM(CASE WHEN attendance.status = 'late' THEN 1 ELSE 0 END)", 'late')
      .addSelect("SUM(CASE WHEN attendance.status = 'excused' THEN 1 ELSE 0 END)", 'excused')
      .addSelect('schedule.dayOfWeek', 'dayOfWeek')
      .addSelect('schedule.startTime', 'startTime')
      .addSelect('schedule.endTime', 'endTime')
      .addSelect('schedule.isActive', 'isActive')
      .addSelect('classRoom.name', 'className')
      .addSelect('subject.name', 'subjectName')
      .addSelect('teacher.name', 'teacherName')
      .where('attendance.instansiId = :instansiId', { instansiId });

    if (startDate) {
      queryBuilder.andWhere('DATE(attendance.date) >= :startDate', { startDate });
    }

    if (endDate) {
      queryBuilder.andWhere('DATE(attendance.date) <= :endDate', { endDate });
    }

    if (status) {
      queryBuilder.andWhere('attendance.status = :status', { status });
    }

    const rows = await queryBuilder
      .groupBy('attendance.scheduleId')
      .addGroupBy('schedule.dayOfWeek')
      .addGroupBy('schedule.startTime')
      .addGroupBy('schedule.endTime')
      .addGroupBy('schedule.isActive')
      .addGroupBy('classRoom.name')
      .addGroupBy('subject.name')
      .addGroupBy('teacher.name')
      .orderBy('total', 'DESC')
      .getRawMany<{
        scheduleId: number;
        total: string;
        present: string;
        absent: string;
        late: string;
        excused: string;
        dayOfWeek: number;
        startTime: string;
        endTime: string;
        isActive: number;
        className: string;
        subjectName: string;
        teacherName: string;
      }>();

    return rows.map((row) => ({
      scheduleId: row.scheduleId,
      total: Number(row.total) || 0,
      present: Number(row.present) || 0,
      absent: Number(row.absent) || 0,
      late: Number(row.late) || 0,
      excused: Number(row.excused) || 0,
      schedule: {
        dayOfWeek: row.dayOfWeek,
        startTime: row.startTime,
        endTime: row.endTime,
        isActive: Boolean(row.isActive),
        className: row.className || null,
        subjectName: row.subjectName || null,
        teacherName: row.teacherName || null,
      },
    }));
  }

  private async ensureSchedule(scheduleId: number, instansiId: number) {
    const schedule = await this.scheduleRepository.findOne({
      where: { id: scheduleId, instansiId },
      select: ['id', 'instansiId', 'teacherId', 'isActive', 'dayOfWeek'],
    });

    if (!schedule) {
      throw new BadRequestException('Schedule tidak ditemukan atau tidak valid');
    }

    return schedule;
  }

  private async ensureStudent(studentId: number, instansiId: number) {
    const student = await this.studentRepository.findOne({
      where: { id: studentId, instansiId },
      select: ['id'],
    });

    if (!student) {
      throw new BadRequestException('Siswa tidak ditemukan atau bukan bagian dari instansi ini');
    }
  }

  private async ensureTeacher(teacherId: number, instansiId: number) {
    const teacher = await this.teacherRepository.findOne({
      where: { id: teacherId, instansiId },
      select: ['id'],
    });

    if (!teacher) {
      throw new BadRequestException('Guru tidak ditemukan atau bukan bagian dari instansi ini');
    }
  }

  private ensureDateMatchesSchedule(date: string, schedule: Schedule) {
    const parsed = parseISO(date);

    if (!isValidDate(parsed)) {
      throw new BadRequestException('Tanggal absensi tidak valid. Gunakan format YYYY-MM-DD.');
    }

    const dayOfWeek = getDay(parsed);

    if (dayOfWeek !== schedule.dayOfWeek) {
      throw new BadRequestException(
        'Tanggal absensi tidak sesuai dengan hari yang dijadwalkan untuk jadwal tersebut',
      );
    }
  }

  private async ensureNotDuplicate(
    params: { studentId: number; scheduleId: number; date: string; instansiId: number },
    excludeAttendanceId?: number,
  ) {
    const existing = await this.attendanceRepository
      .createQueryBuilder('attendance')
      .where('attendance.instansiId = :instansiId', { instansiId: params.instansiId })
      .andWhere('attendance.studentId = :studentId', { studentId: params.studentId })
      .andWhere('attendance.scheduleId = :scheduleId', { scheduleId: params.scheduleId })
      .andWhere('DATE(attendance.date) = :date', { date: params.date })
      .andWhere(excludeAttendanceId ? 'attendance.id != :excludeId' : '1=1', {
        excludeId: excludeAttendanceId,
      })
      .getOne();

    if (existing) {
      throw new BadRequestException('Data absensi untuk siswa, jadwal, dan tanggal tersebut sudah ada');
    }
  }

  private ensureValidDateRange(startDate?: string, endDate?: string) {
    if (!startDate || !endDate) {
      return;
    }

    const start = parseISO(startDate);
    const end = parseISO(endDate);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      throw new BadRequestException('Format tanggal tidak valid. Gunakan format YYYY-MM-DD.');
    }

    if (isAfter(start, end)) {
      throw new BadRequestException('startDate tidak boleh lebih besar dari endDate');
    }

    const upperBound = new Date();
    if (isAfter(start, upperBound) || isAfter(end, upperBound)) {
      throw new BadRequestException('Rentang tanggal tidak boleh melewati hari ini');
    }

    const lowerBound = parseISO('2000-01-01');
    if (isBefore(end, lowerBound)) {
      throw new BadRequestException('Rentang tanggal terlalu lama. Gunakan tanggal setelah tahun 2000.');
    }
  }
}
