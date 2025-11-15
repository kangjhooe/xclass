import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Student } from '../students/entities/student.entity';
import { StudentGrade } from '../grades/entities/student-grade.entity';
import { Attendance } from '../attendance/entities/attendance.entity';
import { Schedule } from '../schedules/entities/schedule.entity';
import { Announcement } from '../announcement/entities/announcement.entity';
import { Exam } from '../exams/entities/exam.entity';
import { Tenant } from '../tenant/entities/tenant.entity';
import { User } from '../users/entities/user.entity';
import { Teacher } from '../teachers/entities/teacher.entity';
import { ClassRoom } from '../classes/entities/class-room.entity';

@Injectable()
export class MobileApiService {
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
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Teacher)
    private teacherRepository: Repository<Teacher>,
    @InjectRepository(ClassRoom)
    private classRoomRepository: Repository<ClassRoom>,
    private jwtService: JwtService,
  ) {}

  async login(email: string, password: string, tenantNpsn: string) {
    const tenant = await this.tenantRepository.findOne({
      where: { npsn: tenantNpsn },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant tidak ditemukan');
    }

    // Find user by email and tenant
    const user = await this.userRepository.findOne({
      where: { email, instansiId: tenant.id },
    });

    if (!user) {
      throw new UnauthorizedException('Email atau password salah');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email atau password salah');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedException('Akun Anda tidak aktif');
    }

    // Update last login
    await this.userRepository.update(user.id, { lastLoginAt: new Date() });

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      instansiId: tenant.id,
    };

    const token = this.jwtService.sign(payload);

    const { password: _, rememberToken, ...userWithoutPassword } = user;

    return {
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      tenant: {
        npsn: tenant.npsn,
        name: tenant.name,
      },
    };
  }

  async getStudentDashboard(userEmail: string, instansiId: number) {
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

    return {
      success: true,
      data: {
        student: {
          id: student.id,
          name: student.name,
          studentNumber: student.studentNumber,
          class: student.classRoom?.name || null,
        },
        stats,
        todaySchedules: todaySchedules.map((s) => ({
          id: s.id,
          subject: s.subject?.name || null,
          teacher: s.teacher?.name || null,
          time: `${s.startTime} - ${s.endTime}`,
          room: s.classRoom?.name || null,
        })),
        announcements: announcements.map((a) => ({
          id: a.id,
          title: a.title,
          content: a.content,
          created_at: a.createdAt.toLocaleDateString('id-ID'),
        })),
      },
    };
  }

  async getStudentGrades(
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

    const grades = await query.orderBy('grade.createdAt', 'DESC').getMany();

    const assessmentLabels: Record<string, string> = {
      NH: 'Nilai Harian (NH)',
      PTS: 'Penilaian Tengah Semester (PTS)',
      PAS: 'Penilaian Akhir Semester (PAS)',
      PROJECT: 'Nilai Proyek',
      OTHER: 'Penilaian Lainnya',
    };

    return {
      success: true,
      data: grades.map((g) => ({
        id: g.id,
        subject: g.subject?.name || null,
        teacher: g.teacher?.name || null,
        score: g.score,
        type:
          g.assessmentType === 'OTHER'
            ? g.customAssessmentLabel || assessmentLabels.OTHER
            : assessmentLabels[g.assessmentType] || g.assessmentType,
        date: g.createdAt.toLocaleDateString('id-ID'),
      })),
    };
  }

  async getStudentAttendance(
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
    };

    return {
      success: true,
      data: {
        attendances: attendances.map((a) => ({
          id: a.id,
          date: a.date.toLocaleDateString('id-ID'),
          status: a.status,
          note: a.notes || null,
        })),
        stats,
      },
    };
  }

  async getStudentSchedule(userEmail: string, instansiId: number) {
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

    const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const grouped = schedules.reduce((acc, schedule) => {
      const dayName = dayNames[schedule.dayOfWeek] || `Hari ${schedule.dayOfWeek}`;
      if (!acc[dayName]) {
        acc[dayName] = [];
      }
      acc[dayName].push({
        id: schedule.id,
        subject: schedule.subject?.name || null,
        teacher: schedule.teacher?.name || null,
        time: `${schedule.startTime} - ${schedule.endTime}`,
        room: schedule.classRoom?.name || null,
      });
      return acc;
    }, {});

    return {
      success: true,
      data: grouped,
    };
  }

  async getAnnouncements(userEmail: string, instansiId: number) {
    const student = await this.studentRepository.findOne({
      where: { email: userEmail, instansiId },
    });

    if (!student) {
      throw new NotFoundException('Data siswa tidak ditemukan');
    }

    const announcements = await this.announcementRepository.find({
      where: {
        instansiId,
        status: 'published',
      },
      order: { createdAt: 'DESC' },
    });

    return {
      success: true,
      data: announcements.map((a) => ({
        id: a.id,
        title: a.title,
        content: a.content,
        priority: a.priority,
        created_at: a.createdAt.toLocaleDateString('id-ID'),
      })),
    };
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

  // Teacher Dashboard Methods
  async getTeacherDashboard(userEmail: string, instansiId: number) {
    // Find user first
    const user = await this.userRepository.findOne({
      where: { email: userEmail, instansiId, role: 'teacher' },
    });

    if (!user) {
      throw new NotFoundException('User tidak ditemukan atau bukan guru');
    }

    // Find teacher by email or by NIK (if email is generated)
    let teacher = await this.teacherRepository.findOne({
      where: { email: userEmail, instansiId },
      relations: ['subjects'],
    });

    // If not found by email, try to find by NIK from generated email
    if (!teacher && userEmail.includes('@xclass.local')) {
      const nikMatch = userEmail.match(/teacher_(\d+)@xclass\.local/);
      if (nikMatch && nikMatch[1]) {
        teacher = await this.teacherRepository.findOne({
          where: { nik: nikMatch[1], instansiId },
          relations: ['subjects'],
        });
      }
    }

    if (!teacher) {
      throw new NotFoundException('Data guru tidak ditemukan');
    }

    // Get teacher's classes from schedules
    const teacherSchedules = await this.scheduleRepository.find({
      where: { teacherId: teacher.id, instansiId, isActive: true },
      relations: ['classRoom'],
    });

    const uniqueClassIds = [...new Set(teacherSchedules.map((s) => s.classId))];
    const totalClasses = uniqueClassIds.length;

    // Get total students from teacher's classes
    const totalStudents = await this.studentRepository
      .createQueryBuilder('student')
      .where('student.classId IN (:...classIds)', { classIds: uniqueClassIds })
      .andWhere('student.instansiId = :instansiId', { instansiId })
      .getCount();

    // Get today's schedules
    const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
    const todaySchedules = await this.scheduleRepository.find({
      where: { teacherId: teacher.id, dayOfWeek: today, instansiId, isActive: true },
      relations: ['subject', 'classRoom'],
      order: { startTime: 'ASC' },
    });

    // Get upcoming exams from exam schedules for this teacher
    const upcomingExams = await this.examRepository
      .createQueryBuilder('exam')
      .innerJoin('exam.schedules', 'examSchedule')
      .leftJoinAndSelect('examSchedule.subject', 'subject')
      .where('exam.instansiId = :instansiId', { instansiId })
      .andWhere('exam.startTime >= :today', { today: new Date() })
      .andWhere('examSchedule.teacherId = :teacherId', { teacherId: teacher.id })
      .orderBy('exam.startTime', 'ASC')
      .take(5)
      .getMany();

    // Get announcements
    const announcements = await this.announcementRepository.find({
      where: {
        instansiId,
        status: 'published',
      },
      order: { createdAt: 'DESC' },
      take: 5,
    });

    return {
      success: true,
      data: {
        teacher: {
          id: teacher.id,
          name: teacher.name,
          nik: teacher.nik || null,
          employeeNumber: teacher.employeeNumber || null,
          subjects: teacher.subjects?.map((s) => ({
            id: s.id,
            name: s.name,
          })) || [],
        },
        stats: {
          totalClasses,
          totalStudents,
          todaySchedules: todaySchedules.length,
          upcomingExams: upcomingExams.length,
        },
        todaySchedules: todaySchedules.map((s) => ({
          id: s.id,
          subject: s.subject?.name || null,
          class: s.classRoom?.name || null,
          time: `${s.startTime} - ${s.endTime}`,
          room: s.room || s.classRoom?.name || null,
        })),
        upcomingExams: upcomingExams.map((e) => {
          // Get subject from first exam schedule
          const firstSchedule = e.schedules?.[0];
          return {
            id: e.id,
            title: e.title,
            startDate: e.startTime.toISOString(),
            subject: firstSchedule?.subject?.name || null,
          };
        }),
        announcements: announcements.map((a) => ({
          id: a.id,
          title: a.title,
          content: a.content,
          created_at: a.createdAt.toLocaleDateString('id-ID'),
        })),
      },
    };
  }

  async getTeacherSchedules(userEmail: string, instansiId: number) {
    // Find user first
    const user = await this.userRepository.findOne({
      where: { email: userEmail, instansiId, role: 'teacher' },
    });

    if (!user) {
      throw new NotFoundException('User tidak ditemukan atau bukan guru');
    }

    // Find teacher by email or by NIK (if email is generated)
    let teacher = await this.teacherRepository.findOne({
      where: { email: userEmail, instansiId },
    });

    // If not found by email, try to find by NIK from generated email
    if (!teacher && userEmail.includes('@xclass.local')) {
      const nikMatch = userEmail.match(/teacher_(\d+)@xclass\.local/);
      if (nikMatch && nikMatch[1]) {
        teacher = await this.teacherRepository.findOne({
          where: { nik: nikMatch[1], instansiId },
        });
      }
    }

    if (!teacher) {
      throw new NotFoundException('Data guru tidak ditemukan');
    }

    const schedules = await this.scheduleRepository.find({
      where: { teacherId: teacher.id, instansiId, isActive: true },
      relations: ['subject', 'classRoom'],
      order: { dayOfWeek: 'ASC', startTime: 'ASC' },
    });

    return {
      success: true,
      data: {
        schedules: schedules.map((s) => ({
          id: s.id,
          subject: s.subject?.name || null,
          subjectId: s.subjectId,
          class: s.classRoom?.name || null,
          classId: s.classId,
          dayOfWeek: s.dayOfWeek,
          startTime: s.startTime,
          endTime: s.endTime,
          room: s.room || s.classRoom?.name || null,
          isActive: s.isActive,
        })),
      },
    };
  }
}

