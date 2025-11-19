import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { StudentGrade } from '../grades/entities/student-grade.entity';
import { Student } from '../students/entities/student.entity';
import { ClassRoom } from '../classes/entities/class-room.entity';
import { Subject } from '../subjects/entities/subject.entity';
import { Attendance } from '../attendance/entities/attendance.entity';
import { AcademicReport, ReportType } from './entities/academic-report.entity';
import { AcademicYear } from '../academic-year/entities/academic-year.entity';
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
    @InjectRepository(AcademicYear)
    private academicYearRepository: Repository<AcademicYear>,
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

  // New methods for report management
  async getAllReports(instansiId: number, params?: { classId?: number; subjectId?: number }) {
    const queryBuilder = this.academicReportRepository
      .createQueryBuilder('report')
      .where('report.instansiId = :instansiId', { instansiId })
      .orderBy('report.created_at', 'DESC');

    if (params?.classId) {
      queryBuilder.andWhere('report.class_id = :classId', { classId: params.classId });
    }

    if (params?.subjectId) {
      // Note: subjectId filter might need to be handled differently based on report type
      queryBuilder.andWhere('report.metadata LIKE :subjectId', {
        subjectId: `%${params.subjectId}%`,
      });
    }

    const [data, total] = await queryBuilder.getManyAndCount();
    return { data, total };
  }

  async getReportById(id: number, instansiId: number): Promise<AcademicReport> {
    const report = await this.academicReportRepository.findOne({
      where: { id, instansiId },
    });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    return report;
  }

  async generateReport(
    instansiId: number,
    data: {
      report_type: ReportType;
      title: string;
      academic_year_id?: number;
      class_id?: number;
      student_id?: number;
      period?: string;
    },
  ): Promise<AcademicReport> {
    // Get additional data based on filters
    let academicYearName: string | undefined;
    let className: string | undefined;
    let studentName: string | undefined;

    if (data.academic_year_id) {
      const academicYear = await this.academicYearRepository.findOne({
        where: { id: data.academic_year_id, instansiId },
      });
      academicYearName = academicYear?.name || `Tahun ${data.academic_year_id}`;
    }

    if (data.class_id) {
      const classRoom = await this.classRepository.findOne({
        where: { id: data.class_id, instansiId },
      });
      className = classRoom?.name;
    }

    if (data.student_id) {
      const student = await this.studentRepository.findOne({
        where: { id: data.student_id, instansiId },
      });
      studentName = student?.name;
    }

    // Generate report file
    const reportData = await this.getReportData(data.report_type, instansiId, {
      classId: data.class_id,
      studentId: data.student_id,
      academicYearId: data.academic_year_id,
    });

    // Create storage directory
    const storageDir = path.join(process.cwd(), 'storage', 'academic-reports');
    if (!fs.existsSync(storageDir)) {
      fs.mkdirSync(storageDir, { recursive: true });
    }

    // Generate file
    const fileName = `report_${Date.now()}.pdf`;
    const filePath = path.join(storageDir, fileName);
    const fileUrl = `/storage/academic-reports/${fileName}`;

    await this.generateReportFile(data.report_type, reportData, filePath);

    // Create report record
    const report = this.academicReportRepository.create({
      instansiId,
      report_type: data.report_type,
      title: data.title,
      academic_year_id: data.academic_year_id,
      academic_year_name: academicYearName,
      class_id: data.class_id,
      class_name: className,
      student_id: data.student_id,
      student_name: studentName,
      period: data.period,
      file_path: filePath,
      file_url: fileUrl,
      generated_at: new Date(),
      metadata: {
        report_type: data.report_type,
        filters: {
          classId: data.class_id,
          studentId: data.student_id,
          academicYearId: data.academic_year_id,
        },
      },
    });

    return await this.academicReportRepository.save(report);
  }

  async deleteReport(id: number, instansiId: number): Promise<void> {
    const report = await this.getReportById(id, instansiId);

    // Delete file if exists
    if (report.file_path && fs.existsSync(report.file_path)) {
      try {
        fs.unlinkSync(report.file_path);
      } catch (error) {
        this.logger.warn(`Failed to delete file: ${error.message}`);
      }
    }

    await this.academicReportRepository.remove(report);
  }

  async exportReport(
    format: 'pdf' | 'excel',
    instansiId: number,
    filters?: { classId?: number; subjectId?: number },
  ): Promise<Buffer> {
    const grades = await this.exportGrades({
      ...filters,
      instansiId,
    });

    if (format === 'excel') {
      return await this.generateExcelBuffer(grades);
    } else {
      return await this.generatePdfBuffer(grades);
    }
  }

  // Private helper methods
  private async getReportData(
    reportType: ReportType,
    instansiId: number,
    filters?: { classId?: number; studentId?: number; academicYearId?: number },
  ): Promise<any> {
    switch (reportType) {
      case ReportType.STUDENT_GRADE:
        if (filters?.studentId) {
          return await this.getStudentReport(filters.studentId, instansiId);
        }
        break;
      case ReportType.CLASS_SUMMARY:
        if (filters?.classId) {
          return await this.getClassReport(filters.classId, instansiId);
        }
        break;
      default:
        return {};
    }
    return {};
  }

  private async generateReportFile(reportType: ReportType, data: any, filePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        const stream = fs.createWriteStream(filePath);

        doc.pipe(stream);

        // Header
        doc.fontSize(20).font('Helvetica-Bold').text('LAPORAN AKADEMIK', { align: 'center' });
        doc.moveDown();

        // Content based on report type
        doc.fontSize(12).font('Helvetica');
        if (data.student) {
          doc.text(`Nama: ${data.student.name}`);
          doc.text(`NISN: ${data.student.nisn || '-'}`);
          if (data.student.classRoom) {
            doc.text(`Kelas: ${data.student.classRoom.name}`);
          }
          doc.moveDown();
        }

        if (data.averageScore) {
          doc.text(`Rata-rata Nilai: ${data.averageScore}`);
        }

        if (data.subjectAverages && data.subjectAverages.length > 0) {
          doc.moveDown();
          doc.fontSize(14).font('Helvetica-Bold').text('Nilai per Mata Pelajaran:');
          doc.moveDown(0.5);
          doc.fontSize(12).font('Helvetica');
          data.subjectAverages.forEach((item: any) => {
            doc.text(`${item.subject}: ${item.average}`);
          });
        }

        doc.end();
        stream.on('finish', resolve);
        stream.on('error', reject);
      } catch (error) {
        reject(error);
      }
    });
  }

  private async generateExcelBuffer(grades: StudentGrade[]): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Laporan Nilai');

    worksheet.columns = [
      { header: 'Nama Siswa', key: 'studentName', width: 30 },
      { header: 'Mata Pelajaran', key: 'subjectName', width: 25 },
      { header: 'Nilai', key: 'score', width: 15 },
      { header: 'Tanggal', key: 'date', width: 20 },
    ];

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };

    grades.forEach((grade) => {
      worksheet.addRow({
        studentName: grade.student?.name || '-',
        subjectName: grade.subject?.name || '-',
        score: grade.score,
        date: grade.date ? new Date(grade.date).toLocaleDateString('id-ID') : '-',
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  private async generatePdfBuffer(grades: StudentGrade[]): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        const buffers: Buffer[] = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(buffers);
          resolve(pdfBuffer);
        });
        doc.on('error', reject);

        doc.fontSize(20).font('Helvetica-Bold').text('LAPORAN NILAI', { align: 'center' });
        doc.moveDown(2);

        doc.fontSize(12).font('Helvetica');
        grades.forEach((grade, index) => {
          if (index > 0 && index % 20 === 0) {
            doc.addPage();
          }
          doc.text(`${index + 1}. ${grade.student?.name || '-'} - ${grade.subject?.name || '-'}: ${grade.score}`);
          doc.moveDown(0.5);
        });

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }
}

