import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Tenant } from '../tenant/entities/tenant.entity';
import { User } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';

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

  async createTenant(tenantData: Partial<Tenant> & { adminEmail?: string; adminPassword?: string; adminName?: string }) {
    // Buat tenant
    const tenant = this.tenantRepository.create({
      npsn: tenantData.npsn,
      name: tenantData.name,
      email: tenantData.email,
      phone: tenantData.phone,
      address: tenantData.address,
      isActive: tenantData.isActive ?? true,
      settings: tenantData.settings,
    });
    const savedTenant = await this.tenantRepository.save(tenant);

    // Buat user admin untuk tenant ini jika email dan password disediakan
    if (tenantData.adminEmail && tenantData.adminPassword) {
      // Cek apakah email sudah ada
      const existingUser = await this.userRepository.findOne({
        where: { email: tenantData.adminEmail },
      });
      
      if (existingUser) {
        throw new BadRequestException(`Email ${tenantData.adminEmail} sudah terdaftar`);
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(tenantData.adminPassword, 10);

      // Buat user admin
      const adminUser = this.userRepository.create({
        name: tenantData.adminName || `Admin ${savedTenant.name}`,
        email: tenantData.adminEmail,
        password: hashedPassword,
        phone: tenantData.phone || null,
        role: 'admin_tenant',
        instansiId: savedTenant.id,
        isActive: true,
      });
      await this.userRepository.save(adminUser);
    }

    return savedTenant;
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
    const where: any = {
      // Hanya user super_admin (tidak punya instansiId atau instansiId null)
      instansiId: IsNull(),
      role: 'super_admin',
    };
    
    // Jika role di-specify, tetap filter hanya super_admin
    // CRUD user di admin hanya untuk super_admin, bukan tenant users
    if (role && role !== 'super_admin') {
      // Return empty jika bukan super_admin
      return {
        data: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
      };
    }

    const [users, total] = await this.userRepository.findAndCount({
      where,
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
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
      where: { 
        id,
        // Hanya bisa akses user super_admin
        instansiId: IsNull(),
        role: 'super_admin',
      },
    });
    
    if (!user) {
      throw new NotFoundException('User not found or access denied');
    }

    const { password, rememberToken, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async activateUser(id: number) {
    const user = await this.userRepository.findOne({ 
      where: { 
        id,
        // Hanya bisa activate/deactivate user super_admin
        instansiId: IsNull(),
        role: 'super_admin',
      },
    });
    if (!user) {
      throw new NotFoundException('User not found or access denied');
    }
    user.isActive = true;
    return this.userRepository.save(user);
  }

  async deactivateUser(id: number) {
    const user = await this.userRepository.findOne({ 
      where: { 
        id,
        // Hanya bisa activate/deactivate user super_admin
        instansiId: IsNull(),
        role: 'super_admin',
      },
    });
    if (!user) {
      throw new NotFoundException('User not found or access denied');
    }
    user.isActive = false;
    return this.userRepository.save(user);
  }

  async createSuperAdminUser(userData: { name: string; email: string; password: string; phone?: string }) {
    // Cek apakah email sudah ada
    const existingUser = await this.userRepository.findOne({
      where: { email: userData.email },
    });
    
    if (existingUser) {
      throw new BadRequestException(`Email ${userData.email} sudah terdaftar`);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Buat user super_admin (instansiId harus null)
    const user = this.userRepository.create({
      name: userData.name,
      email: userData.email,
      password: hashedPassword,
      phone: userData.phone || null,
      role: 'super_admin',
      instansiId: null, // Super admin tidak punya instansiId
      isActive: true,
    });
    
    const savedUser = await this.userRepository.save(user);
    const { password, rememberToken, ...userWithoutPassword } = savedUser;
    return userWithoutPassword;
  }

  async updateSuperAdminUser(id: number, userData: Partial<{ name: string; email: string; password: string; phone: string; isActive: boolean }>) {
    const user = await this.userRepository.findOne({ 
      where: { 
        id,
        instansiId: IsNull(),
        role: 'super_admin',
      },
    });
    
    if (!user) {
      throw new NotFoundException('User not found or access denied');
    }

    // Update fields
    if (userData.name) user.name = userData.name;
    if (userData.email) {
      // Cek apakah email sudah digunakan user lain
      const existingUser = await this.userRepository.findOne({
        where: { email: userData.email },
      });
      if (existingUser && existingUser.id !== id) {
        throw new BadRequestException(`Email ${userData.email} sudah terdaftar`);
      }
      user.email = userData.email;
    }
    if (userData.password) {
      user.password = await bcrypt.hash(userData.password, 10);
    }
    if (userData.phone !== undefined) user.phone = userData.phone;
    if (userData.isActive !== undefined) user.isActive = userData.isActive;

    const savedUser = await this.userRepository.save(user);
    const { password, rememberToken, ...userWithoutPassword } = savedUser;
    return userWithoutPassword;
  }

  async deleteSuperAdminUser(id: number) {
    const user = await this.userRepository.findOne({ 
      where: { 
        id,
        instansiId: IsNull(),
        role: 'super_admin',
      },
    });
    
    if (!user) {
      throw new NotFoundException('User not found or access denied');
    }

    return this.userRepository.remove(user);
  }
}

