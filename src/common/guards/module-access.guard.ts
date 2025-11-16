import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ModuleAccessService } from '../services/module-access.service';
import { MODULE_ACCESS_KEY, ModuleAccessOptions } from '../decorators/module-access.decorator';

@Injectable()
export class ModuleAccessGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private moduleAccessService: ModuleAccessService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const moduleAccess = this.reflector.get<ModuleAccessOptions>(
      MODULE_ACCESS_KEY,
      context.getHandler(),
    );

    // Jika tidak ada decorator @ModuleAccess, izinkan akses (backward compatibility)
    if (!moduleAccess) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.userId) {
      throw new ForbiddenException('User tidak terautentikasi');
    }

    const hasAccess = await this.moduleAccessService.hasModuleAccess(
      user.userId || user.id,
      moduleAccess.moduleKey,
      moduleAccess.permission || 'view',
    );

    if (!hasAccess) {
      throw new ForbiddenException(
        `Anda tidak memiliki akses ke modul ${moduleAccess.moduleKey}`,
      );
    }

    return true;
  }
}

