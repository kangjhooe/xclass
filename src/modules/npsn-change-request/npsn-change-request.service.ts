import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { NpsnChangeRequest, NpsnChangeRequestStatus } from './entities/npsn-change-request.entity';
import { Tenant } from '../tenant/entities/tenant.entity';
import { CreateNpsnChangeRequestDto } from './dto/create-npsn-change-request.dto';
import { UpdateNpsnChangeRequestDto } from './dto/update-npsn-change-request.dto';

@Injectable()
export class NpsnChangeRequestService {
  constructor(
    @InjectRepository(NpsnChangeRequest)
    private npsnChangeRequestRepository: Repository<NpsnChangeRequest>,
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
    private dataSource: DataSource,
  ) {}

  async create(
    tenantId: number,
    createDto: CreateNpsnChangeRequestDto,
    requestedById: number,
  ): Promise<NpsnChangeRequest> {
    // Cek tenant
    const tenant = await this.tenantRepository.findOne({
      where: { id: tenantId },
    });
    if (!tenant) {
      throw new NotFoundException('Tenant tidak ditemukan');
    }

    // Cek apakah ada request pending
    const pendingRequest = await this.npsnChangeRequestRepository.findOne({
      where: {
        tenantId,
        status: NpsnChangeRequestStatus.PENDING,
      },
    });
    if (pendingRequest) {
      throw new BadRequestException(
        'Sudah ada request perubahan NPSN yang sedang menunggu persetujuan',
      );
    }

    // Cek apakah NPSN baru sudah digunakan
    const existingTenant = await this.tenantRepository.findOne({
      where: { npsn: createDto.requestedNpsn },
    });
    if (existingTenant) {
      throw new ConflictException('NPSN yang diminta sudah digunakan oleh tenant lain');
    }

    // Cek apakah NPSN baru sama dengan NPSN saat ini
    if (tenant.npsn === createDto.requestedNpsn) {
      throw new BadRequestException('NPSN baru harus berbeda dengan NPSN saat ini');
    }

    const request = this.npsnChangeRequestRepository.create({
      tenantId,
      currentNpsn: tenant.npsn,
      requestedNpsn: createDto.requestedNpsn,
      reason: createDto.reason,
      requestedById,
      status: NpsnChangeRequestStatus.PENDING,
    });

    return await this.npsnChangeRequestRepository.save(request);
  }

  async findAll(status?: NpsnChangeRequestStatus): Promise<NpsnChangeRequest[]> {
    const where: any = {};
    if (status) {
      where.status = status;
    }
    return await this.npsnChangeRequestRepository.find({
      where,
      relations: ['tenant', 'requestedBy', 'reviewedBy'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByTenant(tenantId: number): Promise<NpsnChangeRequest[]> {
    return await this.npsnChangeRequestRepository.find({
      where: { tenantId },
      relations: ['requestedBy', 'reviewedBy'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<NpsnChangeRequest> {
    const request = await this.npsnChangeRequestRepository.findOne({
      where: { id },
      relations: ['tenant', 'requestedBy', 'reviewedBy'],
    });
    if (!request) {
      throw new NotFoundException('Request perubahan NPSN tidak ditemukan');
    }
    return request;
  }

  async update(
    id: number,
    updateDto: UpdateNpsnChangeRequestDto,
    reviewedById: number,
  ): Promise<NpsnChangeRequest> {
    const request = await this.findOne(id);

    if (request.status !== NpsnChangeRequestStatus.PENDING) {
      throw new BadRequestException(
        'Request ini sudah diproses dan tidak dapat diubah lagi',
      );
    }

    // Jika disetujui, update NPSN tenant
    if (updateDto.status === NpsnChangeRequestStatus.APPROVED) {
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        // Cek lagi apakah NPSN masih tersedia
        const existingTenant = await queryRunner.manager.findOne(Tenant, {
          where: { npsn: request.requestedNpsn },
        });
        if (existingTenant) {
          throw new ConflictException('NPSN yang diminta sudah digunakan oleh tenant lain');
        }

        // Update NPSN tenant
        await queryRunner.manager.update(
          Tenant,
          { id: request.tenantId },
          { npsn: request.requestedNpsn },
        );

        // Update request
        request.status = NpsnChangeRequestStatus.APPROVED;
        request.reviewedById = reviewedById;
        request.reviewNote = updateDto.reviewNote;
        await queryRunner.manager.save(NpsnChangeRequest, request);

        await queryRunner.commitTransaction();
      } catch (error) {
        await queryRunner.rollbackTransaction();
        throw error;
      } finally {
        await queryRunner.release();
      }
    } else if (updateDto.status === NpsnChangeRequestStatus.REJECTED) {
      request.status = NpsnChangeRequestStatus.REJECTED;
      request.reviewedById = reviewedById;
      request.reviewNote = updateDto.reviewNote;
      await this.npsnChangeRequestRepository.save(request);
    }

    return await this.findOne(id);
  }

  async cancel(id: number, tenantId: number): Promise<void> {
    const request = await this.findOne(id);

    if (request.tenantId !== tenantId) {
      throw new BadRequestException('Anda tidak memiliki akses untuk membatalkan request ini');
    }

    if (request.status !== NpsnChangeRequestStatus.PENDING) {
      throw new BadRequestException('Hanya request yang pending yang dapat dibatalkan');
    }

    await this.npsnChangeRequestRepository.remove(request);
  }
}

