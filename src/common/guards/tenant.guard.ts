import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { TenantAccessService } from '../../modules/tenant-access/tenant-access.service';

@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    return this.validateAccess(context);
  }

  private async validateAccess(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const user = request.user;
    const tenantIdSource =
      user?.instansiId ||
      request.tenant?.id ||
      request.tenantId ||
      request.headers['x-tenant-id'] ||
      request.params?.tenant;

    if (!tenantIdSource) {
      throw new ForbiddenException('Tenant ID is required');
    }

    const tenantId =
      typeof tenantIdSource === 'string' ? parseInt(tenantIdSource, 10) : tenantIdSource;

    if (!tenantId || Number.isNaN(tenantId)) {
      throw new ForbiddenException('Tenant ID is invalid');
    }

    if (!user) {
      throw new ForbiddenException('User must be authenticated');
    }

    // Allow same-tenant access (tenant admins, teachers, students, etc.)
    if (user.instansiId && Number(user.instansiId) === Number(tenantId)) {
      return true;
    }

    // Allow super admin with delegated access
    if (user.role === 'super_admin') {
      const tenantAccessService = TenantAccessService.getInstance();
      if (!tenantAccessService) {
        throw new ForbiddenException('Tenant access service unavailable');
      }

      const hasAccess = await tenantAccessService.hasActiveAccess(
        user.userId || user.id,
        Number(tenantId),
      );

      if (hasAccess) {
        request.user = {
          ...user,
          instansiId: Number(tenantId),
          delegatedTenantId: Number(tenantId),
        };
        request.tenantId = Number(tenantId);
        return true;
      }
    }

    throw new ForbiddenException('Anda tidak memiliki akses ke tenant ini');
  }
}
