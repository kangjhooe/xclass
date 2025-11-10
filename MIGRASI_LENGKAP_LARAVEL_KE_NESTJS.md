# Migrasi Lengkap dari Laravel ke NestJS/Next.js

Dokumen ini menjelaskan status migrasi dan langkah-langkah yang telah dilakukan untuk memigrasikan aplikasi CLASS dari Laravel ke NestJS (backend) dan Next.js (frontend).

## Status Migrasi

### ✅ Yang Sudah Selesai

#### 1. Backend - NestJS
- ✅ **User Management Module** - Entity, Service, Controller untuk manajemen user
- ✅ **Authentication Module** - Login, JWT authentication dengan validasi user
- ✅ **Admin Module** - Super admin dashboard, tenant management, user management
- ✅ **Tenant Module** - Multi-tenant support
- ✅ **Core Modules** - Students, Teachers, Classes, Subjects, Schedules, Attendance, Grades
- ✅ **Extended Modules** - Exams, Library, PPDB, Finance, HR, Correspondence, dll
- ✅ **Middleware & Guards** - Tenant middleware, JWT guards, Role guards
- ✅ **TypeORM Setup** - Database connection dan entity management

#### 2. Frontend - Next.js
- ✅ **Struktur Dasar** - App router, layout, providers
- ✅ **Authentication Pages** - Login, Register
- ✅ **Admin Dashboard** - Halaman dashboard admin
- ✅ **Tenant Dashboard** - Halaman dashboard tenant
- ✅ **Basic Pages** - Students, Teachers, Classes, Subjects

### ⏳ Yang Masih Perlu Dikerjakan

#### 1. Backend - NestJS
- ⏳ **Public Page Module** - Public website untuk tenant
- ⏳ **License Management** - License key management
- ⏳ **System Settings** - Global system settings
- ⏳ **Backup & Recovery** - System backup management
- ⏳ **Activity Logs** - System-wide activity logging
- ⏳ **Tenant Features Management** - Feature flags per tenant
- ⏳ **Tenant Resource Limits** - Resource monitoring dan limits
- ⏳ **Tenant Onboarding** - Onboarding wizard untuk tenant baru
- ⏳ **Tenant Health Monitoring** - Health check dan monitoring
- ⏳ **NPSN Change Request** - Request perubahan NPSN
- ⏳ **Subscription Management** - Subscription plans dan billing
- ⏳ **Export/Import Features** - Excel/PDF export dan import
- ⏳ **File Upload/Download** - File management
- ⏳ **Email Notifications** - Email service integration
- ⏳ **API Documentation** - OpenAPI/Swagger documentation

#### 2. Frontend - Next.js
- ⏳ **Semua Halaman Tenant** - Migrasi semua halaman dari Blade ke React
- ⏳ **Semua Halaman Admin** - Migrasi semua halaman admin
- ⏳ **Public Pages** - Public website untuk tenant
- ⏳ **PPDB Public Pages** - Public registration pages
- ⏳ **Components** - Semua komponen UI dari Blade ke React
- ⏳ **Forms** - Form handling dengan react-hook-form
- ⏳ **Data Tables** - Table components dengan pagination, sorting, filtering
- ⏳ **File Upload** - File upload components
- ⏳ **Charts & Reports** - Chart components untuk dashboard
- ⏳ **Notifications** - Toast notifications
- ⏳ **Error Handling** - Error pages dan error handling

#### 3. Cleanup
- ⏳ **Hapus Laravel Routes** - Hapus semua routes Laravel
- ⏳ **Hapus Laravel Controllers** - Hapus semua controllers Laravel
- ⏳ **Hapus Blade Views** - Hapus semua views Blade
- ⏳ **Hapus Laravel Models** - Hapus semua models Laravel (setelah migrasi ke TypeORM)
- ⏳ **Hapus Laravel Services** - Hapus semua services Laravel
- ⏳ **Hapus Laravel Middleware** - Hapus semua middleware Laravel
- ⏳ **Hapus Composer Dependencies** - Hapus composer.json dan vendor/
- ⏳ **Hapus Artisan** - Hapus file artisan
- ⏳ **Hapus Laravel Config** - Hapus folder config/ Laravel
- ⏳ **Hapus Laravel Modules** - Hapus folder Modules/ Laravel (nwidart/laravel-modules)

