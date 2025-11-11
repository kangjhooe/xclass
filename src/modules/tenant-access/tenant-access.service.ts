import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Tenant } from '../tenant/entities/tenant.entity';
import { User } from '../users/entities/user.entity';
import { TenantAccessRequest, TenantAccessStatus } from './entities/tenant-access-request.entity';
import { CreateAccessRequestDto } from './dto/create-access-request.dto';
import { ApproveAccessRequestDto } from './dto/approve-access-request.dto';
import { RejectAccessRequestDto } from './dto/reject-access-request.dto';
import { RevokeAccessDto } from './dto/revoke-access.dto';

@Injectable()
export class TenantAccessService {
  private static instance: TenantAccessService | null = null;

  constructor(
    @InjectRepository(TenantAccessRequest)
    private readonly tenantAccessRepository: Repository<TenantAccessRequest>,
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    TenantAccessService.instance = this;
  }

  static getInstance(): TenantAccessService | null {
    return TenantAccessService.instance;
  }

  async requestAccess(superAdminId: number, dto: CreateAccessRequestDto) {
    const tenant = await this.tenantRepository.findOne({ where: { id: dto.tenantId } });
    if (!tenant) {
      throw new NotFoundException('Tenant tidak ditemukan');
    }

    const superAdmin = await this.userRepository.findOne({
      where: { id: superAdminId, role: 'super_admin' },
    });
    if (!superAdmin) {
      throw new ForbiddenException('Hanya super admin yang dapat meminta akses tenant');
    }

    const existingActive = await this.tenantAccessRepository.findOne({
      where: {
        tenantId: dto.tenantId,
        superAdminId,
        status: In([
          TenantAccessStatus.APPROVED,
          TenantAccessStatus.PENDING,
        ]),
      },
      order: { createdAt: 'DESC' },
    });

    if (existingActive) {
      if (existingActive.status === TenantAccessStatus.PENDING) {
        throw new BadRequestException('Permintaan akses sedang menunggu persetujuan');
      }

      if (existingActive.status === TenantAccessStatus.APPROVED) {
        const isExpired = this.isExpired(existingActive);
        if (!isExpired) {
          throw new BadRequestException('Anda sudah memiliki akses aktif ke tenant ini');
        }
      }
    }

    const expiresAt = dto.expiresAt ? new Date(dto.expiresAt) : null;
    if (expiresAt && expiresAt.getTime() <= Date.now()) {
      throw new BadRequestException('Tanggal kedaluwarsa harus di masa depan');
    }

    const request = this.tenantAccessRepository.create({
      tenantId: dto.tenantId,
      superAdminId,
      status: TenantAccessStatus.PENDING,
      requestedAt: new Date(),
      reason: dto.reason?.trim() || null,
      expiresAt: null,
    });

    const saved = await this.tenantAccessRepository.save(request);
    return this.toResponse(saved);
  }

  async cancelRequest(superAdminId: number, requestId: number) {
    const request = await this.tenantAccessRepository.findOne({
      where: { id: requestId, superAdminId },
    });
    if (!request) {
      throw new NotFoundException('Permintaan akses tidak ditemukan');
    }

    if (request.status !== TenantAccessStatus.PENDING) {
      throw new BadRequestException('Hanya permintaan dengan status pending yang dapat dibatalkan');
    }

    request.status = TenantAccessStatus.CANCELLED;
    request.updatedAt = new Date();

    const saved = await this.tenantAccessRepository.save(request);
    return this.toResponse(saved);
  }

  async listSuperAdminRequests(superAdminId: number) {
    const requests = await this.tenantAccessRepository.find({
      where: { superAdminId },
      order: { createdAt: 'DESC' },
    });
    return requests.map((request) => this.toResponse(request));
  }

  async getActiveGrants(superAdminId: number) {
    const grants = await this.tenantAccessRepository.find({
      where: {
        superAdminId,
        status: TenantAccessStatus.APPROVED,
      },
      order: { approvedAt: 'DESC' },
    });

    const validGrants: TenantAccessRequest[] = [];
    for (const grant of grants) {
      if (this.isExpired(grant)) {
        grant.status = TenantAccessStatus.EXPIRED;
        grant.revokedAt = new Date();
        await this.tenantAccessRepository.save(grant);
      } else {
        validGrants.push(grant);
      }
    }
    return validGrants.map((grant) => this.toResponse(grant));
  }

