import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from '../students/entities/student.entity';
import { StudentGrade } from '../grades/entities/student-grade.entity';
import { Attendance } from '../attendance/entities/attendance.entity';
import { Schedule } from '../schedules/entities/schedule.entity';
import { Announcement } from '../announcement/entities/announcement.entity';
import { Exam } from '../exams/entities/exam.entity';

@Injectable()
export class StudentPortalService {
  constructor(
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    @InjectRepository(StudentGrade)
    private gradeRepository: Repository<StudentGrade>,
    @InjectRepository(Attendance)
    private attendanceRepository: Repository<Attendance>,
    @InjectRepository(Schedule)
    private scheduleRepository: Repository<Schedule>,
    @InjectRepository(Announcement)
    private announcementRepository: Repository<Announcement>,
    @InjectRepository(Exam)
    private examRepository: Repository<Exam>,
  ) {}

  async getDashboard(userEmail: string, instansiId: number) {
    const student = await this.studentRepository.findOne({
      where: { email: userEmail, instansiId },
      relations: ['classRoom'],
    });

    if (!student) {
      throw new NotFoundException('Data siswa tidak ditemukan');
    }

    const stats = {
      totalGrades: await this.gradeRepository.count({
        where: { studentId: student.id },
      }),
      totalAttendance: await this.attendanceRepository.count({
        where: { studentId: student.id },
      }),
      attendanceRate: await this.calculateAttendanceRate(student.id),
      averageGrade: await this.calculateAverageGrade(student.id),
    };

    const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
    const todaySchedules = await this.scheduleRepository.find({
      where: { classId: student.classId, dayOfWeek: today },
      relations: ['subject', 'teacher', 'classRoom'],
      order: { startTime: 'ASC' },
    });

    const announcements = await this.announcementRepository.find({
      where: {
        instansiId,
        status: 'published',
      },
      order: { createdAt: 'DESC' },
      take: 5,
    });

    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    const upcomingExams = await this.examRepository
      .createQueryBuilder('exam')
      .where('exam.instansiId = :instansiId', { instansiId })
      .andWhere('exam.startTime >= :today', { today: todayDate })
      .orderBy('exam.startTime', 'ASC')
      .take(5)
      .getMany();

    return {
      student,
      stats,
      todaySchedules,
      announcements,
      upcomingExams,
    };
  }

  async getProfile(userEmail: string, instansiId: number) {
    const student = await this.studentRepository.findOne({
      where: { email: userEmail, instansiId },
      relations: ['classRoom'],
    });

    if (!student) {
      throw new NotFoundException('Data siswa tidak ditemukan');
    }

    return student;
  }

  async updateProfile(
    userEmail: string,
    instansiId: number,
    updateData: { email?: string; phone?: string; address?: string },
  ) {
    const student = await this.studentRepository.findOne({
      where: { email: userEmail, instansiId },
    });

    if (!student) {
      throw new NotFoundException('Data siswa tidak ditemukan');
    }

    if (updateData.phone) {
      student.phone = updateData.phone;
    }
    if (updateData.address) {
      student.address = updateData.address;
    }

    return await this.studentRepository.save(student);
  }

  async getGrades(
    userEmail: string,
    instansiId: number,
    filters?: { subjectId?: number; semester?: string },
  ) {
    const student = await this.studentRepository.findOne({
      where: { email: userEmail, instansiId },
    });

    if (!student) {
      throw new NotFoundException('Data siswa tidak ditemukan');
    }

    const query = this.gradeRepository
      .createQueryBuilder('grade')
      .where('grade.studentId = :studentId', { studentId: student.id })
      .leftJoinAndSelect('grade.subject', 'subject')
      .leftJoinAndSelect('grade.teacher', 'teacher');

    if (filters?.subjectId) {
      query.andWhere('grade.subjectId = :subjectId', {
        subjectId: filters.subjectId,
      });
    }


    return await query.orderBy('grade.createdAt', 'DESC').getMany();
  }

