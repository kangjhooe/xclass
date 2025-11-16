import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PositionModule } from '../../modules/hr/entities/position-module.entity';
import { Teacher } from '../../modules/teachers/entities/teacher.entity';
import { User } from '../../modules/users/entities/user.entity';

export interface ModulePermission {
  canView: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
}

@Injectable()
export class ModuleAccessService {
  constructor(
    @InjectRepository(PositionModule)
    private positionModuleRepository: Repository<PositionModule>,
    @InjectRepository(Teacher)
    private teacherRepository: Repository<Teacher>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * Cek apakah user memiliki akses ke modul tertentu
   */
  async hasModuleAccess(
    userId: number,
    moduleKey: string,
    requiredPermission: 'view' | 'create' | 'update' | 'delete' = 'view',
  ): Promise<boolean> {
    // Super admin dan admin tenant memiliki akses penuh
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'role', 'instansiId'],
    });

    if (!user) {
      return false;
    }

    // Super admin dan admin tenant memiliki akses ke semua modul
    if (user.role === 'super_admin' || user.role === 'admin_tenant') {
      return true;
    }

    // Untuk teacher dan staff, cek berdasarkan position
    if (user.role === 'teacher' || user.role === 'staff') {
      // Cari teacher - prioritas: teacherId dari JWT > email > nik
      let teacher = null;
      
      // Cek apakah ada teacherId di request (dari JWT payload)
      // Note: Ini perlu di-pass dari guard, untuk sekarang kita cari manual
      // Jika ada teacherId di user object, gunakan itu
      const teacherId = (user as any).teacherId;
      if (teacherId) {
        teacher = await this.teacherRepository.findOne({
          where: { id: teacherId, instansiId: user.instansiId },
          relations: ['position'],
        });
      }
      
      // Jika tidak ditemukan, cari berdasarkan email atau nik
      if (!teacher) {
        teacher = await this.teacherRepository.findOne({
          where: [
            { email: user.email, instansiId: user.instansiId },
            { nik: user.email, instansiId: user.instansiId }, // Fallback jika email tidak match
          ],
          relations: ['position'],
        });
      }

      if (!teacher || !teacher.position) {
        return false;
      }

      // Cari module access untuk position ini
      const positionModule = await this.positionModuleRepository.findOne({
        where: {
          positionId: teacher.position.id,
          moduleKey,
          isActive: true,
        },
      });

      if (!positionModule) {
        return false;
      }

      // Cek permission berdasarkan requiredPermission
      switch (requiredPermission) {
        case 'view':
          return positionModule.canView;
        case 'create':
          return positionModule.canCreate;
        case 'update':
          return positionModule.canUpdate;
        case 'delete':
          return positionModule.canDelete;
        default:
          return positionModule.canView;
      }
    }

    return false;
  }

  /**
   * Dapatkan semua modul yang bisa diakses oleh user
   */
  async getUserAccessibleModules(userId: number): Promise<PositionModule[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'role', 'email', 'instansiId'],
    });

    if (!user) {
      return [];
    }

    // Super admin dan admin tenant memiliki akses ke semua modul
    if (user.role === 'super_admin' || user.role === 'admin_tenant') {
      return await this.positionModuleRepository.find({
        where: { isActive: true },
      });
    }

    // Untuk teacher dan staff, ambil berdasarkan position
    if (user.role === 'teacher' || user.role === 'staff') {
      let teacher = null;
      const teacherId = (user as any).teacherId;
      if (teacherId) {
        teacher = await this.teacherRepository.findOne({
          where: { id: teacherId, instansiId: user.instansiId },
          relations: ['position'],
        });
      }
      if (!teacher) {
        teacher = await this.teacherRepository.findOne({
          where: [
            { email: user.email, instansiId: user.instansiId },
            { nik: user.email, instansiId: user.instansiId },
          ],
          relations: ['position'],
        });
      }

      if (!teacher || !teacher.position) {
        return [];
      }

      return await this.positionModuleRepository.find({
        where: {
          positionId: teacher.position.id,
          isActive: true,
        },
      });
    }

    return [];
  }

  /**
   * Dapatkan permission detail untuk modul tertentu
   */
  async getModulePermission(
    userId: number,
    moduleKey: string,
  ): Promise<ModulePermission | null> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'role', 'email', 'instansiId'],
    });

    if (!user) {
      return null;
    }

    // Super admin dan admin tenant memiliki semua permission
    if (user.role === 'super_admin' || user.role === 'admin_tenant') {
      return {
        canView: true,
        canCreate: true,
        canUpdate: true,
        canDelete: true,
      };
    }

    // Untuk teacher dan staff, ambil dari position module
    if (user.role === 'teacher' || user.role === 'staff') {
      let teacher = null;
      const teacherId = (user as any).teacherId;
      if (teacherId) {
        teacher = await this.teacherRepository.findOne({
          where: { id: teacherId, instansiId: user.instansiId },
          relations: ['position'],
        });
      }
      if (!teacher) {
        teacher = await this.teacherRepository.findOne({
          where: [
            { email: user.email, instansiId: user.instansiId },
            { nik: user.email, instansiId: user.instansiId },
          ],
          relations: ['position'],
        });
      }

      if (!teacher || !teacher.position) {
        return null;
      }

      const positionModule = await this.positionModuleRepository.findOne({
        where: {
          positionId: teacher.position.id,
          moduleKey,
          isActive: true,
        },
      });

      if (!positionModule) {
        return null;
      }

      return {
        canView: positionModule.canView,
        canCreate: positionModule.canCreate,
        canUpdate: positionModule.canUpdate,
        canDelete: positionModule.canDelete,
      };
    }

    return null;
  }
}