  async listTenantRequests(tenantId: number) {
    const requests = await this.tenantAccessRepository.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
    });

    const normalized: TenantAccessRequest[] = [];
    for (const request of requests) {
      if (request.status === TenantAccessStatus.APPROVED && this.isExpired(request)) {
        request.status = TenantAccessStatus.EXPIRED;
        request.revokedAt = new Date();
        await this.tenantAccessRepository.save(request);
      }
      normalized.push(request);
    }
    return normalized.map((request) => this.toResponse(request));
  }

  async approveRequest(tenantAdminId: number, tenantId: number, requestId: number, dto: ApproveAccessRequestDto) {
    const admin = await this.userRepository.findOne({
      where: { id: tenantAdminId },
    });
    if (!admin || admin.role !== 'admin_tenant' || admin.instansiId !== tenantId) {
      throw new ForbiddenException('Hanya admin tenant terkait yang dapat menyetujui permintaan');
    }

    const request = await this.tenantAccessRepository.findOne({
      where: { id: requestId, tenantId },
    });
    if (!request) {
      throw new NotFoundException('Permintaan akses tidak ditemukan');
    }

    if (request.status !== TenantAccessStatus.PENDING) {
      throw new BadRequestException('Hanya permintaan dengan status pending yang dapat disetujui');
    }

    const expiresAt = dto.expiresAt ? new Date(dto.expiresAt) : null;
    if (expiresAt && expiresAt.getTime() <= Date.now()) {
      throw new BadRequestException('Tanggal kedaluwarsa harus di masa depan');
    }

    request.status = TenantAccessStatus.APPROVED;
    request.approvedAt = new Date();
    request.approvedBy = tenantAdminId;
    request.responseNote = dto.note?.trim() || null;
    request.expiresAt = expiresAt;

    const saved = await this.tenantAccessRepository.save(request);
    return this.toResponse(saved);
  }

  async rejectRequest(tenantAdminId: number, tenantId: number, requestId: number, dto: RejectAccessRequestDto) {
    const admin = await this.userRepository.findOne({
      where: { id: tenantAdminId },
    });
    if (!admin || admin.role !== 'admin_tenant' || admin.instansiId !== tenantId) {
      throw new ForbiddenException('Hanya admin tenant terkait yang dapat menolak permintaan');
    }

    const request = await this.tenantAccessRepository.findOne({
      where: { id: requestId, tenantId },
    });
    if (!request) {
      throw new NotFoundException('Permintaan akses tidak ditemukan');
    }

    if (request.status !== TenantAccessStatus.PENDING) {
      throw new BadRequestException('Hanya permintaan dengan status pending yang dapat ditolak');
    }

    request.status = TenantAccessStatus.REJECTED;
    request.approvedBy = tenantAdminId;
    request.responseNote = null;
    request.rejectionReason = dto.reason.trim();
    request.approvedAt = new Date();

    const saved = await this.tenantAccessRepository.save(request);
    return this.toResponse(saved);
  }

  async revokeGrant(tenantAdminId: number, tenantId: number, requestId: number, dto: RevokeAccessDto) {
    const admin = await this.userRepository.findOne({
      where: { id: tenantAdminId },
    });
    if (!admin || admin.role !== 'admin_tenant' || admin.instansiId !== tenantId) {
      throw new ForbiddenException('Hanya admin tenant terkait yang dapat mencabut akses');
    }

    const request = await this.tenantAccessRepository.findOne({
      where: { id: requestId, tenantId },
    });
    if (!request) {
      throw new NotFoundException('Akses tidak ditemukan');
    }

    if (request.status !== TenantAccessStatus.APPROVED) {
      throw new BadRequestException('Hanya akses dengan status approved yang dapat dicabut');
    }

    request.status = TenantAccessStatus.REVOKED;
    request.revokedAt = new Date();
    request.revokedBy = tenantAdminId;
    request.responseNote = dto.reason?.trim() || null;

    const saved = await this.tenantAccessRepository.save(request);
    return this.toResponse(saved);
  }

  async hasActiveAccess(superAdminId: number, tenantId: number): Promise<boolean> {
    const request = await this.tenantAccessRepository.findOne({
      where: {
        tenantId,
        superAdminId,
        status: TenantAccessStatus.APPROVED,
      },
      order: { approvedAt: 'DESC' },
    });

    if (!request) {
      return false;
    }

    if (this.isExpired(request)) {
      request.status = TenantAccessStatus.EXPIRED;
      request.revokedAt = new Date();
      await this.tenantAccessRepository.save(request);
      return false;
    }

    return true;
  }

  private isExpired(request: TenantAccessRequest): boolean {
    if (!request.expiresAt) {
      return false;
    }
    return request.expiresAt.getTime() <= Date.now();
  }

  private toResponse(request: TenantAccessRequest) {
    const { superAdmin, approvedByUser, tenant, ...rest } = request;
    return {
      ...rest,
      tenant: tenant
        ? {
          id: tenant.id,
          npsn: tenant.npsn,
          name: tenant.name,
          email: tenant.email,
          phone: tenant.phone,
          isActive: tenant.isActive,
        }
        : null,
      superAdmin: superAdmin
        ? {
          id: superAdmin.id,
          name: superAdmin.name,
          email: superAdmin.email,
          phone: superAdmin.phone,
        }
        : null,
      approvedByUser: approvedByUser
        ? {
          id: approvedByUser.id,
          name: approvedByUser.name,
          email: approvedByUser.email,
        }
        : null,
    };
  }
}

