import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from '../tenant/entities/tenant.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getDashboardStats() {
    const totalTenants = await this.tenantRepository.count();
    const activeTenants = await this.tenantRepository.count({ where: { isActive: true } });
    const inactiveTenants = await this.tenantRepository.count({ where: { isActive: false } });
    
    const totalAdminTenants = await this.userRepository.count({ where: { role: 'admin_tenant' } });
    const activeAdminTenants = await this.userRepository.count({ 
      where: { role: 'admin_tenant', isActive: true } 
    });
    
    const totalGlobalUsers = await this.userRepository.count({ 
      where: { role: 'super_admin' } 
    });
    const activeGlobalUsers = await this.userRepository.count({ 
      where: { role: 'super_admin', isActive: true } 
    });

    return {
      totalTenants,
      activeTenants,
      inactiveTenants,
      totalAdminTenants,
      activeAdminTenants,
      totalGlobalUsers,
      activeGlobalUsers,
    };
  }

  async getRecentTenants(limit: number = 5) {
    return this.tenantRepository.find({
      take: limit,
      order: { createdAt: 'DESC' },
    });
  }

  async getRecentAdminUsers(limit: number = 5) {
    return this.userRepository.find({
      where: { role: 'admin_tenant' },
      take: limit,
      order: { createdAt: 'DESC' },
      relations: ['tenant'],
    });
  }

  async getAllTenants(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const [tenants, total] = await this.tenantRepository.findAndCount({
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data: tenants,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getTenantById(id: number) {
    const tenant = await this.tenantRepository.findOne({ 
      where: { id },
      relations: ['users'],
    });
    
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    return tenant;
  }

  async createTenant(tenantData: Partial<Tenant>) {
    const tenant = this.tenantRepository.create(tenantData);
    return this.tenantRepository.save(tenant);
  }

  async updateTenant(id: number, tenantData: Partial<Tenant>) {
    const tenant = await this.getTenantById(id);
    Object.assign(tenant, tenantData);
    return this.tenantRepository.save(tenant);
  }

  async activateTenant(id: number) {
    const tenant = await this.getTenantById(id);
    tenant.isActive = true;
    return this.tenantRepository.save(tenant);
  }

  async deactivateTenant(id: number) {
    const tenant = await this.getTenantById(id);
    tenant.isActive = false;
    return this.tenantRepository.save(tenant);
  }

  async deleteTenant(id: number) {
    const tenant = await this.getTenantById(id);
    return this.tenantRepository.remove(tenant);
  }

  async getAllUsers(page: number = 1, limit: number = 20, role?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (role) {
      where.role = role;
    }

    const [users, total] = await this.userRepository.findAndCount({
      where,
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
      relations: ['tenant'],
    });

    return {
      data: users.map(user => {
        const { password, rememberToken, ...userWithoutPassword } = user;
        return userWithoutPassword;
      }),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getUserById(id: number) {
    const user = await this.userRepository.findOne({ 
      where: { id },
      relations: ['tenant'],
    });
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { password, rememberToken, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async activateUser(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.isActive = true;
    return this.userRepository.save(user);
  }

  async deactivateUser(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.isActive = false;
    return this.userRepository.save(user);
  }
}

