import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from './entities/student.entity';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { AcademicYear } from '../academic-year/entities/academic-year.entity';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private studentsRepository: Repository<Student>,
    @InjectRepository(AcademicYear)
    private academicYearRepository: Repository<AcademicYear>,
  ) {}

  private transformDates(dto: CreateStudentDto | UpdateStudentDto): any {
    const transformed = { ...dto };
    
    // Convert date strings to Date objects
    if (transformed.birthDate && typeof transformed.birthDate === 'string') {
      transformed.birthDate = new Date(transformed.birthDate) as any;
    }
    if (transformed.fatherBirthDate && typeof transformed.fatherBirthDate === 'string') {
      transformed.fatherBirthDate = new Date(transformed.fatherBirthDate) as any;
    }
    if (transformed.motherBirthDate && typeof transformed.motherBirthDate === 'string') {
      transformed.motherBirthDate = new Date(transformed.motherBirthDate) as any;
    }
    if (transformed.guardianBirthDate && typeof transformed.guardianBirthDate === 'string') {
      transformed.guardianBirthDate = new Date(transformed.guardianBirthDate) as any;
    }
    if (transformed.enrollmentDate && typeof transformed.enrollmentDate === 'string') {
      transformed.enrollmentDate = new Date(transformed.enrollmentDate) as any;
    }

    // Remove undefined/null/empty string values to avoid overwriting with null
    // But keep 0, false, and other falsy values that are valid
    Object.keys(transformed).forEach((key) => {
      const value = transformed[key];
      if (value === undefined || value === null || value === '') {
        if (key !== 'isActive') { // Keep isActive even if undefined
          delete transformed[key];
        }
      }
    });

    return transformed;
  }

  async create(createStudentDto: CreateStudentDto, instansiId: number) {
    // Check for duplicate NISN if provided
    if (createStudentDto.nisn) {
      const existing = await this.studentsRepository.findOne({
        where: { nisn: createStudentDto.nisn, instansiId },
      });
      if (existing) {
        throw new ConflictException(`Siswa dengan NISN ${createStudentDto.nisn} sudah terdaftar`);
      }
    }

    // Validasi: Siswa hanya bisa aktif di 1 tenant berdasarkan NISN
    const isActive = createStudentDto.isActive ?? true;
    if (isActive && createStudentDto.nisn) {
      const activeStudentInOtherTenant = await this.studentsRepository.findOne({
        where: { 
          nisn: createStudentDto.nisn, 
          isActive: true,
        },
      });
      
      if (activeStudentInOtherTenant && activeStudentInOtherTenant.instansiId !== instansiId) {
        throw new ConflictException(
          `Siswa dengan NISN ${createStudentDto.nisn} sudah aktif di tenant lain. Siswa hanya bisa aktif di 1 tenant.`
        );
      }
    }

    const transformed = this.transformDates(createStudentDto);

    if (!transformed.academicYear) {
      const activeAcademicYear = await this.getActiveAcademicYear(instansiId);
      if (activeAcademicYear) {
        transformed.academicYear = activeAcademicYear;
      }
    }
    const student = this.studentsRepository.create({
      ...transformed,
      instansiId,
      isActive,
    });
    
    try {
      return await this.studentsRepository.save(student);
    } catch (error: any) {
      if (error.code === 'ER_DUP_ENTRY' || error.code === '23505') {
        throw new ConflictException('Data siswa dengan NISN atau identitas yang sama sudah terdaftar');
      }
      throw new BadRequestException(`Gagal membuat data siswa: ${error.message}`);
    }
  }

  async findAll(filters: {
    search?: string;
    classId?: number;
    status?: string;
    gender?: string;
    academicYear?: string;
    page?: number;
    limit?: number;
    instansiId: number;
  }) {
    const {
      search,
      classId,
      status,
      gender,
      academicYear,
      page = 1,
      limit = 20,
      instansiId,
    } = filters;
    
    const queryBuilder = this.studentsRepository
      .createQueryBuilder('student')
      .where('student.instansiId = :instansiId', { instansiId })
      .leftJoinAndSelect('student.classRoom', 'classRoom');

    if (search) {
      queryBuilder.andWhere(
        '(student.name LIKE :search OR student.studentNumber LIKE :search OR student.nisn LIKE :search OR student.email LIKE :search OR student.phone LIKE :search OR student.nik LIKE :search)',
        { search: `%${search}%` },
      );
    }

    let effectiveAcademicYear = academicYear?.trim();

    if (effectiveAcademicYear?.toLowerCase() === 'all') {
      effectiveAcademicYear = undefined;
    }

    if (!effectiveAcademicYear) {
      effectiveAcademicYear = await this.getActiveAcademicYear(instansiId) || undefined;
    }

    if (effectiveAcademicYear) {
      queryBuilder.andWhere('student.academicYear = :academicYear', { academicYear: effectiveAcademicYear });
    }

    if (classId) {
      queryBuilder.andWhere('student.classId = :classId', { classId });
    }

    if (status === 'active') {
      queryBuilder.andWhere('student.isActive = :isActive', { isActive: true });
    } else if (status === 'inactive') {
      queryBuilder.andWhere('student.isActive = :isActive', { isActive: false });
    }

    if (gender) {
      queryBuilder.andWhere('student.gender = :gender', { gender });
    }

    queryBuilder.orderBy('student.name', 'ASC');

    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number, instansiId: number) {
    const student = await this.studentsRepository.findOne({
      where: { id, instansiId },
      relations: ['classRoom', 'attendances', 'grades'],
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }

    return student;
  }

  async update(id: number, updateStudentDto: UpdateStudentDto, instansiId: number) {
    const student = await this.findOne(id, instansiId);
    
    // Check for duplicate NISN if provided and different from current
    if (updateStudentDto.nisn && updateStudentDto.nisn !== student.nisn) {
      const existing = await this.studentsRepository.findOne({
        where: { nisn: updateStudentDto.nisn, instansiId },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException(`Siswa dengan NISN ${updateStudentDto.nisn} sudah terdaftar`);
      }
    }

    // Validasi: Siswa hanya bisa aktif di 1 tenant berdasarkan NISN
    const nisnToCheck = updateStudentDto.nisn || student.nisn;
    const willBeActive = updateStudentDto.isActive !== undefined ? updateStudentDto.isActive : student.isActive;
    
    if (willBeActive && nisnToCheck) {
      const activeStudentInOtherTenant = await this.studentsRepository.findOne({
        where: { 
          nisn: nisnToCheck, 
          isActive: true,
        },
      });
      
      if (activeStudentInOtherTenant && activeStudentInOtherTenant.id !== id && activeStudentInOtherTenant.instansiId !== instansiId) {
        throw new ConflictException(
          `Siswa dengan NISN ${nisnToCheck} sudah aktif di tenant lain. Siswa hanya bisa aktif di 1 tenant.`
        );
      }
    }

    const transformed = this.transformDates(updateStudentDto);
    
    // Only update fields that are provided
    Object.keys(transformed).forEach((key) => {
      if (transformed[key] !== undefined) {
        (student as any)[key] = transformed[key];
      }
    });

    try {
      return await this.studentsRepository.save(student);
    } catch (error: any) {
      if (error.code === 'ER_DUP_ENTRY' || error.code === '23505') {
        throw new ConflictException('Data siswa dengan NISN atau identitas yang sama sudah terdaftar');
      }
      throw new BadRequestException(`Gagal mengupdate data siswa: ${error.message}`);
    }
  }

  async remove(id: number, instansiId: number) {
    const student = await this.findOne(id, instansiId);
    await this.studentsRepository.remove(student);
    return { message: 'Student deleted successfully' };
  }

  async getGrades(id: number, instansiId: number) {
    const student = await this.studentsRepository.findOne({
      where: { id, instansiId },
      relations: ['grades', 'grades.subject', 'grades.teacher'],
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }

    return student.grades;
  }

  async getAttendance(id: number, instansiId: number) {
    const student = await this.studentsRepository.findOne({
      where: { id, instansiId },
      relations: ['attendances', 'attendances.schedule', 'attendances.teacher'],
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }

    return student.attendances;
  }

  /**
   * Get student by NISN (for lifetime tracking)
   */
  async findByNisn(nisn: string, instansiId?: number) {
    const where: any = { nisn };
    if (instansiId) {
      where.instansiId = instansiId;
    }

    const student = await this.studentsRepository.findOne({
      where,
    });

    if (!student) {
      throw new NotFoundException(`Student with NISN ${nisn} not found`);
    }

    return student;
  }

  /**
   * Get student lifetime data - semua data dari SD sampai SMA
   */
  async getLifetimeData(nisn: string, instansiId?: number) {
    const student = await this.findByNisn(nisn, instansiId);

    // Load all related data
    const studentWithRelations = await this.studentsRepository.findOne({
      where: { id: student.id },
      relations: [
        'classRoom',
        'grades',
        'grades.subject',
        'grades.teacher',
        'healthRecords',
        'disciplinaryActions',
        'disciplinaryActions.reporter',
        'counselingSessions',
        'counselingSessions.counselor',
        'attendances',
        'attendances.schedule',
        'attendances.teacher',
        'extracurricularParticipants',
        'extracurricularParticipants.extracurricular',
        'courseEnrollments',
        'courseEnrollments.course',
        'courseProgresses',
        'courseProgresses.course',
        'examAttempts',
        'examAttempts.exam',
        'alumniRecords',
        'graduations',
        'transfers',
      ],
    });

    if (!studentWithRelations) {
      throw new NotFoundException(`Student with NISN ${nisn} not found`);
    }

    // Sort data by date
    const sortedGrades = studentWithRelations.grades?.sort(
      (a, b) => new Date(a.date || a.createdAt).getTime() - new Date(b.date || b.createdAt).getTime(),
    ) || [];

    const sortedHealthRecords = studentWithRelations.healthRecords?.sort(
      (a, b) => new Date(a.checkupDate).getTime() - new Date(b.checkupDate).getTime(),
    ) || [];

    const sortedDisciplinaryActions = studentWithRelations.disciplinaryActions?.sort(
      (a, b) => new Date(a.incidentDate).getTime() - new Date(b.incidentDate).getTime(),
    ) || [];

    const sortedAttendances = studentWithRelations.attendances?.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    ) || [];

    return {
      student: {
        id: studentWithRelations.id,
        nisn: studentWithRelations.nisn,
        name: studentWithRelations.name,
        academicLevel: studentWithRelations.academicLevel,
        currentGrade: studentWithRelations.currentGrade,
        academicYear: studentWithRelations.academicYear,
        studentStatus: studentWithRelations.studentStatus,
        isActive: studentWithRelations.isActive,
        enrollmentDate: studentWithRelations.enrollmentDate,
        enrollmentYear: studentWithRelations.enrollmentYear,
        classRoom: studentWithRelations.classRoom,
      },
      summary: {
        totalGrades: sortedGrades.length,
        totalHealthRecords: sortedHealthRecords.length,
        totalDisciplinaryActions: sortedDisciplinaryActions.length,
        totalCounselingSessions: studentWithRelations.counselingSessions?.length || 0,
        totalAttendances: sortedAttendances.length,
        totalExtracurriculars: studentWithRelations.extracurricularParticipants?.length || 0,
        totalCourseEnrollments: studentWithRelations.courseEnrollments?.length || 0,
        totalExamAttempts: studentWithRelations.examAttempts?.length || 0,
        totalTransfers: studentWithRelations.transfers?.length || 0,
      },
      data: {
        grades: sortedGrades,
        healthRecords: sortedHealthRecords,
        disciplinaryActions: sortedDisciplinaryActions,
        counselingSessions: studentWithRelations.counselingSessions || [],
        attendances: sortedAttendances,
        extracurricularParticipants: studentWithRelations.extracurricularParticipants || [],
        courseEnrollments: studentWithRelations.courseEnrollments || [],
        courseProgresses: studentWithRelations.courseProgresses || [],
        examAttempts: studentWithRelations.examAttempts || [],
        alumniRecords: studentWithRelations.alumniRecords || [],
        graduations: studentWithRelations.graduations || [],
        transfers: studentWithRelations.transfers || [],
      },
    };
  }

  /**
   * Update academic level and grade
   */
  async updateAcademicLevel(
    id: number,
    academicLevel: string,
    currentGrade: string,
    academicYear: string,
    instansiId: number,
  ) {
    const student = await this.findOne(id, instansiId);

    student.academicLevel = academicLevel;
    student.currentGrade = currentGrade;
    student.academicYear = academicYear;

    return await this.studentsRepository.save(student);
  }

  private async getActiveAcademicYear(instansiId: number): Promise<string | null> {
    const activeYear = await this.academicYearRepository.findOne({
      where: { instansiId, isActive: true },
      order: { startDate: 'DESC' },
    });

    return activeYear?.name ?? null;
  }
}
