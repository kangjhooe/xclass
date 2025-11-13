import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { TeacherBranchRequest, BranchRequestStatus } from './entities/teacher-branch-request.entity';
import { Teacher } from '../teachers/entities/teacher.entity';
import { Tenant } from '../tenant/entities/tenant.entity';
import { QuestionBank } from '../exams/entities/question-bank.entity';
import { Question } from '../exams/entities/question.entity';
import { Stimulus } from '../exams/entities/stimulus.entity';
import { CreateTeacherBranchRequestDto } from './dto/create-teacher-branch-request.dto';
import { RequestTeacherBranchDto } from './dto/request-teacher-branch.dto';
import { ApproveBranchRequestDto } from './dto/approve-branch-request.dto';
import { RejectBranchRequestDto } from './dto/reject-branch-request.dto';

@Injectable()
export class TeacherBranchService {
  constructor(
    @InjectRepository(TeacherBranchRequest)
    private branchRequestRepository: Repository<TeacherBranchRequest>,
    @InjectRepository(Teacher)
    private teacherRepository: Repository<Teacher>,
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
    @InjectRepository(QuestionBank)
    private questionBanksRepository: Repository<QuestionBank>,
    @InjectRepository(Question)
    private questionsRepository: Repository<Question>,
    @InjectRepository(Stimulus)
    private stimuliRepository: Repository<Stimulus>,
  ) {}

  /**
   * Membuat snapshot lengkap data guru untuk branch
   */
  private createCompleteTeacherSnapshot(teacher: Teacher): Record<string, any> {
    return {
      name: teacher.name,
      email: teacher.email,
      phone: teacher.phone,
      employeeNumber: teacher.employeeNumber,
      nip: teacher.nip,
      nik: teacher.nik,
      nuptk: teacher.nuptk,
      gender: teacher.gender,
      birthDate: teacher.birthDate,
      birthPlace: teacher.birthPlace,
      address: teacher.address,
      education: teacher.education,
      specialization: teacher.specialization,
    };
  }

  /**
   * Create branch request dari tenant induk (push)
   */
  async create(createDto: CreateTeacherBranchRequestDto, instansiId: number) {
    const teacher = await this.teacherRepository.findOne({
      where: { id: createDto.teacherId, instansiId },
    });

    if (!teacher) {
      throw new NotFoundException(`Guru dengan ID ${createDto.teacherId} tidak ditemukan`);
    }

    if (!teacher.isActive) {
      throw new BadRequestException('Guru harus aktif untuk dicabangkan');
    }

    if (!teacher.isMainTenant) {
      throw new BadRequestException('Hanya guru di tenant induk yang bisa dicabangkan');
    }

    // Cari tenant tujuan
    let toTenant: Tenant;
    if (createDto.toTenantId) {
      toTenant = await this.tenantRepository.findOne({
        where: { id: createDto.toTenantId },
      });
    } else if (createDto.toTenantNpsn) {
      toTenant = await this.tenantRepository.findOne({
        where: { npsn: createDto.toTenantNpsn },
      });
    } else {
      throw new BadRequestException('toTenantId atau toTenantNpsn harus diisi');
    }

    if (!toTenant) {
      throw new NotFoundException('Tenant tujuan tidak ditemukan');
    }

    if (toTenant.id === instansiId) {
      throw new BadRequestException('Tidak bisa mencabangkan ke tenant sendiri');
    }

    // Cek apakah sudah ada request yang pending
    const existingRequest = await this.branchRequestRepository.findOne({
      where: {
        teacherId: teacher.id,
        fromTenantId: instansiId,
        toTenantId: toTenant.id,
        status: BranchRequestStatus.PENDING,
      },
    });

    if (existingRequest) {
      throw new BadRequestException('Request cabang untuk guru ini sudah ada dan masih pending');
    }

    // Cek apakah guru sudah ada di tenant tujuan
    if (teacher.nik) {
      const existingTeacherInDestination = await this.teacherRepository.findOne({
        where: { nik: teacher.nik, instansiId: toTenant.id },
      });

      if (existingTeacherInDestination && existingTeacherInDestination.isActive) {
        throw new BadRequestException(
          `Guru dengan NIK ${teacher.nik} sudah aktif di tenant tujuan`,
        );
      }
    }

    const teacherSnapshot = this.createCompleteTeacherSnapshot(teacher);

    const branchRequest = this.branchRequestRepository.create({
      teacherId: teacher.id,
      fromTenantId: instansiId,
      toTenantId: toTenant.id,
      reason: createDto.reason,
      notes: createDto.notes,
      branchDate: createDto.branchDate ? new Date(createDto.branchDate) : null,
      teacherData: teacherSnapshot,
      requestType: 'push',
      initiatedByTenantId: instansiId,
      status: BranchRequestStatus.PENDING,
      copyQuestionBanks: createDto.copyQuestionBanks ?? false,
    });

    return await this.branchRequestRepository.save(branchRequest);
  }

