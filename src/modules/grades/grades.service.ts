import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Response } from 'express';

import { StudentGrade, AssessmentType } from './entities/student-grade.entity';
import { CreateStudentGradeDto } from './dto/create-student-grade.dto';
import { UpdateStudentGradeDto } from './dto/update-student-grade.dto';
import { Student } from '../students/entities/student.entity';
import { Subject } from '../subjects/entities/subject.entity';
import { Teacher } from '../teachers/entities/teacher.entity';
import { ClassRoom } from '../classes/entities/class-room.entity';
import { Schedule } from '../schedules/entities/schedule.entity';
import { Competency } from '../curriculum/entities/competency.entity';
import { ExportImportService } from '../export-import/export-import.service';

interface RequestUser {
  userId: number;
  role: string;
}

interface GradeFilters {
  studentId?: number;
  subjectId?: number;
  classId?: number;
  assessmentType?: AssessmentType;
  competencyId?: number;
  search?: string;
  startDate?: string;
  endDate?: string;
  updatedSince?: string;
  teacherId?: number;
  instansiId: number;
}

type ExportFormat = 'excel' | 'pdf' | 'csv';

@Injectable()
export class GradesService {
  constructor(
    @InjectRepository(StudentGrade)
    private readonly gradesRepository: Repository<StudentGrade>,
    @InjectRepository(Student)
    private readonly studentsRepository: Repository<Student>,
    @InjectRepository(Subject)
    private readonly subjectsRepository: Repository<Subject>,
    @InjectRepository(Teacher)
    private readonly teachersRepository: Repository<Teacher>,
    @InjectRepository(ClassRoom)
    private readonly classRoomsRepository: Repository<ClassRoom>,
    @InjectRepository(Schedule)
    private readonly schedulesRepository: Repository<Schedule>,
    @InjectRepository(Competency)
    private readonly competenciesRepository: Repository<Competency>,
    private readonly exportImportService: ExportImportService,
  ) {}

  async create(
    createStudentGradeDto: CreateStudentGradeDto,
    instansiId: number,
    user?: RequestUser,
  ) {
    this.validateScore(createStudentGradeDto.score);
    this.validateWeight(createStudentGradeDto.weight);

    const student = await this.ensureStudent(createStudentGradeDto.studentId, instansiId);
    const subject = await this.ensureSubject(createStudentGradeDto.subjectId, instansiId);
    const teacherId = await this.resolveTeacherId(createStudentGradeDto.teacherId, instansiId, user);

    let competency: Competency | null = null;
    if (createStudentGradeDto.competencyId) {
      competency = await this.ensureCompetency(createStudentGradeDto.competencyId, instansiId);
    }

    const grade = this.gradesRepository.create({
      studentId: student.id,
      subjectId: subject.id,
      teacherId,
      score: createStudentGradeDto.score,
      instansiId,
      assessmentType: createStudentGradeDto.assessmentType ?? AssessmentType.NH,
      customAssessmentLabel: createStudentGradeDto.customAssessmentLabel?.trim() || null,
      weight:
        createStudentGradeDto.weight === undefined
          ? null
          : Number(createStudentGradeDto.weight),
      description: createStudentGradeDto.description?.trim() || null,
      date: createStudentGradeDto.date ? new Date(createStudentGradeDto.date) : null,
      competencyId: competency?.id ?? null,
      learningOutcome: createStudentGradeDto.learningOutcome?.trim() || null,
    });

    const saved = await this.gradesRepository.save(grade);
    return this.findOne(saved.id, instansiId, user);
  }

