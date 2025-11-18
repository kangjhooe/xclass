import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { StudentGrade } from '../grades/entities/student-grade.entity';
import { Student } from '../students/entities/student.entity';
import { ClassRoom } from '../classes/entities/class-room.entity';
import { Subject } from '../subjects/entities/subject.entity';
import { Attendance } from '../attendance/entities/attendance.entity';
import { AcademicReport, ReportType } from './entities/academic-report.entity';
import * as ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class AcademicReportsService {
  private readonly logger = new Logger(AcademicReportsService.name);

  constructor(
    @InjectRepository(StudentGrade)
    private gradeRepository: Repository<StudentGrade>,
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    @InjectRepository(ClassRoom)
    private classRepository: Repository<ClassRoom>,
    @InjectRepository(Subject)
    private subjectRepository: Repository<Subject>,
    @InjectRepository(Attendance)
    private attendanceRepository: Repository<Attendance>,
    @InjectRepository(AcademicReport)
    private academicReportRepository: Repository<AcademicReport>,
  ) {}

  async getDashboard(instansiId: number) {
    const totalStudents = await this.studentRepository.count({
      where: { instansiId, isActive: true },
    });

    const totalClasses = await this.classRepository.count({
      where: { instansiId },
    });

    const totalSubjects = await this.subjectRepository.count({
      where: { instansiId },
    });

    // Get average grade
    const avgGradeResult = await this.gradeRepository
      .createQueryBuilder('grade')
      .select('AVG(grade.score)', 'avg')
      .where('grade.instansiId = :instansiId', { instansiId })
      .getRawOne();

    const averageGrade = avgGradeResult?.avg || 0;

    // Get attendance statistics
    const attendanceStats = await this.attendanceRepository
      .createQueryBuilder('attendance')
      .select('attendance.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .leftJoin('attendance.student', 'student')
      .where('student.instansiId = :instansiId', { instansiId })
      .groupBy('attendance.status')
      .getRawMany();

    return {
      totalStudents,
      totalClasses,
      totalSubjects,
      averageGrade: parseFloat(averageGrade).toFixed(2),
      attendanceStats,
    };
  }

  async getClassReport(classId: number, instansiId: number) {
    const classRoom = await this.classRepository.findOne({
      where: { id: classId, instansiId },
      relations: ['students'],
    });

    if (!classRoom) {
      throw new NotFoundException('Class not found');
    }

    const students = await this.studentRepository.find({
      where: { classId, instansiId, isActive: true },
    });

    const studentIds = students.map((s) => s.id);

    // Get all grades for students in this class
    const grades = await this.gradeRepository.find({
      where: { studentId: In(studentIds), instansiId },
      relations: ['subject', 'student'],
    });

    // Calculate statistics per student
    const studentReports = students.map((student) => {
      const studentGrades = grades.filter((g) => g.studentId === student.id);
      const totalScore = studentGrades.reduce((sum, g) => sum + parseFloat(g.score.toString()), 0);
      const averageScore = studentGrades.length > 0 ? totalScore / studentGrades.length : 0;

      // Group by subject
      const subjectGrades = studentGrades.reduce((acc, grade) => {
        const subjectName = grade.subject?.name || 'Unknown';
        if (!acc[subjectName]) {
          acc[subjectName] = [];
        }
        acc[subjectName].push(grade);
        return acc;
      }, {} as Record<string, StudentGrade[]>);

      return {
        student,
        totalGrades: studentGrades.length,
        averageScore: averageScore.toFixed(2),
        subjectGrades,
      };
    });

    return {
      classRoom,
      totalStudents: students.length,
      studentReports,
    };
  }

  async getStudentReport(studentId: number, instansiId: number) {
    const student = await this.studentRepository.findOne({
      where: { id: studentId, instansiId },
      relations: ['classRoom'],
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    // Get all grades
    const grades = await this.gradeRepository.find({
      where: { studentId, instansiId },
      relations: ['subject', 'teacher'],
      order: { date: 'DESC' },
    });

    // Get attendance
    const attendances = await this.attendanceRepository.find({
      where: { studentId, instansiId },
      order: { date: 'DESC' },
      take: 30, // Last 30 attendance records
    });

    // Calculate statistics
    const totalGrades = grades.length;
    const totalScore = grades.reduce((sum, g) => sum + parseFloat(g.score.toString()), 0);
    const averageScore = totalGrades > 0 ? totalScore / totalGrades : 0;

    // Group by subject
    const subjectGrades = grades.reduce((acc, grade) => {
      const subjectName = grade.subject?.name || 'Unknown';
      if (!acc[subjectName]) {
        acc[subjectName] = [];
      }
      acc[subjectName].push(grade);
      return acc;
    }, {} as Record<string, StudentGrade[]>);

    // Calculate average per subject
    const subjectAverages = Object.entries(subjectGrades).map(([subjectName, subjectGradeList]) => {
      const subjectTotal = subjectGradeList.reduce(
        (sum, g) => sum + parseFloat(g.score.toString()),
        0,
      );
      const subjectAvg = subjectGradeList.length > 0 ? subjectTotal / subjectGradeList.length : 0;
      return {
        subject: subjectName,
        average: subjectAvg.toFixed(2),
        count: subjectGradeList.length,
      };
    });

    // Attendance statistics
    const attendanceCounts = attendances.reduce(
      (acc, att) => {
        acc[att.status] = (acc[att.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      student,
      grades,
      attendances,
      totalGrades,
      averageScore: averageScore.toFixed(2),
      subjectGrades,
      subjectAverages,
      attendanceCounts,
      recentAttendances: attendances.slice(0, 10),
    };
  }

  async exportGrades(filters: {
    classId?: number;
    subjectId?: number;
    studentId?: number;
    instansiId: number;
  }) {
    const { classId, subjectId, studentId, instansiId } = filters;

    const queryBuilder = this.gradeRepository
      .createQueryBuilder('grade')
      .leftJoinAndSelect('grade.student', 'student')
      .leftJoinAndSelect('grade.subject', 'subject')
      .leftJoinAndSelect('grade.teacher', 'teacher')
      .where('grade.instansiId = :instansiId', { instansiId });

    if (classId) {
      queryBuilder.andWhere('student.classId = :classId', { classId });
    }

    if (subjectId) {
      queryBuilder.andWhere('grade.subjectId = :subjectId', { subjectId });
    }

    if (studentId) {
      queryBuilder.andWhere('grade.studentId = :studentId', { studentId });
    }

    return await queryBuilder.orderBy('student.name', 'ASC').getMany();
  }
}