  /**
   * Request branch dari tenant cabang (pull)
   */
  async requestBranch(requestDto: RequestTeacherBranchDto, instansiId: number) {
    // Cari tenant induk berdasarkan NPSN
    const sourceTenant = await this.tenantRepository.findOne({
      where: { npsn: requestDto.sourceTenantNpsn },
    });

    if (!sourceTenant) {
      throw new NotFoundException(`Tenant dengan NPSN ${requestDto.sourceTenantNpsn} tidak ditemukan`);
    }

    if (sourceTenant.id === instansiId) {
      throw new BadRequestException('Tidak bisa meminta cabang ke tenant sendiri');
    }

    // Cari guru di tenant induk berdasarkan NIK
    const teacher = await this.teacherRepository.findOne({
      where: { nik: requestDto.teacherNik, instansiId: sourceTenant.id, isActive: true },
    });

    if (!teacher) {
      throw new NotFoundException(
        `Guru dengan NIK ${requestDto.teacherNik} tidak ditemukan di tenant induk`,
      );
    }

    if (!teacher.isMainTenant) {
      throw new BadRequestException('Guru yang diminta bukan dari tenant induk');
    }

    // Cek apakah sudah ada request yang pending
    const existingRequest = await this.branchRequestRepository.findOne({
      where: {
        teacherId: teacher.id,
        fromTenantId: sourceTenant.id,
        toTenantId: instansiId,
        status: BranchRequestStatus.PENDING,
      },
    });

    if (existingRequest) {
      throw new BadRequestException('Request cabang untuk guru ini sudah ada dan masih pending');
    }

    // Cek apakah guru sudah ada di tenant tujuan
    const existingTeacherInDestination = await this.teacherRepository.findOne({
      where: { nik: teacher.nik, instansiId },
    });

    if (existingTeacherInDestination && existingTeacherInDestination.isActive) {
      throw new BadRequestException(
        `Guru dengan NIK ${teacher.nik} sudah aktif di tenant ini`,
      );
    }

    const teacherSnapshot = this.createCompleteTeacherSnapshot(teacher);

    const branchRequest = this.branchRequestRepository.create({
      teacherId: teacher.id,
      fromTenantId: sourceTenant.id,
      toTenantId: instansiId,
      reason: requestDto.reason,
      branchDate: requestDto.branchDate ? new Date(requestDto.branchDate) : null,
      teacherData: teacherSnapshot,
      requestType: 'pull',
      initiatedByTenantId: instansiId,
      status: BranchRequestStatus.PENDING,
      copyQuestionBanks: requestDto.copyQuestionBanks ?? false,
    });

    return await this.branchRequestRepository.save(branchRequest);
  }