  async findAll(filters: GradeFilters, user?: RequestUser) {
    const queryBuilder = this.buildBaseQuery(filters.instansiId);

    if (filters.studentId) {
      queryBuilder.andWhere('grade.studentId = :studentId', { studentId: filters.studentId });
    }

    if (filters.subjectId) {
      queryBuilder.andWhere('grade.subjectId = :subjectId', { subjectId: filters.subjectId });
    }

    if (filters.classId) {
      queryBuilder.andWhere('student.classId = :classId', { classId: filters.classId });
    }

    if (filters.assessmentType) {
      queryBuilder.andWhere('grade.assessmentType = :assessmentType', {
        assessmentType: filters.assessmentType,
      });
    }

    if (filters.competencyId) {
      queryBuilder.andWhere('grade.competencyId = :competencyId', {
        competencyId: filters.competencyId,
      });
    }

    if (filters.teacherId) {
      queryBuilder.andWhere('grade.teacherId = :filterTeacherId', {
        filterTeacherId: filters.teacherId,
      });
    }

    if (filters.search) {
      queryBuilder.andWhere(
        `(student.name LIKE :search OR subject.name LIKE :search OR teacher.name LIKE :search OR classRoom.name LIKE :search)`,
        { search: `%${filters.search}%` },
      );
    }

    if (filters.startDate) {
      queryBuilder.andWhere('grade.date >= :startDate', { startDate: filters.startDate });
    }

    if (filters.endDate) {
      queryBuilder.andWhere('grade.date <= :endDate', { endDate: filters.endDate });
    }

    if (filters.updatedSince) {
      const updatedSinceDate = new Date(filters.updatedSince);
      if (Number.isNaN(updatedSinceDate.getTime())) {
        throw new BadRequestException('Parameter updatedSince tidak valid');
      }
      queryBuilder.andWhere('grade.updatedAt >= :updatedSince', {
        updatedSince: updatedSinceDate,
      });
    }

    if (user?.role === 'teacher') {
      await this.applyTeacherVisibilityScope(queryBuilder, filters.instansiId, user.userId);
    }

    queryBuilder
      .orderBy('grade.date', 'DESC')
      .addOrderBy('grade.createdAt', 'DESC')
      .addOrderBy('grade.id', 'DESC');

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
    };
  }

  async findOne(id: number, instansiId: number, user?: RequestUser) {
    const grade = await this.gradesRepository.findOne({
      where: { id, instansiId },
      relations: ['student', 'student.classRoom', 'subject', 'teacher', 'competency'],
    });

    if (!grade) {
      throw new NotFoundException(`Grade dengan ID ${id} tidak ditemukan`);
    }

    if (user?.role === 'teacher') {
      const canAccess = await this.canTeacherAccessGrade(grade, instansiId, user.userId);
      if (!canAccess) {
        throw new ForbiddenException('Anda tidak berhak mengakses penilaian ini');
      }
    }

    return grade;
  }

  async update(
    id: number,
    updateStudentGradeDto: UpdateStudentGradeDto,
    instansiId: number,
    user?: RequestUser,
  ) {
    if (updateStudentGradeDto.score !== undefined) {
      this.validateScore(updateStudentGradeDto.score);
    }

    if (updateStudentGradeDto.weight !== undefined) {
      this.validateWeight(updateStudentGradeDto.weight);
    }

    const grade = await this.findOne(id, instansiId, user);

    if (
      user?.role === 'teacher' &&
      grade.teacherId !== user.userId &&
      !(await this.isTeacherStudentInScope(grade.studentId, instansiId, user.userId))
    ) {
      throw new ForbiddenException('Anda tidak berhak mengubah penilaian ini');
    }

    if (
      updateStudentGradeDto.studentId !== undefined &&
      updateStudentGradeDto.studentId !== grade.studentId
    ) {
      const student = await this.ensureStudent(updateStudentGradeDto.studentId, instansiId);
      grade.studentId = student.id;
    }

    if (
      updateStudentGradeDto.subjectId !== undefined &&
      updateStudentGradeDto.subjectId !== grade.subjectId
    ) {
      const subject = await this.ensureSubject(updateStudentGradeDto.subjectId, instansiId);
      grade.subjectId = subject.id;
    }

    if (updateStudentGradeDto.teacherId !== undefined) {
      grade.teacherId = await this.resolveTeacherId(updateStudentGradeDto.teacherId, instansiId, user);
    } else if (user?.role === 'teacher') {
      grade.teacherId = user.userId;
    }

    if (updateStudentGradeDto.competencyId !== undefined) {
      if (updateStudentGradeDto.competencyId === null) {
        grade.competencyId = null;
      } else {
        const competency = await this.ensureCompetency(updateStudentGradeDto.competencyId, instansiId);
        grade.competencyId = competency.id;
      }
    }

    if (updateStudentGradeDto.assessmentType !== undefined) {
      grade.assessmentType = updateStudentGradeDto.assessmentType;
    }

    if (updateStudentGradeDto.customAssessmentLabel !== undefined) {
      grade.customAssessmentLabel = updateStudentGradeDto.customAssessmentLabel?.trim() || null;
    }

    if (updateStudentGradeDto.weight !== undefined) {
      grade.weight =
        updateStudentGradeDto.weight === null || updateStudentGradeDto.weight === undefined
          ? null
          : Number(updateStudentGradeDto.weight);
    }

    if (updateStudentGradeDto.description !== undefined) {
      grade.description = updateStudentGradeDto.description?.trim() || null;
    }

    if (updateStudentGradeDto.date !== undefined) {
      grade.date = updateStudentGradeDto.date ? new Date(updateStudentGradeDto.date) : null;
    }

    if (updateStudentGradeDto.learningOutcome !== undefined) {
      grade.learningOutcome = updateStudentGradeDto.learningOutcome?.trim() || null;
    }

    if (updateStudentGradeDto.score !== undefined) {
      grade.score = Number(updateStudentGradeDto.score);
    }

    await this.gradesRepository.save(grade);
    return this.findOne(id, instansiId, user);
  }

  async remove(id: number, instansiId: number, user?: RequestUser) {
    const grade = await this.findOne(id, instansiId, user);

    if (
      user?.role === 'teacher' &&
      grade.teacherId !== user.userId &&
      !(await this.isTeacherStudentInScope(grade.studentId, instansiId, user.userId))
    ) {
      throw new ForbiddenException('Anda tidak berhak menghapus penilaian ini');
    }

    await this.gradesRepository.remove(grade);
    return { message: 'Grade deleted successfully' };
  }

  async export(
    filters: GradeFilters,
    format: ExportFormat,
    res: Response,
    user?: RequestUser,
  ) {
    const { data } = await this.findAll(filters, user);

    const columns = [
      { header: 'No', key: 'no', width: 6 },
      { header: 'Kelas', key: 'className', width: 18 },
      { header: 'Nama Siswa', key: 'studentName', width: 24 },
      { header: 'Mata Pelajaran', key: 'subjectName', width: 24 },
      { header: 'Jenis Penilaian', key: 'assessmentType', width: 20 },
      { header: 'Nilai', key: 'score', width: 10 },
      { header: 'Bobot (%)', key: 'weight', width: 12 },
      { header: 'Tanggal', key: 'date', width: 14 },
      { header: 'Guru', key: 'teacherName', width: 24 },
      { header: 'Kompetensi', key: 'competency', width: 36 },
      { header: 'Tujuan Pembelajaran', key: 'learningOutcome', width: 36 },
      { header: 'Catatan', key: 'description', width: 30 },
    ];

    const rows = data.map((grade, index) => ({
      no: index + 1,
      className: grade.student?.classRoom?.name || '-',
      studentName: grade.student?.name || `Siswa #${grade.studentId}`,
      subjectName: grade.subject?.name || '-',
      assessmentType: this.getAssessmentLabel(grade),
      score: this.asNumber(grade.score),
      weight: grade.weight !== null && grade.weight !== undefined ? this.asNumber(grade.weight) : '',
      date: grade.date ? grade.date.toISOString().split('T')[0] : '',
      teacherName: grade.teacher?.name || '-',
      competency: grade.competency?.description || '-',
      learningOutcome: grade.learningOutcome || '',
      description: grade.description || '',
    }));

    const baseFilename = `penilaian-siswa-${new Date().toISOString().split('T')[0]}`;

    if (format === 'pdf') {
      await this.exportImportService.exportToPDF(
        {
          filename: `${baseFilename}.pdf`,
          columns,
          data: rows,
        },
        res,
      );
    } else if (format === 'csv') {
      await this.exportImportService.exportToCSV(
        {
          filename: `${baseFilename}.csv`,
          columns,
          data: rows,
        },
        res,
      );
    } else {
      await this.exportImportService.exportToExcel(
        {
          filename: `${baseFilename}.xlsx`,
          sheetName: 'Penilaian Siswa',
          columns,
          data: rows,
        },
        res,
      );
    }
  }

  private buildBaseQuery(instansiId: number): SelectQueryBuilder<StudentGrade> {
    return this.gradesRepository
      .createQueryBuilder('grade')
      .where('grade.instansiId = :instansiId', { instansiId })
      .leftJoinAndSelect('grade.student', 'student')
      .leftJoinAndSelect('student.classRoom', 'classRoom')
      .leftJoinAndSelect('grade.subject', 'subject')
      .leftJoinAndSelect('grade.teacher', 'teacher')
      .leftJoinAndSelect('grade.competency', 'competency');
  }

  private async applyTeacherVisibilityScope(
    queryBuilder: SelectQueryBuilder<StudentGrade>,
    instansiId: number,
    teacherId: number,
  ) {
    const accessibleClassIds = await this.getTeacherAccessibleClassIds(teacherId, instansiId);

    if (accessibleClassIds.length === 0) {
      queryBuilder.andWhere('grade.teacherId = :scopeTeacherId', { scopeTeacherId: teacherId });
      return;
    }

    queryBuilder.andWhere(
      '(grade.teacherId = :scopeTeacherId OR student.classId IN (:...scopeClassIds))',
      {
        scopeTeacherId: teacherId,
        scopeClassIds: accessibleClassIds,
      },
    );
  }

  private async canTeacherAccessGrade(
    grade: StudentGrade,
    instansiId: number,
    teacherId: number,
  ): Promise<boolean> {
    if (grade.teacherId === teacherId) {
      return true;
    }

    if (!grade.studentId) {
      return false;
    }

    return this.isTeacherStudentInScope(grade.studentId, instansiId, teacherId);
  }

  private async isTeacherStudentInScope(
    studentId: number,
    instansiId: number,
    teacherId: number,
  ): Promise<boolean> {
    const classIds = await this.getTeacherAccessibleClassIds(teacherId, instansiId);
    if (classIds.length === 0) {
      return false;
    }

    const student = await this.studentsRepository.findOne({
      where: { id: studentId, instansiId },
      select: ['id', 'classId'],
    });

    if (!student?.classId) {
      return false;
    }

    return classIds.includes(student.classId);
  }

  private async getTeacherAccessibleClassIds(teacherId: number, instansiId: number) {
    const homeroomClasses = await this.classRoomsRepository.find({
      where: { instansiId, homeroomTeacherId: teacherId },
      select: ['id'],
    });

    const scheduleClasses = await this.schedulesRepository
      .createQueryBuilder('schedule')
      .select('DISTINCT schedule.classId', 'classId')
      .where('schedule.instansiId = :instansiId', { instansiId })
      .andWhere('schedule.teacherId = :teacherId', { teacherId })
      .getRawMany();

    const classIds = new Set<number>();
    homeroomClasses.forEach((classRoom) => classIds.add(classRoom.id));
    scheduleClasses.forEach((row) => {
      if (row.classId !== null && row.classId !== undefined) {
        classIds.add(Number(row.classId));
      }
    });

    return Array.from(classIds);
  }

  private async ensureStudent(studentId: number, instansiId: number) {
    const student = await this.studentsRepository.findOne({
      where: { id: studentId, instansiId },
      select: ['id', 'name', 'classId'],
    });
    if (!student) {
      throw new NotFoundException(`Siswa dengan ID ${studentId} tidak ditemukan`);
    }
    return student;
  }

  private async ensureSubject(subjectId: number, instansiId: number) {
    const subject = await this.subjectsRepository.findOne({
      where: { id: subjectId, instansiId },
      select: ['id', 'name'],
    });
    if (!subject) {
      throw new NotFoundException(`Mata pelajaran dengan ID ${subjectId} tidak ditemukan`);
    }
    return subject;
  }

  private async ensureTeacher(teacherId: number, instansiId: number) {
    const teacher = await this.teachersRepository.findOne({
      where: { id: teacherId, instansiId },
      select: ['id', 'name'],
    });
    if (!teacher) {
      throw new NotFoundException(`Guru dengan ID ${teacherId} tidak ditemukan`);
    }
    return teacher;
  }

  private async ensureCompetency(competencyId: number, instansiId: number) {
    const competency = await this.competenciesRepository.findOne({
      where: { id: competencyId, instansiId },
      select: ['id', 'description'],
    });
    if (!competency) {
      throw new NotFoundException(`Kompetensi dengan ID ${competencyId} tidak ditemukan`);
    }
    return competency;
  }

  private async resolveTeacherId(
    providedTeacherId: number | undefined,
    instansiId: number,
    user?: RequestUser,
  ): Promise<number | null> {
    const teacherId = providedTeacherId ?? (user?.role === 'teacher' ? user.userId : undefined);
    if (teacherId === undefined || teacherId === null) {
      return null;
    }
    const teacher = await this.ensureTeacher(teacherId, instansiId);
    return teacher.id;
  }

  private validateScore(score?: number) {
    if (score === undefined || score === null) {
      return;
    }
    const numeric = Number(score);
    if (Number.isNaN(numeric) || numeric < 0 || numeric > 100) {
      throw new BadRequestException('Nilai harus berada di antara 0 sampai 100');
    }
  }

  private validateWeight(weight?: number | null) {
    if (weight === undefined || weight === null) {
      return;
    }
    const numeric = Number(weight);
    if (Number.isNaN(numeric) || numeric < 0 || numeric > 100) {
      throw new BadRequestException('Bobot penilaian harus berada di antara 0 sampai 100');
    }
  }

  private getAssessmentLabel(grade: StudentGrade) {
    if (grade.assessmentType === AssessmentType.OTHER) {
      return grade.customAssessmentLabel || 'Penilaian Lainnya';
    }

    const labels: Record<AssessmentType, string> = {
      [AssessmentType.NH]: 'Nilai Harian (NH)',
      [AssessmentType.PTS]: 'Penilaian Tengah Semester (PTS)',
      [AssessmentType.PAS]: 'Penilaian Akhir Semester (PAS)',
      [AssessmentType.PROJECT]: 'Nilai Proyek',
      [AssessmentType.OTHER]: 'Penilaian Lainnya',
    };

    return labels[grade.assessmentType] ?? grade.assessmentType;
  }

  private asNumber(value: number | string | null | undefined): number {
    if (value === null || value === undefined) {
      return 0;
    }
    const numeric = Number(value);
    return Number.isNaN(numeric) ? 0 : numeric;
  }
}

