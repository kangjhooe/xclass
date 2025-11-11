import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Student } from '../students/entities/student.entity';
import { Teacher } from '../teachers/entities/teacher.entity';
import { Attendance } from '../attendance/entities/attendance.entity';
import { StudentGrade } from '../grades/entities/student-grade.entity';
import { ClassRoom } from '../classes/entities/class-room.entity';

export interface AnalyticsFilters {
  instansiId: number;
  startDate?: Date;
  endDate?: Date;
  classId?: number;
  subjectId?: number;
}

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    @InjectRepository(Teacher)
    private teacherRepository: Repository<Teacher>,
    @InjectRepository(Attendance)
    private attendanceRepository: Repository<Attendance>,
    @InjectRepository(StudentGrade)
    private gradeRepository: Repository<StudentGrade>,
    @InjectRepository(ClassRoom)
    private classRepository: Repository<ClassRoom>,
  ) {}

  /**
   * Get students analytics
   */
  async getStudentsAnalytics(filters: AnalyticsFilters) {
    const { instansiId, startDate, endDate, classId } = filters;

    // Total students
    const totalStudents = await this.studentRepository.count({
      where: { instansiId, isActive: true },
    });

    // New students in period
    const newStudentsQuery = this.studentRepository
      .createQueryBuilder('student')
      .where('student.instansiId = :instansiId', { instansiId })
      .andWhere('student.isActive = true');

    if (startDate && endDate) {
      newStudentsQuery.andWhere('student.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    const newStudents = await newStudentsQuery.getCount();

    // Students by gender
    const studentsByGender = await this.studentRepository
      .createQueryBuilder('student')
      .select('student.gender', 'gender')
      .addSelect('COUNT(*)', 'count')
      .where('student.instansiId = :instansiId', { instansiId })
      .andWhere('student.isActive = true')
      .groupBy('student.gender')
      .getRawMany();

    // Students by class
    const studentsByClass = await this.studentRepository
      .createQueryBuilder('student')
      .leftJoin('student.classRoom', 'class')
      .select('class.name', 'className')
      .addSelect('COUNT(*)', 'count')
      .where('student.instansiId = :instansiId', { instansiId })
      .andWhere('student.isActive = true')
      .groupBy('class.name')
      .getRawMany();

    // Trend: Students over time
    const studentsTrend = await this.studentRepository
      .createQueryBuilder('student')
      .select('DATE(student.createdAt)', 'date')
      .addSelect('COUNT(*)', 'count')
      .where('student.instansiId = :instansiId', { instansiId })
      .andWhere('student.isActive = true');

    if (startDate && endDate) {
      studentsTrend.andWhere('student.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    const trendData = await studentsTrend
      .groupBy('DATE(student.createdAt)')
      .orderBy('date', 'ASC')
      .getRawMany();

    return {
      metrics: [
        {
          label: 'Total Siswa',
          value: totalStudents,
          change: newStudents > 0 ? ((newStudents / totalStudents) * 100) : 0,
          trend: newStudents > 0 ? 'up' : 'neutral',
        },
        {
          label: 'Siswa Baru',
          value: newStudents,
        },
      ],
      distribution: {
        label: 'Distribusi Siswa per Jenis Kelamin',
        data: studentsByGender.map((item) => ({
          name: item.gender === 'L' ? 'Laki-laki' : 'Perempuan',
          value: parseInt(item.count),
        })),
        dataKey: 'value',
      },
      comparison: {
        label: 'Distribusi Siswa per Kelas',
        data: studentsByClass.map((item) => ({
          name: item.className || 'Tidak Ada Kelas',
          value: parseInt(item.count),
        })),
        dataKey: 'value',
      },
      trends: {
        label: 'Trend Pendaftaran Siswa',
        data: trendData.map((item) => ({
          name: new Date(item.date).toLocaleDateString('id-ID'),
          value: parseInt(item.count),
        })),
        dataKey: 'value',
      },
    };
  }

  /**
   * Get teachers analytics
   */
  async getTeachersAnalytics(filters: AnalyticsFilters) {
    const { instansiId, startDate, endDate } = filters;

    const totalTeachers = await this.teacherRepository.count({
      where: { instansiId, isActive: true },
    });

    const newTeachersQuery = this.teacherRepository
      .createQueryBuilder('teacher')
      .where('teacher.instansiId = :instansiId', { instansiId })
      .andWhere('teacher.isActive = true');

    if (startDate && endDate) {
      newTeachersQuery.andWhere('teacher.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    const newTeachers = await newTeachersQuery.getCount();

    const teachersByGender = await this.teacherRepository
      .createQueryBuilder('teacher')
      .select('teacher.gender', 'gender')
      .addSelect('COUNT(*)', 'count')
      .where('teacher.instansiId = :instansiId', { instansiId })
      .andWhere('teacher.isActive = true')
      .groupBy('teacher.gender')
      .getRawMany();

    return {
      metrics: [
        {
          label: 'Total Guru',
          value: totalTeachers,
          change: newTeachers > 0 ? ((newTeachers / totalTeachers) * 100) : 0,
          trend: newTeachers > 0 ? 'up' : 'neutral',
        },
        {
          label: 'Guru Baru',
          value: newTeachers,
        },
      ],
      distribution: {
        label: 'Distribusi Guru per Jenis Kelamin',
        data: teachersByGender.map((item) => ({
          name: item.gender === 'L' ? 'Laki-laki' : 'Perempuan',
          value: parseInt(item.count),
        })),
        dataKey: 'value',
      },
    };
  }

  /**
   * Get attendance analytics
   */
  async getAttendanceAnalytics(filters: AnalyticsFilters) {
    const { instansiId, startDate, endDate, classId } = filters;

    const dateFilter: any = {};
    if (startDate && endDate) {
      dateFilter.date = Between(startDate, endDate);
    }

    const attendanceQuery = this.attendanceRepository
      .createQueryBuilder('attendance')
      .leftJoin('attendance.student', 'student')
      .where('student.instansiId = :instansiId', { instansiId });

    if (classId) {
      attendanceQuery.andWhere('student.classId = :classId', { classId });
    }

    if (startDate && endDate) {
      attendanceQuery.andWhere('attendance.date BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    // Attendance by status
    const attendanceByStatus = await attendanceQuery
      .select('attendance.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('attendance.status')
      .getRawMany();

    // Daily attendance trend
    const dailyTrend = await attendanceQuery
      .select('DATE(attendance.date)', 'date')
      .addSelect('attendance.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('DATE(attendance.date)')
      .addGroupBy('attendance.status')
      .orderBy('date', 'ASC')
      .getRawMany();

    // Group by date
    const trendData = dailyTrend.reduce((acc: any, item: any) => {
      const date = new Date(item.date).toLocaleDateString('id-ID');
      if (!acc[date]) {
        acc[date] = { name: date, present: 0, absent: 0, late: 0 };
      }
      acc[date][item.status] = parseInt(item.count);
      return acc;
    }, {});

    const totalAttendance = attendanceByStatus.reduce((sum, item) => sum + parseInt(item.count), 0);
    const presentCount = attendanceByStatus.find((item) => item.status === 'present')?.count || 0;
    const attendanceRate = totalAttendance > 0 ? (parseInt(presentCount) / totalAttendance) * 100 : 0;

    return {
      metrics: [
        {
          label: 'Tingkat Kehadiran',
          value: `${attendanceRate.toFixed(1)}%`,
        },
        {
          label: 'Total Absensi',
          value: totalAttendance,
        },
        {
          label: 'Hadir',
          value: presentCount,
        },
        {
          label: 'Tidak Hadir',
          value: attendanceByStatus.find((item) => item.status === 'absent')?.count || 0,
        },
      ],
      trends: {
        label: 'Trend Kehadiran Harian',
        data: Object.values(trendData),
        dataKey: 'present',
        lines: [
          { key: 'present', name: 'Hadir', color: '#10b981' },
          { key: 'absent', name: 'Tidak Hadir', color: '#ef4444' },
          { key: 'late', name: 'Terlambat', color: '#f59e0b' },
        ],
      },
      distribution: {
        label: 'Distribusi Status Kehadiran',
        data: attendanceByStatus.map((item) => ({
          name: item.status === 'present' ? 'Hadir' : item.status === 'absent' ? 'Tidak Hadir' : 'Terlambat',
          value: parseInt(item.count),
        })),
        dataKey: 'value',
      },
    };
  }

  /**
   * Get grades analytics
   */
  async getGradesAnalytics(filters: AnalyticsFilters) {
    const { instansiId, startDate, endDate, classId, subjectId } = filters;

    const gradeQuery = this.gradeRepository
      .createQueryBuilder('grade')
      .leftJoin('grade.student', 'student')
      .where('student.instansiId = :instansiId', { instansiId });

    if (classId) {
      gradeQuery.andWhere('student.classId = :classId', { classId });
    }

    if (subjectId) {
      gradeQuery.andWhere('grade.subjectId = :subjectId', { subjectId });
    }

    if (startDate && endDate) {
      gradeQuery.andWhere('grade.date BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    // Average grade
    const avgResult = await gradeQuery
      .select('AVG(grade.score)', 'avg')
      .getRawOne();

    const averageGrade = parseFloat(avgResult?.avg || '0');

    // Grade distribution
    const gradeDistribution = await gradeQuery
      .select('CASE WHEN grade.score >= 85 THEN "85-100" WHEN grade.score >= 70 THEN "70-84" WHEN grade.score >= 60 THEN "60-69" ELSE "0-59" END', 'range')
      .addSelect('COUNT(*)', 'count')
      .groupBy('range')
      .getRawMany();

    // Grades by subject
    const gradesBySubject = await gradeQuery
      .leftJoin('grade.subject', 'subject')
      .select('subject.name', 'subjectName')
      .addSelect('AVG(grade.score)', 'avg')
      .addSelect('COUNT(*)', 'count')
      .groupBy('subject.name')
      .getRawMany();

    return {
      metrics: [
        {
          label: 'Rata-rata Nilai',
          value: averageGrade.toFixed(2),
        },
        {
          label: 'Total Nilai',
          value: await gradeQuery.getCount(),
        },
      ],
      distribution: {
        label: 'Distribusi Nilai',
        data: gradeDistribution.map((item) => ({
          name: item.range,
          value: parseInt(item.count),
        })),
        dataKey: 'value',
      },
      comparison: {
        label: 'Rata-rata Nilai per Mata Pelajaran',
        data: gradesBySubject.map((item) => ({
          name: item.subjectName || 'Tidak Ada',
          value: parseFloat(item.avg || '0'),
        })),
        dataKey: 'value',
      },
    };
  }
}

