# Migrasi Frontend dari Laravel Blade ke Next.js

Dokumen ini menjelaskan migrasi frontend aplikasi CLASS dari Laravel Blade ke Next.js (React).

## Struktur Baru

Frontend baru menggunakan Next.js 14 dengan App Router, terletak di folder `frontend/`.

### Struktur Folder

```
frontend/
├── app/                    # Next.js App Router
│   ├── admin/             # Routes untuk Super Admin
│   │   └── dashboard/    # Dashboard admin
│   ├── [tenant]/         # Dynamic route untuk tenant
│   │   └── dashboard/   # Dashboard tenant
│   ├── login/            # Halaman login
│   ├── register/         # Halaman register
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Home page
│   └── globals.css       # Global styles
├── components/            # Komponen React reusable
│   └── layouts/          # Layout components
├── lib/                   # Utilities dan helpers
│   ├── api/              # API client (Axios)
│   └── store/            # State management (Zustand)
└── public/                # Static files
```

## File Laravel yang Tidak Diperlukan Lagi

Setelah migrasi ke Next.js, file-file berikut **tidak diperlukan lagi** untuk frontend:

### 1. Views (Blade Templates)
- `resources/views/**/*.blade.php` - Semua file Blade template
- `resources/views/layouts/` - Layout Blade
- `resources/views/components/` - Komponen Blade

### 2. Routes Web (Frontend Routes)
- `routes/web.php` - Routes web utama (akan diganti dengan Next.js routing)
- `routes/admin.php` - Routes admin (akan diganti dengan Next.js)
- `routes/tenant.php` - Routes tenant (akan diganti dengan Next.js)
- `routes/publicpage.php` - Routes public page
- `routes/tenant-modules.php` - Routes modul tenant
- `routes/error-test.php` - Routes testing error

### 3. Controllers (Frontend Controllers)
Semua controller yang hanya mengembalikan view bisa dihapus:
- `app/Http/Controllers/HomeController.php`
- `app/Http/Controllers/Auth/LoginController.php` (method showLoginForm)
- `app/Http/Controllers/Auth/RegisterController.php` (method showRegistrationForm)
- `app/Http/Controllers/Admin/**/*.php` (method yang return view)
- `app/Http/Controllers/Tenant/**/*.php` (method yang return view)
- `app/Http/Controllers/PublicPage/**/*.php` (method yang return view)

**Catatan:** Controller yang masih diperlukan:
- Controller yang hanya handle API (tidak return view)
- Controller untuk export/import file
- Controller untuk file upload/download

### 4. Assets Frontend (Laravel Mix/Vite)
- `resources/css/app.css` - Akan diganti dengan Tailwind di Next.js
- `resources/js/app.js` - Akan diganti dengan Next.js
- `resources/js/components/**/*.vue` - Komponen Vue bisa di-convert ke React
- `vite.config.js` - Konfigurasi Vite untuk Laravel (bisa dihapus jika tidak digunakan untuk backend)
- `vite-module-loader.js` - Loader untuk modul Laravel

### 5. Middleware Frontend
Middleware yang hanya untuk redirect atau render view bisa dihapus:
- `app/Http/Middleware/**/*.php` - Perlu review, beberapa mungkin masih diperlukan untuk API

## File Laravel yang Masih Diperlukan

### Backend API (NestJS)
- `src/` - Semua kode NestJS backend
- `nest-cli.json` - Konfigurasi NestJS
- `tsconfig.json` - TypeScript config untuk backend

### Laravel Backend (Jika masih digunakan untuk API)
- `app/Http/Controllers/Api/**/*.php` - API controllers
- `routes/api.php` - API routes
- `app/Models/**/*.php` - Models
- `app/Services/**/*.php` - Services
- `database/` - Migrations dan seeders
- `config/` - Konfigurasi aplikasi

## Langkah Migrasi

1. ✅ **Setup Next.js** - Struktur dasar Next.js sudah dibuat
2. ⏳ **Migrasi Halaman** - Convert Blade templates ke React components
3. ⏳ **Setup API Integration** - Integrasi dengan NestJS backend
4. ⏳ **Migrasi Komponen** - Convert Blade components ke React
5. ⏳ **Setup Authentication** - Implementasi auth flow
6. ⏳ **Testing** - Test semua fitur
7. ⏳ **Cleanup** - Hapus file Laravel yang tidak diperlukan

## Integrasi dengan Backend

Frontend Next.js akan berkomunikasi dengan:
- **NestJS Backend** - API utama di `http://localhost:3000/api`
- **Laravel Backend** (opsional) - Jika masih ada API endpoints di Laravel

Semua request API menggunakan Axios client di `lib/api/client.ts` dengan:
- Automatic token injection
- Error handling
- Request/response interceptors

## State Management

Menggunakan **Zustand** untuk state management:
- `lib/store/auth.ts` - Authentication state
- Bisa ditambahkan store lain sesuai kebutuhan

## Styling

Menggunakan **Tailwind CSS** untuk styling, konsisten dengan design system yang ada.

## Next Steps

1. Install dependencies: `cd frontend && npm install`
2. Setup environment: Copy `.env.example` ke `.env.local`
3. Start development: `npm run dev`
4. Mulai migrasi halaman satu per satu dari Blade ke React

