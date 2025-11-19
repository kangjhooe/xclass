import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from './entities/student.entity';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { AcademicYear } from '../academic-year/entities/academic-year.entity';
import { CacheService } from '../../common/cache/cache.service';
import { CacheKeys } from '../../common/cache/cache-keys';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private studentsRepository: Repository<Student>,
    @InjectRepository(AcademicYear)
    private academicYearRepository: Repository<AcademicYear>,
    private cacheService: CacheService,
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
    // Check for duplicate NIK (required identifier)
    if (createStudentDto.nik) {
      const existing = await this.studentsRepository.findOne({
        where: { nik: createStudentDto.nik },
      });
      if (existing) {
        throw new ConflictException(`Siswa dengan NIK ${createStudentDto.nik} sudah terdaftar`);
      }
    }

    // Check for duplicate NISN if provided (optional)
    if (createStudentDto.nisn) {
      const existing = await this.studentsRepository.findOne({
        where: { nisn: createStudentDto.nisn, instansiId },
      });
      if (existing) {
        throw new ConflictException(`Siswa dengan NISN ${createStudentDto.nisn} sudah terdaftar`);
      }
    }

    // Validasi: Siswa hanya bisa aktif di 1 tenant berdasarkan NIK
    const isActive = createStudentDto.isActive ?? true;
    if (isActive && createStudentDto.nik) {
      const activeStudentInOtherTenant = await this.studentsRepository.findOne({
        where: { 
          nik: createStudentDto.nik, 
          isActive: true,
        },
      });
      
      if (activeStudentInOtherTenant && activeStudentInOtherTenant.instansiId !== instansiId) {
        throw new ConflictException(
          `Siswa dengan NIK ${createStudentDto.nik} sudah aktif di tenant lain. Siswa hanya bisa aktif di 1 tenant.`
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
      const savedStudent = await this.studentsRepository.save(student);
      
      // Invalidate cache
      await this.cacheService.invalidatePattern(CacheKeys.studentsPattern(instansiId));
      await this.cacheService.del(CacheKeys.dashboard(instansiId));
      
      return savedStudent;
    } catch (error: any) {
      if (error.code === 'ER_DUP_ENTRY' || error.code === '23505') {
        throw new ConflictException('Data siswa dengan NIK atau identitas yang sama sudah terdaftar');
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

    // Generate cache key based on filters
    const cacheKey = `tenant:${instansiId}:students:page:${page}:limit:${limit}:class:${classId || 'all'}:status:${status || 'all'}:gender:${gender || 'all'}:year:${academicYear || 'all'}:search:${search || ''}`;
    
    // Try to get from cache (only if no search query, as search results change frequently)
    if (!search) {
      const cached = await this.cacheService.get(cacheKey);
      if (cached) {
        return cached;
      }
    }
    
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

    const result = {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };

    // Cache result (only if no search, TTL: 5 minutes)
    if (!search) {
      await this.cacheService.set(cacheKey, result, 300);
    }

    return result;
  }

  async findOne(id: number, instansiId: number): Promise<Student> {
    const cacheKey = CacheKeys.student(id, instansiId);
    
    // Try to get from cache
    const cached = await this.cacheService.get<Student>(cacheKey);
    if (cached) {
      return cached;
    }

    const student = await this.studentsRepository.findOne({
      where: { id, instansiId },
      relations: ['classRoom', 'attendances', 'grades'],
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }

    // Cache result (TTL: 10 minutes for single entity)
    await this.cacheService.set(cacheKey, student, 600);

    return student;
  }

  async update(id: number, updateStudentDto: UpdateStudentDto, instansiId: number) {
    const student = await this.findOne(id, instansiId);
    
    // Check for duplicate NIK if provided and different from current
    if (updateStudentDto.nik && updateStudentDto.nik !== student.nik) {
      const existing = await this.studentsRepository.findOne({
        where: { nik: updateStudentDto.nik },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException(`Siswa dengan NIK ${updateStudentDto.nik} sudah terdaftar`);
      }
    }

    // Check for duplicate NISN if provided and different from current (optional)
    if (updateStudentDto.nisn && updateStudentDto.nisn !== student.nisn) {
      const existing = await this.studentsRepository.findOne({
        where: { nisn: updateStudentDto.nisn, instansiId },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException(`Siswa dengan NISN ${updateStudentDto.nisn} sudah terdaftar`);
      }
    }

    // Validasi: Siswa hanya bisa aktif di 1 tenant berdasarkan NIK
    const nikToCheck = updateStudentDto.nik || student.nik;
    const willBeActive = updateStudentDto.isActive !== undefined ? updateStudentDto.isActive : student.isActive;
    
    if (willBeActive && nikToCheck) {
      const activeStudentInOtherTenant = await this.studentsRepository.findOne({
        where: { 
          nik: nikToCheck, 
          isActive: true,
        },
      });
      
      if (activeStudentInOtherTenant && activeStudentInOtherTenant.id !== id && activeStudentInOtherTenant.instansiId !== instansiId) {
        throw new ConflictException(
          `Siswa dengan NIK ${nikToCheck} sudah aktif di tenant lain. Siswa hanya bisa aktif di 1 tenant.`
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
      const updatedStudent = await this.studentsRepository.save(student);
      
      // Invalidate cache
      await this.cacheService.del(CacheKeys.student(id, instansiId));
      await this.cacheService.invalidatePattern(CacheKeys.studentsPattern(instansiId));
      await this.cacheService.del(CacheKeys.dashboard(instansiId));
      
      return updatedStudent;
    } catch (error: any) {
      if (error.code === 'ER_DUP_ENTRY' || error.code === '23505') {
        throw new ConflictException('Data siswa dengan NIK atau identitas yang sama sudah terdaftar');
      }
      throw new BadRequestException(`Gagal mengupdate data siswa: ${error.message}`);
    }
  }

  async remove(id: number, instansiId: number) {
    const student = await this.findOne(id, instansiId);
    await this.studentsRepository.remove(student);
    
    // Invalidate cache
    await this.cacheService.del(CacheKeys.student(id, instansiId));
    await this.cacheService.invalidatePattern(CacheKeys.studentsPattern(instansiId));
    await this.cacheService.del(CacheKeys.dashboard(instansiId));
    
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
   * Get student by NIK (for lifetime tracking)
   */
  async findByNik(nik: string, instansiId?: number) {
    const where: any = { nik };
    if (instansiId) {
      where.instansiId = instansiId;
    }

    const student = await this.studentsRepository.findOne({
      where,
    });

    if (!student) {
      throw new NotFoundException(`Student with NIK ${nik} not found`);
    }

    return student;
  }

  /**
   * Get student by NISN
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
  async getLifetimeData(nik: string, instansiId?: number) {
    const student = await this.findByNik(nik, instansiId);

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
        'biometricEnrollments',
        'biometricEnrollments.device',
        'biometricAttendances',
        'biometricAttendances.device',
        'signedDocuments',
        'signedDocuments.signature',
        'promotions',
        'promotions.fromClass',
        'promotions.toClass',
        'bookLoans',
        'bookLoans.book',
        'sppPayments',
        'eventRegistrations',
        'eventRegistrations.event',
        'courseVideoProgresses',
        'courseVideoProgresses.video',
        'courseQuizAttempts',
        'courseQuizAttempts.quiz',
        'courseAssignmentSubmissions',
        'courseAssignmentSubmissions.assignment',
        'cards',
        'cafeteriaOrders',
        'cafeteriaOrders.orderItems',
      ],
    });

    if (!studentWithRelations) {
      throw new NotFoundException(`Student with NIK ${nik} not found`);
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
        nik: studentWithRelations.nik,
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
        totalBiometricEnrollments: studentWithRelations.biometricEnrollments?.length || 0,
        totalBiometricAttendances: studentWithRelations.biometricAttendances?.length || 0,
        totalSignedDocuments: studentWithRelations.signedDocuments?.length || 0,
        totalPromotions: studentWithRelations.promotions?.length || 0,
        totalBookLoans: studentWithRelations.bookLoans?.length || 0,
        totalSppPayments: studentWithRelations.sppPayments?.length || 0,
        totalEventRegistrations: studentWithRelations.eventRegistrations?.length || 0,
        totalCourseVideoProgresses: studentWithRelations.courseVideoProgresses?.length || 0,
        totalCourseQuizAttempts: studentWithRelations.courseQuizAttempts?.length || 0,
        totalCourseAssignmentSubmissions: studentWithRelations.courseAssignmentSubmissions?.length || 0,
        totalCards: studentWithRelations.cards?.length || 0,
        totalCafeteriaOrders: studentWithRelations.cafeteriaOrders?.length || 0,
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
        biometricEnrollments: studentWithRelations.biometricEnrollments || [],
        biometricAttendances: studentWithRelations.biometricAttendances || [],
        signedDocuments: studentWithRelations.signedDocuments || [],
        promotions: studentWithRelations.promotions || [],
        bookLoans: studentWithRelations.bookLoans || [],
        sppPayments: studentWithRelations.sppPayments || [],
        eventRegistrations: studentWithRelations.eventRegistrations || [],
        courseVideoProgresses: studentWithRelations.courseVideoProgresses || [],
        courseQuizAttempts: studentWithRelations.courseQuizAttempts || [],
        courseAssignmentSubmissions: studentWithRelations.courseAssignmentSubmissions || [],
        cards: studentWithRelations.cards || [],
        cafeteriaOrders: studentWithRelations.cafeteriaOrders || [],
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