## Struktur API Endpoints

### Authentication
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get current user profile

### Admin (Super Admin Only)
- `GET /api/admin/dashboard` - Dashboard statistics
- `GET /api/admin/tenants` - List all tenants
- `POST /api/admin/tenants` - Create tenant
- `GET /api/admin/tenants/:id` - Get tenant details
- `PUT /api/admin/tenants/:id` - Update tenant
- `POST /api/admin/tenants/:id/activate` - Activate tenant
- `POST /api/admin/tenants/:id/deactivate` - Deactivate tenant
- `DELETE /api/admin/tenants/:id` - Delete tenant
- `GET /api/admin/users` - List all users
- `GET /api/admin/users/:id` - Get user details
- `POST /api/admin/users/:id/activate` - Activate user
- `POST /api/admin/users/:id/deactivate` - Deactivate user

### Users
- `GET /api/users` - List users (with optional instansiId filter)
- `GET /api/users/:id` - Get user details
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Tenants
- `GET /api/tenants` - List tenants
- `GET /api/tenants/:id` - Get tenant details
- `GET /api/tenants/npsn/:npsn` - Get tenant by NPSN

### Other Modules
Semua modul lain mengikuti pattern yang sama:
- `GET /api/{module}` - List items
- `GET /api/{module}/:id` - Get item details
- `POST /api/{module}` - Create item
- `PUT /api/{module}/:id` - Update item
- `DELETE /api/{module}/:id` - Delete item

## Langkah-Langkah Migrasi

### 1. Setup Environment

Pastikan environment variables sudah dikonfigurasi:

```env
# Backend (.env)
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=
DB_DATABASE=class
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h
NODE_ENV=development

# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### 2. Install Dependencies

```bash
# Backend
npm install

# Frontend
cd frontend
npm install
```

### 3. Run Migrations

Pastikan database sudah di-migrate dengan TypeORM:

```bash
# Backend akan auto-sync entities jika NODE_ENV=development
# Untuk production, gunakan migration files
```

### 4. Start Development Servers

```bash
# Backend (NestJS)
npm run start:dev

# Frontend (Next.js)
cd frontend
npm run dev
```

## Testing

### Backend API Testing

Gunakan Postman atau curl untuk test API:

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'

# Get Dashboard (with token)
curl -X GET http://localhost:3000/api/admin/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Catatan Penting

1. **Database**: Pastikan semua data sudah di-migrate dari Laravel ke database yang sama (TypeORM akan menggunakan database yang sama)

2. **Authentication**: JWT token format sudah kompatibel dengan Laravel, jadi user yang sudah login di Laravel bisa langsung menggunakan token yang sama

3. **Tenant Isolation**: Semua endpoints tenant-aware menggunakan `@TenantId()` decorator untuk mendapatkan tenant ID

4. **Role-Based Access**: Gunakan `@Roles()` decorator untuk membatasi akses berdasarkan role

5. **Error Handling**: Semua error akan return dalam format JSON yang konsisten

## Next Steps

1. **Lengkapi Modul yang Masih Kurang** - Implement semua modul yang masih TODO
2. **Migrasi Frontend** - Convert semua Blade views ke React components
3. **Testing** - Comprehensive testing untuk semua fitur
4. **Cleanup** - Hapus semua file Laravel yang tidak diperlukan
5. **Documentation** - Lengkapi API documentation dengan Swagger/OpenAPI
6. **Deployment** - Setup production deployment untuk NestJS dan Next.js

## Kontribusi

Jika menemukan bug atau ingin menambahkan fitur, silakan buat issue atau pull request.

