# Common Module - Tenant Management

**Version: 0.1**

Modul ini menyediakan fitur untuk multi-tenant management di aplikasi NestJS.

## Komponen

### 1. Tenant Decorator (`decorators/tenant.decorator.ts`)

Decorator untuk mengambil Tenant ID dari request.

#### `@TenantId()`

Mengambil tenant ID dari berbagai sumber dengan prioritas:
1. `request.user.instansiId` - Dari JWT user yang sudah login
2. `request.tenant?.id` - Dari tenant object (jika di-set oleh middleware)
3. `request.tenantId` - Dari middleware
4. `request.headers['x-tenant-id']` - Dari header HTTP
5. `request.params?.tenant` - Dari route parameter

**Contoh penggunaan:**

```typescript
@Get()
findAll(@TenantId() instansiId: number) {
  return this.service.findAll(instansiId);
}
```

**Error handling:**
- Melempar `BadRequestException` jika tenant ID tidak ditemukan
- Melempar `BadRequestException` jika tenant ID tidak valid (NaN atau <= 0)

### 2. Tenant Guard (`guards/tenant.guard.ts`)

Guard untuk memvalidasi bahwa request memiliki tenant ID yang valid.

**Contoh penggunaan:**

```typescript
@Controller('students')
@UseGuards(JwtAuthGuard, TenantGuard)
export class StudentsController {
  // ...
}
```

**Error handling:**
- Melempar `ForbiddenException` jika tenant ID tidak ditemukan

### 3. Tenant Middleware (`middleware/tenant.middleware.ts`)

Middleware untuk mengekstrak tenant ID dari request dan menyimpannya di `request.tenantId`.

**Sumber tenant ID (prioritas):**
1. `req['user']?.instansiId` - Dari user yang sudah login (JWT)
2. `req.headers['x-tenant-id']` - Dari header HTTP
3. `req.params?.tenant` - Dari route parameter
4. `req.subdomains?.[0]` - Dari subdomain

**Registrasi di `app.module.ts`:**

```typescript
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantMiddleware)
      .forRoutes('*');
  }
}
```

## Best Practices

1. **Gunakan `@TenantId()` decorator** di semua endpoint yang memerlukan tenant scoping
2. **Aktifkan `TenantGuard`** di controller level untuk memastikan tenant ID selalu tersedia
3. **Gunakan `JwtAuthGuard`** sebelum `TenantGuard` untuk memastikan user sudah login
4. **Tenant ID akan otomatis diambil dari JWT** jika user sudah login, sehingga tidak perlu mengirim header `x-tenant-id`

## Contoh Lengkap

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { TenantId } from '../../common/decorators/tenant.decorator';

@Controller('students')
@UseGuards(JwtAuthGuard, TenantGuard)
export class StudentsController {
  @Get()
  findAll(@TenantId() instansiId: number) {
    // instansiId akan otomatis diambil dari:
    // 1. JWT token (request.user.instansiId) - jika user sudah login
    // 2. Header x-tenant-id
    // 3. Route parameter
    return this.service.findAll(instansiId);
  }
}
```