  /**
   * Approve branch request
   */
  async approve(id: number, approveDto: ApproveBranchRequestDto, instansiId: number, userId: number) {
    const request = await this.branchRequestRepository.findOne({
      where: { id },
      relations: ['teacher'],
    });

    if (!request) {
      throw new NotFoundException(`Request cabang dengan ID ${id} tidak ditemukan`);
    }

    if (request.status !== BranchRequestStatus.PENDING) {
      throw new BadRequestException('Request sudah diproses');
    }

    // Validasi siapa yang bisa approve
    const effectiveInitiator = request.initiatedByTenantId ?? request.fromTenantId;
    const initiatedByDestination = effectiveInitiator === request.toTenantId;

    if (initiatedByDestination) {
      // Destination (tenant cabang) yang request, source (tenant induk) yang approve
      if (request.fromTenantId !== instansiId) {
        throw new BadRequestException('Hanya tenant induk yang bisa approve request ini');
      }
    } else {
      // Source (tenant induk) yang request, destination (tenant cabang) yang approve
      if (request.toTenantId !== instansiId) {
        throw new BadRequestException('Hanya tenant tujuan yang bisa approve request ini');
      }
    }

    const teacher = await this.teacherRepository.findOne({
      where: { id: request.teacherId },
    });

    if (!teacher) {
      throw new NotFoundException(`Guru dengan ID ${request.teacherId} tidak ditemukan`);
    }

    if (!teacher.isActive) {
      throw new BadRequestException('Guru harus aktif untuk dicabangkan');
    }

    // Update teacher data dengan snapshot terbaru
    const latestSnapshot = this.createCompleteTeacherSnapshot(teacher);
    request.teacherData = latestSnapshot;

    // Validasi NIK tidak duplikat di tenant tujuan
    if (teacher.nik) {
      const existingTeacherInDestination = await this.teacherRepository.findOne({
        where: { nik: teacher.nik, instansiId: request.toTenantId },
      });

      if (existingTeacherInDestination && existingTeacherInDestination.isActive) {
        const destinationTenant = await this.tenantRepository.findOne({
          where: { id: request.toTenantId },
        });
        throw new BadRequestException(
          `Guru dengan NIK ${teacher.nik} sudah ada di tenant tujuan (${destinationTenant?.name || 'tenant tujuan'})`,
        );
      }
    }

    // Buat guru baru di tenant tujuan sebagai cabang
    const teacherData = {
      ...latestSnapshot,
      instansiId: request.toTenantId,
      isActive: true,
      isMainTenant: false, // Tenant cabang
    };

    let newTeacher: Teacher;
    if (teacher.nik) {
      const existingTeacher = await this.teacherRepository.findOne({
        where: { nik: teacher.nik, instansiId: request.toTenantId },
      });

      if (existingTeacher) {
        // Update existing teacher
        Object.assign(existingTeacher, teacherData);
        newTeacher = await this.teacherRepository.save(existingTeacher);
      } else {
        // Create new teacher
        newTeacher = this.teacherRepository.create(teacherData);
        await this.teacherRepository.save(newTeacher);
      }
    } else {
      newTeacher = this.teacherRepository.create(teacherData);
      await this.teacherRepository.save(newTeacher);
    }

    request.status = BranchRequestStatus.COMPLETED;
    request.processedBy = userId;
    request.processedAt = new Date();
    request.rejectionReason = null;
    if (approveDto.notes) {
      request.notes = approveDto.notes;
    }

    // Update copyQuestionBanks jika di-override di approve
    if (approveDto.copyQuestionBanks !== undefined) {
      request.copyQuestionBanks = approveDto.copyQuestionBanks;
    }

    const savedRequest = await this.branchRequestRepository.save(request);

    // Copy bank soal jika opsi aktif
    let copiedBanksCount = 0;
    if (request.copyQuestionBanks) {
      copiedBanksCount = await this.copyQuestionBanks(
        teacher.id,
        request.fromTenantId,
        newTeacher.id,
        request.toTenantId,
      );
    }

    return {
      ...savedRequest,
      newTeacherId: newTeacher.id,
      copiedQuestionBanksCount: copiedBanksCount,
    };
  }

  /**
   * Copy bank soal dari tenant asal ke tenant baru
   * @param sourceTeacherId ID guru di tenant asal
   * @param sourceTenantId ID tenant asal
   * @param targetTeacherId ID guru baru di tenant tujuan
   * @param targetTenantId ID tenant tujuan
   * @returns Jumlah bank soal yang berhasil di-copy
   */
  private async copyQuestionBanks(
    sourceTeacherId: number,
    sourceTenantId: number,
    targetTeacherId: number,
    targetTenantId: number,
  ): Promise<number> {
    // Ambil semua bank soal milik guru di tenant asal
    const sourceBanks = await this.questionBanksRepository.find({
      where: {
        teacherId: sourceTeacherId,
        instansiId: sourceTenantId,
      },
    });

    if (sourceBanks.length === 0) {
      return 0;
    }

    let copiedCount = 0;
    const stimulusMap = new Map<number, number>(); // Map stimulus ID lama -> baru

    // Copy setiap bank soal
    for (const sourceBank of sourceBanks) {
      // Ambil questions dari bank soal menggunakan query builder (many-to-many)
      const sourceQuestions = await this.questionsRepository
        .createQueryBuilder('question')
        .leftJoinAndSelect('question.stimulus', 'stimulus')
        .innerJoin('question_bank_questions', 'qbq', 'qbq.question_id = question.id')
        .where('qbq.question_bank_id = :bankId', { bankId: sourceBank.id })
        .andWhere('question.instansiId = :instansiId', { instansiId: sourceTenantId })
        .getMany();

      // Buat bank soal baru
      const newBank = this.questionBanksRepository.create({
        name: sourceBank.name,
        description: sourceBank.description,
        teacherId: targetTeacherId,
        subjectId: sourceBank.subjectId, // Subject ID mungkin perlu mapping jika berbeda antar tenant
        classId: sourceBank.classId, // Class ID mungkin perlu mapping jika berbeda antar tenant
        isShared: false, // Reset shared status
        instansiId: targetTenantId,
      });

      const savedBank = await this.questionBanksRepository.save(newBank);
      copiedCount++;

      // Copy semua soal dalam bank
      if (sourceQuestions && sourceQuestions.length > 0) {
        const questionIds: number[] = [];

        for (const sourceQuestion of sourceQuestions) {
          // Copy stimulus jika ada dan belum di-copy
          let newStimulusId: number | null = null;
          if (sourceQuestion.stimulusId) {
            if (!stimulusMap.has(sourceQuestion.stimulusId)) {
              const sourceStimulus = await this.stimuliRepository.findOne({
                where: { id: sourceQuestion.stimulusId, instansiId: sourceTenantId },
              });

              if (sourceStimulus) {
                const newStimulus = this.stimuliRepository.create({
                  title: sourceStimulus.title,
                  content: sourceStimulus.content,
                  contentType: sourceStimulus.contentType,
                  fileUrl: sourceStimulus.fileUrl, // File URL tetap sama (shared storage)
                  metadata: sourceStimulus.metadata,
                  createdBy: targetTeacherId,
                  instansiId: targetTenantId,
                });

                const savedStimulus = await this.stimuliRepository.save(newStimulus);
                stimulusMap.set(sourceQuestion.stimulusId, savedStimulus.id);
                newStimulusId = savedStimulus.id;
              }
            } else {
              newStimulusId = stimulusMap.get(sourceQuestion.stimulusId)!;
            }
          }

          // Copy soal
          const newQuestion = this.questionsRepository.create({
            questionText: sourceQuestion.questionText,
            questionType: sourceQuestion.questionType,
            options: sourceQuestion.options,
            correctAnswer: sourceQuestion.correctAnswer,
            explanation: sourceQuestion.explanation,
            points: sourceQuestion.points,
            difficulty: sourceQuestion.difficulty,
            order: sourceQuestion.order,
            isActive: sourceQuestion.isActive,
            metadata: sourceQuestion.metadata,
            stimulusId: newStimulusId,
            questionBankId: savedBank.id,
            createdBy: targetTeacherId,
            instansiId: targetTenantId,
          });

          const savedQuestion = await this.questionsRepository.save(newQuestion);
          questionIds.push(savedQuestion.id);
        }

        // Update relasi many-to-many question_bank_questions
        if (questionIds.length > 0) {
          await this.questionBanksRepository
            .createQueryBuilder()
            .relation(QuestionBank, 'questions')
            .of(savedBank.id)
            .add(questionIds);
        }
      }
    }

    return copiedCount;
  }

