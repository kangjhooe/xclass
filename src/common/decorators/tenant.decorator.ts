import { createParamDecorator, ExecutionContext, BadRequestException } from '@nestjs/common';

export const Tenant = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.tenant;
  },
);

export const TenantId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): number => {
    const request = ctx.switchToHttp().getRequest();
    
    // Coba ambil dari berbagai sumber (prioritas: user > tenant object > tenantId > header > params)
    const tenantId: number | string | undefined = 
      request.user?.instansiId ||  // Dari JWT user yang sudah login
      request.tenant?.id ||         // Dari tenant object (jika di-set oleh middleware)
      request.tenantId ||           // Dari middleware
      request.headers['x-tenant-id'] || // Dari header
      request.params?.tenant;       // Dari route params
    
    // Jika tidak ada, throw error
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    
    // Konversi ke number jika string
    const id = typeof tenantId === 'string' ? parseInt(tenantId, 10) : tenantId;
    
    // Validasi bahwa hasilnya adalah number yang valid
    if (isNaN(id) || id <= 0) {
      throw new BadRequestException('Invalid tenant ID');
    }
    
    return id;
  },
);

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

export const CurrentUserId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): number => {
    const request = ctx.switchToHttp().getRequest();
    
    if (!request.user || !request.user.userId) {
      throw new BadRequestException('User ID is required');
    }
    
    return request.user.userId;
  },
);

