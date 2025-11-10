import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudentTransfer, TransferStatus } from './entities/student-transfer.entity';
import { Student } from '../students/entities/student.entity';
import { CreateStudentTransferDto } from './dto/create-student-transfer.dto';
import { UpdateStudentTransferDto } from './dto/update-student-transfer.dto';
import { ApproveTransferDto } from './dto/approve-transfer.dto';
import { RejectTransferDto } from './dto/reject-transfer.dto';

@Injectable()
export class StudentTransferService {
  constructor(
    @InjectRepository(StudentTransfer)
    private transferRepository: Repository<StudentTransfer>,
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
  ) {}

  async create(createTransferDto: CreateStudentTransferDto, instansiId: number) {
    // Check if student exists
    const student = await this.studentRepository.findOne({
      where: { id: createTransferDto.studentId, instansiId },
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${createTransferDto.studentId} not found`);
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

    // Create student data snapshot
    const studentData = {
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
    };

    const transfer = this.transferRepository.create({
      ...createTransferDto,
      fromTenantId: instansiId,
      status: TransferStatus.PENDING,
      studentData,
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
        '(student.name LIKE :search OR student.studentNumber LIKE :search OR student.nisn LIKE :search)',
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

    return {
      data,
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

    // Only allow delete from source tenant
    if (transfer.fromTenantId !== instansiId) {
      throw new BadRequestException('Only source tenant can delete transfer request');
    }

    await this.transferRepository.remove(transfer);
    return { message: 'Transfer request deleted successfully' };
  }

  async approve(id: number, approveDto: ApproveTransferDto, instansiId: number, userId: number) {
    const transfer = await this.findOne(id, instansiId);

    // Only destination tenant can approve
    if (transfer.toTenantId !== instansiId) {
      throw new BadRequestException('Only destination tenant can approve transfer');
    }

    if (transfer.status !== TransferStatus.PENDING) {
      throw new BadRequestException('Transfer is not in pending status');
    }

    transfer.status = TransferStatus.APPROVED;
    transfer.processedBy = userId;
    transfer.processedAt = new Date();
    if (approveDto.notes) {
      transfer.notes = approveDto.notes;
    }

    return await this.transferRepository.save(transfer);
  }

  async reject(id: number, rejectDto: RejectTransferDto, instansiId: number, userId: number) {
    const transfer = await this.findOne(id, instansiId);

    // Only destination tenant can reject
    if (transfer.toTenantId !== instansiId) {
      throw new BadRequestException('Only destination tenant can reject transfer');
    }

    if (transfer.status !== TransferStatus.PENDING) {
      throw new BadRequestException('Transfer is not in pending status');
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

    // Only source tenant can complete (after student data is transferred)
    if (transfer.fromTenantId !== instansiId) {
      throw new BadRequestException('Only source tenant can complete transfer');
    }

    transfer.status = TransferStatus.COMPLETED;
    transfer.processedBy = userId;
    transfer.processedAt = new Date();

    return await this.transferRepository.save(transfer);
  }

  async cancel(id: number, instansiId: number) {
    const transfer = await this.findOne(id, instansiId);

    if (transfer.status !== TransferStatus.PENDING) {
      throw new BadRequestException('Only pending transfers can be cancelled');
    }

    // Only source tenant can cancel
    if (transfer.fromTenantId !== instansiId) {
      throw new BadRequestException('Only source tenant can cancel transfer');
    }

    await this.transferRepository.remove(transfer);
    return { message: 'Transfer request cancelled successfully' };
  }
}

