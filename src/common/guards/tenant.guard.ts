import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    
    // Cek tenant dari berbagai sumber (konsisten dengan decorator)
    const tenantId = 
      request.user?.instansiId ||
      request.tenant?.id ||
      request.tenantId ||
      request.headers['x-tenant-id'] ||
      request.params?.tenant;

    if (!tenantId) {
      throw new ForbiddenException('Tenant ID is required');
    }

    return true;
  }
}

