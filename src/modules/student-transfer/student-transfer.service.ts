import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { StudentTransfer, TransferStatus } from './entities/student-transfer.entity';
import { Student } from '../students/entities/student.entity';
import { Tenant } from '../tenant/entities/tenant.entity';
import { StudentGrade } from '../grades/entities/student-grade.entity';
import { HealthRecord } from '../health/entities/health-record.entity';
import { CounselingSession } from '../counseling/entities/counseling-session.entity';
import { DisciplinaryAction } from '../discipline/entities/disciplinary-action.entity';
import { SppPayment } from '../finance/entities/spp-payment.entity';
import { ExtracurricularParticipant } from '../extracurricular/entities/extracurricular-participant.entity';
import { CourseEnrollment } from '../elearning/entities/course-enrollment.entity';
import { CourseProgress } from '../elearning/entities/course-progress.entity';
import { CreateStudentTransferDto } from './dto/create-student-transfer.dto';
import { CreatePullRequestDto } from './dto/create-pull-request.dto';
import { UpdateStudentTransferDto } from './dto/update-student-transfer.dto';
import { ApproveTransferDto } from './dto/approve-transfer.dto';
import { RejectTransferDto } from './dto/reject-transfer.dto';
import { RequestStudentTransferDto } from './dto/request-student-transfer.dto';

@Injectable()
export class StudentTransferService {
  constructor(
    @InjectRepository(StudentTransfer)
    private transferRepository: Repository<StudentTransfer>,
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
    @InjectRepository(StudentGrade)
    private gradeRepository: Repository<StudentGrade>,
    @InjectRepository(HealthRecord)
    private healthRecordRepository: Repository<HealthRecord>,
    @InjectRepository(CounselingSession)
    private counselingRepository: Repository<CounselingSession>,
    @InjectRepository(DisciplinaryAction)
    private disciplineRepository: Repository<DisciplinaryAction>,
    @InjectRepository(SppPayment)
    private sppPaymentRepository: Repository<SppPayment>,
    @InjectRepository(ExtracurricularParticipant)
    private extracurricularRepository: Repository<ExtracurricularParticipant>,
    @InjectRepository(CourseEnrollment)
    private courseEnrollmentRepository: Repository<CourseEnrollment>,
    @InjectRepository(CourseProgress)
    private courseProgressRepository: Repository<CourseProgress>,
    private dataSource: DataSource,
  ) {}

