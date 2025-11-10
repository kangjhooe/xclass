import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from './entities/tenant.entity';

@Injectable()
export class TenantService {
  constructor(
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
  ) {}

  async findOne(id: number): Promise<Tenant> {
    const tenant = await this.tenantRepository.findOne({ where: { id } });
    if (!tenant) {
      throw new NotFoundException(`Tenant with ID ${id} not found`);
    }
    return tenant;
  }

  async findByNpsn(npsn: string): Promise<Tenant> {
    const tenant = await this.tenantRepository.findOne({ where: { npsn } });
    if (!tenant) {
      throw new NotFoundException(`Tenant with NPSN ${npsn} not found`);
    }
    return tenant;
  }

  async findAll(): Promise<Tenant[]> {
    return await this.tenantRepository.find({
      where: { isActive: true },
    });
  }

  async update(id: number, updateData: Partial<Tenant>): Promise<Tenant> {
    const tenant = await this.findOne(id);
    Object.assign(tenant, updateData);
    return await this.tenantRepository.save(tenant);
  }
}