  async getAttendance(
    userEmail: string,
    instansiId: number,
    filters?: { startDate?: Date; endDate?: Date },
  ) {
    const student = await this.studentRepository.findOne({
      where: { email: userEmail, instansiId },
    });

    if (!student) {
      throw new NotFoundException('Data siswa tidak ditemukan');
    }

    const query = this.attendanceRepository
      .createQueryBuilder('attendance')
      .where('attendance.studentId = :studentId', { studentId: student.id });

    if (filters?.startDate) {
      query.andWhere('attendance.date >= :startDate', {
        startDate: filters.startDate,
      });
    }

    if (filters?.endDate) {
      query.andWhere('attendance.date <= :endDate', {
        endDate: filters.endDate,
      });
    }

    const attendances = await query
      .orderBy('attendance.date', 'DESC')
      .getMany();

    const stats = {
      total: await this.attendanceRepository.count({
        where: { studentId: student.id },
      }),
      present: await this.attendanceRepository.count({
        where: { studentId: student.id, status: 'present' },
      }),
      absent: await this.attendanceRepository.count({
        where: { studentId: student.id, status: 'absent' },
      }),
      late: await this.attendanceRepository.count({
        where: { studentId: student.id, status: 'late' },
      }),
      excused: await this.attendanceRepository.count({
        where: { studentId: student.id, status: 'excused' },
      }),
    };

    return { attendances, stats };
  }

  async getSchedule(userEmail: string, instansiId: number) {
    const student = await this.studentRepository.findOne({
      where: { email: userEmail, instansiId },
    });

    if (!student) {
      throw new NotFoundException('Data siswa tidak ditemukan');
    }

    const schedules = await this.scheduleRepository.find({
      where: { classId: student.classId },
      relations: ['subject', 'teacher', 'classRoom'],
      order: { dayOfWeek: 'ASC', startTime: 'ASC' },
    });

    // Group by day
    const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const grouped = schedules.reduce((acc, schedule) => {
      const dayName = dayNames[schedule.dayOfWeek] || `Hari ${schedule.dayOfWeek}`;
      if (!acc[dayName]) {
        acc[dayName] = [];
      }
      acc[dayName].push(schedule);
      return acc;
    }, {});

    return grouped;
  }

  async getAnnouncements(userEmail: string, instansiId: number) {
    const student = await this.studentRepository.findOne({
      where: { email: userEmail, instansiId },
    });

    if (!student) {
      throw new NotFoundException('Data siswa tidak ditemukan');
    }

    return await this.announcementRepository.find({
      where: {
        instansiId,
        status: 'published',
      },
      order: { createdAt: 'DESC' },
    });
  }

  async getExams(userEmail: string, instansiId: number) {
    const student = await this.studentRepository.findOne({
      where: { email: userEmail, instansiId },
    });

    if (!student) {
      throw new NotFoundException('Data siswa tidak ditemukan');
    }

    return await this.examRepository
      .createQueryBuilder('exam')
      .where('exam.instansiId = :instansiId', { instansiId })
      .orderBy('exam.startTime', 'ASC')
      .getMany();
  }

  private async calculateAverageGrade(studentId: number): Promise<number> {
    const result = await this.gradeRepository
      .createQueryBuilder('grade')
      .select('AVG(grade.score)', 'avg')
      .where('grade.studentId = :studentId', { studentId })
      .getRawOne();

    return parseFloat(result?.avg || '0') || 0;
  }

  private async calculateAttendanceRate(studentId: number): Promise<number> {
    const total = await this.attendanceRepository.count({
      where: { studentId },
    });

    if (total === 0) {
      return 0;
    }

    const present = await this.attendanceRepository.count({
      where: { studentId, status: 'present' },
    });

    return Math.round((present / total) * 100 * 100) / 100;
  }
}