  /**
   * Membuat snapshot lengkap data siswa untuk transfer
   */
  private createCompleteStudentSnapshot(student: Student): Record<string, any> {
    return {
      // Identitas Dasar
      name: student.name,
      email: student.email,
      phone: student.phone,
      address: student.address,
      birthDate: student.birthDate,
      birthPlace: student.birthPlace,
      gender: student.gender,
      religion: student.religion,
      nisn: student.nisn,
      studentNumber: student.studentNumber,
      classId: student.classId,
      nik: student.nik,
      nationality: student.nationality,
      ethnicity: student.ethnicity,
      language: student.language,
      bloodType: student.bloodType,
      
      // Alamat Lengkap
      rt: student.rt,
      rw: student.rw,
      village: student.village,
      subDistrict: student.subDistrict,
      district: student.district,
      city: student.city,
      province: student.province,
      postalCode: student.postalCode,
      residenceType: student.residenceType,
      transportation: student.transportation,
      
      // Data Kesehatan
      height: student.height,
      weight: student.weight,
      healthCondition: student.healthCondition,
      healthNotes: student.healthNotes,
      allergies: student.allergies,
      medications: student.medications,
      disabilityType: student.disabilityType,
      disabilityDescription: student.disabilityDescription,
      
      // Data Orang Tua - Ayah
      fatherName: student.fatherName,
      fatherNik: student.fatherNik,
      fatherBirthDate: student.fatherBirthDate,
      fatherBirthPlace: student.fatherBirthPlace,
      fatherEducation: student.fatherEducation,
      fatherOccupation: student.fatherOccupation,
      fatherCompany: student.fatherCompany,
      fatherPhone: student.fatherPhone,
      fatherEmail: student.fatherEmail,
      fatherIncome: student.fatherIncome,
      
      // Data Orang Tua - Ibu
      motherName: student.motherName,
      motherNik: student.motherNik,
      motherBirthDate: student.motherBirthDate,
      motherBirthPlace: student.motherBirthPlace,
      motherEducation: student.motherEducation,
      motherOccupation: student.motherOccupation,
      motherCompany: student.motherCompany,
      motherPhone: student.motherPhone,
      motherEmail: student.motherEmail,
      motherIncome: student.motherIncome,
      
      // Data Wali
      guardianName: student.guardianName,
      guardianNik: student.guardianNik,
      guardianBirthDate: student.guardianBirthDate,
      guardianBirthPlace: student.guardianBirthPlace,
      guardianEducation: student.guardianEducation,
      guardianOccupation: student.guardianOccupation,
      guardianCompany: student.guardianCompany,
      guardianPhone: student.guardianPhone,
      guardianEmail: student.guardianEmail,
      guardianIncome: student.guardianIncome,
      guardianRelationship: student.guardianRelationship,
      
      // Data Orang Tua (Legacy - untuk backward compatibility)
      parentName: student.parentName,
      parentPhone: student.parentPhone,
      parentEmail: student.parentEmail,
      
      // Data Sekolah Sebelumnya
      previousSchool: student.previousSchool,
      previousSchoolAddress: student.previousSchoolAddress,
      previousSchoolCity: student.previousSchoolCity,
      previousSchoolProvince: student.previousSchoolProvince,
      previousSchoolPhone: student.previousSchoolPhone,
      previousSchoolPrincipal: student.previousSchoolPrincipal,
      previousSchoolGraduationYear: student.previousSchoolGraduationYear,
      previousSchoolCertificateNumber: student.previousSchoolCertificateNumber,
      
      // Data Pendaftaran
      enrollmentDate: student.enrollmentDate,
      enrollmentSemester: student.enrollmentSemester,
      enrollmentYear: student.enrollmentYear,
      studentStatus: student.studentStatus,
      notes: student.notes,
      
      // Kontak Darurat
      emergencyContactName: student.emergencyContactName,
      emergencyContactPhone: student.emergencyContactPhone,
      emergencyContactRelationship: student.emergencyContactRelationship,
      
      // Status
      isActive: student.isActive,
    };
  }