  /**
   * Reject branch request
   */
  async reject(id: number, rejectDto: RejectBranchRequestDto, instansiId: number, userId: number) {
    const request = await this.branchRequestRepository.findOne({
      where: { id },
    });

    if (!request) {
      throw new NotFoundException(`Request cabang dengan ID ${id} tidak ditemukan`);
    }

    if (request.status !== BranchRequestStatus.PENDING) {
      throw new BadRequestException('Request sudah diproses');
    }

    // Validasi siapa yang bisa reject
    const effectiveInitiator = request.initiatedByTenantId ?? request.fromTenantId;
    const initiatedByDestination = effectiveInitiator === request.toTenantId;

    if (initiatedByDestination) {
      // Destination yang request, source yang reject
      if (request.fromTenantId !== instansiId) {
        throw new BadRequestException('Hanya tenant induk yang bisa reject request ini');
      }
    } else {
      // Source yang request, destination yang reject
      if (request.toTenantId !== instansiId) {
        throw new BadRequestException('Hanya tenant tujuan yang bisa reject request ini');
      }
    }

    request.status = BranchRequestStatus.REJECTED;
    request.processedBy = userId;
    request.processedAt = new Date();
    request.rejectionReason = rejectDto.rejectionReason;

    return await this.branchRequestRepository.save(request);
  }

  /**
   * Get all branch requests
   */
  async findAll(instansiId: number, filters?: { status?: BranchRequestStatus; type?: 'incoming' | 'outgoing' }) {
    const queryBuilder = this.branchRequestRepository
      .createQueryBuilder('request')
      .leftJoinAndSelect('request.teacher', 'teacher')
      .where('(request.fromTenantId = :instansiId OR request.toTenantId = :instansiId)', {
        instansiId,
      });

    if (filters?.status) {
      queryBuilder.andWhere('request.status = :status', { status: filters.status });
    }

    if (filters?.type === 'incoming') {
      queryBuilder.andWhere('request.toTenantId = :instansiId', { instansiId });
    } else if (filters?.type === 'outgoing') {
      queryBuilder.andWhere('request.fromTenantId = :instansiId', { instansiId });
    }

    queryBuilder.orderBy('request.createdAt', 'DESC');

    return await queryBuilder.getMany();
  }

  /**
   * Get branch request by ID
   */
  async findOne(id: number, instansiId: number) {
    const request = await this.branchRequestRepository.findOne({
      where: { id },
      relations: ['teacher'],
    });

    if (!request) {
      throw new NotFoundException(`Request cabang dengan ID ${id} tidak ditemukan`);
    }

    if (request.fromTenantId !== instansiId && request.toTenantId !== instansiId) {
      throw new BadRequestException('Anda tidak memiliki akses ke request ini');
    }

    return request;
  }
}