  async create(createTransferDto: CreateStudentTransferDto, instansiId: number) {
    // Validasi tenant tujuan
    const destinationTenant = await this.tenantRepository.findOne({
      where: { id: createTransferDto.toTenantId },
    });

    if (!destinationTenant) {
      throw new NotFoundException(`Tenant tujuan dengan ID ${createTransferDto.toTenantId} tidak ditemukan`);
    }

    if (destinationTenant.id === instansiId) {
      throw new BadRequestException('Tidak dapat transfer siswa ke instansi sendiri');
    }

    // Check if student exists
    const student = await this.studentRepository.findOne({
      where: { id: createTransferDto.studentId, instansiId },
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${createTransferDto.studentId} not found`);
    }

    if (!student.isActive) {
      throw new BadRequestException('Siswa tidak aktif, tidak dapat ditransfer');
    }

    // Validasi NIK tidak duplikat di tenant tujuan
    if (student.nik) {
      const existingStudentInDestination = await this.studentRepository.findOne({
        where: { nik: student.nik },
      });

      if (existingStudentInDestination && existingStudentInDestination.isActive) {
        throw new BadRequestException(
          `Siswa dengan NIK ${student.nik} sudah ada di tenant tujuan (${destinationTenant.name})`,
        );
      }
    }

    // Check if student already has pending transfer
    const existingTransfer = await this.transferRepository.findOne({
      where: {
        studentId: createTransferDto.studentId,
        status: TransferStatus.PENDING,
      },
    });

    if (existingTransfer) {
      throw new BadRequestException('Student already has a pending transfer request');
    }

    // Create complete student data snapshot
    const studentData = this.createCompleteStudentSnapshot(student);

    const transfer = this.transferRepository.create({
      studentId: createTransferDto.studentId,
      toTenantId: createTransferDto.toTenantId,
      fromTenantId: instansiId,
      status: TransferStatus.PENDING,
      reason: createTransferDto.reason,
      notes: createTransferDto.notes,
      transferDate: createTransferDto.transferDate ? new Date(createTransferDto.transferDate) : null,
      documents: createTransferDto.documents || [],
      initiatedByTenantId: instansiId,
      transferType: 'push',
      studentData,
    });

    return await this.transferRepository.save(transfer);
  }

  async createPullRequest(createPullDto: CreatePullRequestDto, instansiId: number) {
    // Find source tenant (tenant B) by NPSN
    const sourceTenant = await this.tenantRepository.findOne({
      where: { npsn: createPullDto.sourceTenantNpsn },
    });

    if (!sourceTenant) {
      throw new NotFoundException(`Tenant dengan NPSN ${createPullDto.sourceTenantNpsn} tidak ditemukan`);
    }

    if (sourceTenant.id === instansiId) {
      throw new BadRequestException('Tidak dapat menarik siswa dari instansi sendiri');
    }

    // Find student by NIK in source tenant
    const student = await this.studentRepository.findOne({
      where: { nik: createPullDto.studentNisn, instansiId: sourceTenant.id },
    });

    if (!student) {
      throw new NotFoundException(
        `Siswa dengan NIK ${createPullDto.studentNisn} tidak ditemukan di tenant ${sourceTenant.name}`,
      );
    }

    if (!student.isActive) {
      throw new BadRequestException('Siswa tidak aktif, tidak dapat ditransfer');
    }

    // Validasi NIK tidak duplikat di tenant tujuan (instansiId)
    if (student.nik) {
      const existingStudentInDestination = await this.studentRepository.findOne({
        where: { nik: student.nik },
      });

      if (existingStudentInDestination && existingStudentInDestination.isActive) {
        const destinationTenant = await this.tenantRepository.findOne({
          where: { id: instansiId },
        });
        throw new BadRequestException(
          `Siswa dengan NIK ${student.nik} sudah ada di tenant Anda (${destinationTenant?.name || 'tenant tujuan'})`,
        );
      }
    }

    // Check if student already has pending transfer
    const existingTransfer = await this.transferRepository.findOne({
      where: {
        studentId: student.id,
        status: TransferStatus.PENDING,
      },
    });

    if (existingTransfer) {
      throw new BadRequestException('Siswa ini sudah memiliki permintaan transfer yang sedang menunggu');
    }

    // Create complete student data snapshot
    const studentData = this.createCompleteStudentSnapshot(student);

    // Create pull request: fromTenantId = source (tenant B), toTenantId = destination (tenant A)
    const transfer = this.transferRepository.create({
      studentId: student.id,
      fromTenantId: sourceTenant.id,
      toTenantId: instansiId,
      status: TransferStatus.PENDING,
      reason: createPullDto.reason,
      notes: createPullDto.notes,
      transferDate: createPullDto.transferDate ? new Date(createPullDto.transferDate) : null,
      documents: createPullDto.documents || [],
      initiatedByTenantId: instansiId,
      transferType: 'pull',
      studentData,
    });

    return await this.transferRepository.save(transfer);
  }

  async lookupStudentByNpsnAndNisn(
    sourceTenantNpsn: string,
    studentNisn: string,
    requesterTenantId: number,
  ) {
    const sourceTenant = await this.tenantRepository.findOne({
      where: { npsn: sourceTenantNpsn },
    });

    if (!sourceTenant) {
      throw new NotFoundException(`Tenant dengan NPSN ${sourceTenantNpsn} tidak ditemukan`);
    }

    if (sourceTenant.id === requesterTenantId) {
      throw new BadRequestException('Siswa sudah berada di tenant Anda');
    }

    const student = await this.studentRepository.findOne({
      where: { instansiId: sourceTenant.id, nik: studentNisn },
    });

    if (!student) {
      throw new NotFoundException('Siswa dengan NIK tersebut tidak ditemukan pada tenant sumber');
    }

    return {
      sourceTenant: {
        id: sourceTenant.id,
        npsn: sourceTenant.npsn,
        name: sourceTenant.name,
      },
      student: student,
    };
  }

  async requestTransferFromOtherTenant(
    requestDto: RequestStudentTransferDto,
    destinationTenantId: number,
  ) {
    const { sourceTenant, student } = await this.lookupStudentByNpsnAndNisn(
      requestDto.sourceTenantNpsn,
      requestDto.studentNisn,
      destinationTenantId,
    );

    // Fetch the full student entity for creating the snapshot
    const fullStudent = await this.studentRepository.findOne({
      where: { id: student.id },
    });

    if (!fullStudent) {
      throw new NotFoundException(`Student with ID ${student.id} not found`);
    }

    const existingTransfer = await this.transferRepository.findOne({
      where: {
        studentId: student.id,
        status: TransferStatus.PENDING,
      },
    });

    if (existingTransfer) {
      throw new BadRequestException('Siswa tersebut sudah memiliki pengajuan mutasi yang masih menunggu');
    }

    const transfer = this.transferRepository.create({
      studentId: student.id,
      fromTenantId: sourceTenant.id,
      toTenantId: destinationTenantId,
      status: TransferStatus.PENDING,
      reason: requestDto.reason,
      transferDate: requestDto.transferDate ? new Date(requestDto.transferDate) : null,
      documents: requestDto.documents || [],
      initiatedByTenantId: destinationTenantId,
      studentData: this.createCompleteStudentSnapshot(fullStudent),
    });

    return await this.transferRepository.save(transfer);
  }

  async findAll(filters: {
    search?: string;
    status?: string;
    studentId?: number;
    page?: number;
    limit?: number;
    instansiId: number;
  }) {
    const { search, status, studentId, page = 1, limit = 20, instansiId } = filters;

    const queryBuilder = this.transferRepository
      .createQueryBuilder('transfer')
      .leftJoinAndSelect('transfer.student', 'student')
      .where(
        '(transfer.fromTenantId = :instansiId OR transfer.toTenantId = :instansiId)',
        { instansiId },
      );

    if (search) {
      queryBuilder.andWhere(
        '(student.name LIKE :search OR student.nik LIKE :search OR student.studentNumber LIKE :search OR student.nisn LIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (status) {
      queryBuilder.andWhere('transfer.status = :status', { status });
    }

    if (studentId) {
      queryBuilder.andWhere('transfer.studentId = :studentId', { studentId });
    }

    queryBuilder.orderBy('transfer.createdAt', 'DESC');

    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    // Transform data to include tenant names and student info
    const transformedData = await Promise.all(
      data.map(async (transfer) => {
        const [fromTenant, toTenant] = await Promise.all([
          this.tenantRepository.findOne({ where: { id: transfer.fromTenantId } }),
          this.tenantRepository.findOne({ where: { id: transfer.toTenantId } }),
        ]);

        return {
          id: transfer.id,
          student_id: transfer.studentId,
          student_name: transfer.student?.name || transfer.studentData?.name || null,
          student_nis: transfer.student?.studentNumber || transfer.studentData?.studentNumber || null,
          from_instansi_id: transfer.fromTenantId,
          from_instansi_name: fromTenant?.name || null,
          to_instansi_id: transfer.toTenantId,
          to_instansi_name: toTenant?.name || null,
          transfer_date: transfer.transferDate ? transfer.transferDate.toISOString().split('T')[0] : null,
          reason: transfer.reason,
          status: transfer.status,
          documents: transfer.documents || [],
          rejection_reason: transfer.rejectionReason,
          notes: transfer.notes,
          created_at: transfer.createdAt,
          processed_at: transfer.processedAt,
          created_by: transfer.processedBy,
          initiated_by_tenant_id: transfer.initiatedByTenantId ?? transfer.fromTenantId,
        };
      })
    );

    return {
      data: transformedData,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number, instansiId: number) {
    const transfer = await this.transferRepository.findOne({
      where: { id },
      relations: ['student'],
    });

    if (!transfer) {
      throw new NotFoundException(`Transfer with ID ${id} not found`);
    }

    // Check if user has access to this transfer
    if (transfer.fromTenantId !== instansiId && transfer.toTenantId !== instansiId) {
      throw new NotFoundException(`Transfer with ID ${id} not found`);
    }

    return transfer;
  }

  async update(id: number, updateTransferDto: UpdateStudentTransferDto, instansiId: number) {
    const transfer = await this.findOne(id, instansiId);

    // Only allow update if status is pending
    if (transfer.status !== TransferStatus.PENDING) {
      throw new BadRequestException('Cannot update transfer that is not pending');
    }

    // Only allow update from source tenant
    if (transfer.fromTenantId !== instansiId) {
      throw new BadRequestException('Only source tenant can update transfer request');
    }

    Object.assign(transfer, updateTransferDto);
    return await this.transferRepository.save(transfer);
  }

  async remove(id: number, instansiId: number) {
    const transfer = await this.findOne(id, instansiId);

    // Only allow delete if status is pending
    if (transfer.status !== TransferStatus.PENDING) {
      throw new BadRequestException('Cannot delete transfer that is not pending');
    }

    const effectiveInitiator =
      transfer.initiatedByTenantId ?? transfer.fromTenantId;

    // Only allow delete from source tenant or initiating tenant
    if (
      transfer.fromTenantId !== instansiId &&
      effectiveInitiator !== instansiId
    ) {
      throw new BadRequestException('You are not allowed to delete this transfer request');
    }

    await this.transferRepository.remove(transfer);
    return { message: 'Transfer request deleted successfully' };
  }

  /**
   * Memindahkan data relasi siswa dari tenant asal ke tenant tujuan
   */
  private async transferRelatedData(
    studentId: number,
    fromTenantId: number,
    toTenantId: number,
    newStudentId: number,
  ): Promise<{ transferred: Record<string, number> }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const transferred: Record<string, number> = {};

    try {
      // Transfer Nilai (Grades)
      const gradesResult = await queryRunner.manager
        .createQueryBuilder()
        .update(StudentGrade)
        .set({ instansiId: toTenantId, studentId: newStudentId })
        .where('studentId = :studentId AND instansiId = :fromTenantId', {
          studentId,
          fromTenantId,
        })
        .execute();
      transferred.grades = gradesResult.affected || 0;

      // Transfer Catatan Kesehatan (Health Records)
      const healthResult = await queryRunner.manager
        .createQueryBuilder()
        .update(HealthRecord)
        .set({ instansiId: toTenantId, studentId: newStudentId })
        .where('studentId = :studentId AND instansiId = :fromTenantId', {
          studentId,
          fromTenantId,
        })
        .execute();
      transferred.healthRecords = healthResult.affected || 0;

      // Transfer Konseling (Counseling Sessions)
      const counselingResult = await queryRunner.manager
        .createQueryBuilder()
        .update(CounselingSession)
        .set({ instansiId: toTenantId, studentId: newStudentId })
        .where('studentId = :studentId AND instansiId = :fromTenantId', {
          studentId,
          fromTenantId,
        })
        .execute();
      transferred.counselingSessions = counselingResult.affected || 0;

      // Transfer Disiplin (Disciplinary Actions)
      const disciplineResult = await queryRunner.manager
        .createQueryBuilder()
        .update(DisciplinaryAction)
        .set({ instansiId: toTenantId, studentId: newStudentId })
        .where('studentId = :studentId AND instansiId = :fromTenantId', {
          studentId,
          fromTenantId,
        })
        .execute();
      transferred.disciplinaryActions = disciplineResult.affected || 0;

      // Transfer Ekstrakurikuler Aktif (Extracurricular Participants)
      const extracurricularResult = await queryRunner.manager
        .createQueryBuilder()
        .update(ExtracurricularParticipant)
        .set({ instansiId: toTenantId, studentId: newStudentId })
        .where('studentId = :studentId AND instansiId = :fromTenantId AND status = :status', {
          studentId,
          fromTenantId,
          status: 'active',
        })
        .execute();
      transferred.extracurricularParticipants = extracurricularResult.affected || 0;

      // Transfer E-Learning Progress (Course Progress)
      // Hanya transfer progress untuk course yang milik tenant asal
      // Note: Course memiliki instansiId, jadi kita hanya transfer progress untuk course dari tenant asal
      // Menggunakan pendekatan find + update untuk memastikan hanya course dari tenant asal yang ditransfer
      const courseProgresses = await queryRunner.manager
        .createQueryBuilder(CourseProgress, 'cp')
        .innerJoin('cp.course', 'course')
        .where('cp.studentId = :studentId', { studentId })
        .andWhere('course.instansiId = :fromTenantId', { fromTenantId })
        .getMany();

      if (courseProgresses.length > 0) {
        await queryRunner.manager.update(
          CourseProgress,
          { id: courseProgresses.map((cp) => cp.id) },
          { studentId: newStudentId },
        );
      }
      transferred.courseProgress = courseProgresses.length;

      // Transfer E-Learning Enrollment (Course Enrollment) - hanya yang belum selesai dan course milik tenant asal
      const courseEnrollments = await queryRunner.manager
        .createQueryBuilder(CourseEnrollment, 'ce')
        .innerJoin('ce.course', 'course')
        .where('ce.studentId = :studentId', { studentId })
        .andWhere('ce.isCompleted = :isCompleted', { isCompleted: false })
        .andWhere('course.instansiId = :fromTenantId', { fromTenantId })
        .getMany();

      if (courseEnrollments.length > 0) {
        await queryRunner.manager.update(
          CourseEnrollment,
          { id: courseEnrollments.map((ce) => ce.id) },
          { studentId: newStudentId },
        );
      }
      transferred.courseEnrollments = courseEnrollments.length;

      // Catatan: Data keuangan (SPP Payment) tidak dipindahkan karena terkait dengan tenant asal
      // Data kehadiran (Attendance) tidak dipindahkan karena terkait dengan jadwal kelas spesifik
      // Data ujian (Exam Attempt) tidak dipindahkan karena terkait dengan ujian spesifik tenant

      await queryRunner.commitTransaction();
      return { transferred };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(
        `Gagal memindahkan data relasi: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Membuat siswa baru di tenant tujuan berdasarkan data snapshot
   */
  private async createStudentInDestinationTenant(
    studentData: Record<string, any>,
    toTenantId: number,
  ): Promise<Student> {
    // Hapus classId karena akan diassign di tenant baru
    const { classId, instansiId, ...dataToCopy } = studentData;

    // Validasi NIK tidak duplikat di tenant tujuan
    if (dataToCopy.nik) {
      const existingStudent = await this.studentRepository.findOne({
        where: { nik: dataToCopy.nik },
      });

      if (existingStudent && existingStudent.isActive) {
        throw new BadRequestException(
          `Siswa dengan NIK ${dataToCopy.nik} sudah ada di tenant tujuan`,
        );
      }

      // Validasi: Siswa hanya bisa aktif di 1 tenant berdasarkan NIK
      // (double check untuk memastikan tidak ada siswa aktif di tenant lain)
      const activeStudentInOtherTenant = await this.studentRepository.findOne({
        where: { 
          nik: dataToCopy.nik, 
          isActive: true,
        },
      });
      
      if (activeStudentInOtherTenant && activeStudentInOtherTenant.instansiId !== toTenantId) {
        throw new BadRequestException(
          `Siswa dengan NIK ${dataToCopy.nik} masih aktif di tenant lain. Siswa hanya bisa aktif di 1 tenant.`
        );
      }
    }

    // Preserve original enrollmentDate, atau gunakan transferDate jika enrollmentDate tidak ada
    const enrollmentDate = dataToCopy.enrollmentDate
      ? new Date(dataToCopy.enrollmentDate)
      : new Date();

    const newStudent = this.studentRepository.create({
      ...dataToCopy,
      instansiId: toTenantId,
      classId: null, // Akan diassign setelah transfer
      studentNumber: null, // Mungkin perlu diupdate sesuai format tenant baru
      npsn: null, // Akan diupdate sesuai tenant baru
      isActive: true,
      enrollmentDate, // Gunakan enrollmentDate asli atau tanggal sekarang
    });

    return await this.studentRepository.save(newStudent);
  }

  async approve(id: number, approveDto: ApproveTransferDto, instansiId: number, userId: number) {
    const transfer = await this.findOne(id, instansiId);

    if (transfer.status !== TransferStatus.PENDING) {
      throw new BadRequestException('Transfer is not in pending status');
    }

    const effectiveInitiator =
      transfer.initiatedByTenantId ?? transfer.fromTenantId;
    const initiatedByDestination = effectiveInitiator === transfer.toTenantId;

    if (initiatedByDestination) {
      // Destination requested transfer, source must approve
      if (transfer.fromTenantId !== instansiId) {
        throw new BadRequestException('Only source tenant can approve this transfer');
      }

      const student = await this.studentRepository.findOne({
        where: { id: transfer.studentId },
      });

      if (!student) {
        throw new NotFoundException(`Student with ID ${transfer.studentId} not found`);
      }

      // Update student data dengan snapshot terbaru
      const latestSnapshot = this.createCompleteStudentSnapshot(student);
      transfer.studentData = latestSnapshot;

      // Validasi NIK tidak duplikat di tenant tujuan (double check sebelum transfer)
      if (student.nik) {
        const existingStudentInDestination = await this.studentRepository.findOne({
          where: { nik: student.nik },
        });

        if (existingStudentInDestination && existingStudentInDestination.isActive) {
          const destinationTenant = await this.tenantRepository.findOne({
            where: { id: transfer.toTenantId },
          });
          throw new BadRequestException(
            `Siswa dengan NIK ${student.nik} sudah ada di tenant tujuan (${destinationTenant?.name || 'tenant tujuan'})`,
          );
        }
      }

      // Nonaktifkan siswa di tenant asal SEBELUM membuat di tenant tujuan
      // (untuk menghindari konflik validasi: siswa hanya bisa aktif di 1 tenant)
      student.isActive = false;
      await this.studentRepository.save(student);

      // Buat siswa baru di tenant tujuan
      const newStudent = await this.createStudentInDestinationTenant(
        latestSnapshot,
        transfer.toTenantId,
      );

      // Transfer data relasi
      const transferResult = await this.transferRelatedData(
        student.id,
        transfer.fromTenantId,
        transfer.toTenantId,
        newStudent.id,
      );

      transfer.status = TransferStatus.COMPLETED;
      transfer.processedBy = userId;
      transfer.processedAt = new Date();
      transfer.rejectionReason = null;
      if (approveDto.notes) {
        transfer.notes = approveDto.notes;
      }

      const savedTransfer = await this.transferRepository.save(transfer);

      // Return dengan informasi lengkap tentang data yang ditransfer
      return {
        ...savedTransfer,
        newStudentId: newStudent.id,
        transferredData: transferResult.transferred,
      };
    }

    // Default behaviour: source initiated transfer, destination approves
    if (transfer.toTenantId !== instansiId) {
      throw new BadRequestException('Only destination tenant can approve transfer');
    }

    transfer.status = TransferStatus.APPROVED;
    transfer.processedBy = userId;
    transfer.processedAt = new Date();
    transfer.rejectionReason = null;
    if (approveDto.notes) {
      transfer.notes = approveDto.notes;
    }

    return await this.transferRepository.save(transfer);
  }

  async reject(id: number, rejectDto: RejectTransferDto, instansiId: number, userId: number) {
    const transfer = await this.findOne(id, instansiId);

    if (transfer.status !== TransferStatus.PENDING) {
      throw new BadRequestException('Transfer is not in pending status');
    }

    const effectiveInitiator =
      transfer.initiatedByTenantId ?? transfer.fromTenantId;
    const initiatedByDestination = effectiveInitiator === transfer.toTenantId;

    if (initiatedByDestination) {
      if (transfer.fromTenantId !== instansiId) {
        throw new BadRequestException('Only source tenant can reject this transfer');
      }
    } else {
      if (transfer.toTenantId !== instansiId) {
        throw new BadRequestException('Only destination tenant can reject transfer');
      }
    }

    transfer.status = TransferStatus.REJECTED;
    transfer.rejectionReason = rejectDto.rejectionReason;
    transfer.processedBy = userId;
    transfer.processedAt = new Date();

    return await this.transferRepository.save(transfer);
  }

  async complete(id: number, instansiId: number, userId: number) {
    const transfer = await this.findOne(id, instansiId);

    if (transfer.status !== TransferStatus.APPROVED) {
      throw new BadRequestException('Transfer must be approved before completion');
    }

    const effectiveInitiator =
      transfer.initiatedByTenantId ?? transfer.fromTenantId;

    if (effectiveInitiator === transfer.toTenantId) {
      throw new BadRequestException('This transfer is auto-completed once approved');
    }

    // Only source tenant can complete (after student data is transferred)
    if (transfer.fromTenantId !== instansiId) {
      throw new BadRequestException('Only source tenant can complete transfer');
    }

    const student = await this.studentRepository.findOne({
      where: { id: transfer.studentId, instansiId: transfer.fromTenantId },
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${transfer.studentId} not found`);
    }

    // Update student data dengan snapshot terbaru
    const latestSnapshot = this.createCompleteStudentSnapshot(student);
    transfer.studentData = latestSnapshot;

    // Validasi NIK tidak duplikat di tenant tujuan (double check sebelum transfer)
    if (student.nik) {
      const existingStudentInDestination = await this.studentRepository.findOne({
        where: { nik: student.nik },
      });

      if (existingStudentInDestination && existingStudentInDestination.isActive) {
        const destinationTenant = await this.tenantRepository.findOne({
          where: { id: transfer.toTenantId },
        });
        throw new BadRequestException(
          `Siswa dengan NIK ${student.nik} sudah ada di tenant tujuan (${destinationTenant?.name || 'tenant tujuan'})`,
        );
      }
    }

    // Buat siswa baru di tenant tujuan
    const newStudent = await this.createStudentInDestinationTenant(
      latestSnapshot,
      transfer.toTenantId,
    );

    // Transfer data relasi
    const transferResult = await this.transferRelatedData(
      student.id,
      transfer.fromTenantId,
      transfer.toTenantId,
      newStudent.id,
    );

    // Nonaktifkan siswa di tenant asal (tetap ada untuk referensi historis)
    student.isActive = false;
    await this.studentRepository.save(student);

    transfer.status = TransferStatus.COMPLETED;
    transfer.processedBy = userId;
    transfer.processedAt = new Date();

    const savedTransfer = await this.transferRepository.save(transfer);

    // Return dengan informasi lengkap tentang data yang ditransfer
    return {
      ...savedTransfer,
      newStudentId: newStudent.id,
      transferredData: transferResult.transferred,
    };
  }

  async cancel(id: number, instansiId: number) {
    const transfer = await this.findOne(id, instansiId);

    if (transfer.status !== TransferStatus.PENDING) {
      throw new BadRequestException('Only pending transfers can be cancelled');
    }

    const effectiveInitiator =
      transfer.initiatedByTenantId ?? transfer.fromTenantId;

    // Only source tenant or initiator can cancel
    if (
      transfer.fromTenantId !== instansiId &&
      effectiveInitiator !== instansiId
    ) {
      throw new BadRequestException('You are not allowed to cancel this transfer');
    }

    await this.transferRepository.remove(transfer);
    return { message: 'Transfer request cancelled successfully' };
  }
}

