# CLASS Frontend - Next.js

Frontend aplikasi CLASS menggunakan Next.js 14 dengan React dan TypeScript.

## Struktur Proyek

```
frontend/
├── app/                    # Next.js App Router
│   ├── admin/             # Routes untuk Super Admin
│   │   └── dashboard/     # Dashboard admin
│   ├── [tenant]/          # Dynamic route untuk tenant
│   │   ├── dashboard/      # Dashboard tenant
│   │   └── students/     # Halaman siswa
│   ├── login/             # Halaman login
│   ├── register/          # Halaman register
│   ├── layout.tsx         # Root layout
│   ├── page.tsx          # Home page
│   ├── providers.tsx     # React Query provider
│   └── globals.css       # Global styles
├── components/            # Komponen React
│   ├── layouts/          # Layout components
│   │   ├── AdminLayout.tsx
│   │   └── TenantLayout.tsx
│   └── ui/               # UI Components
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Select.tsx
│       ├── Textarea.tsx
│       ├── Table.tsx
│       ├── Modal.tsx
│       ├── Loading.tsx
│       └── EmptyState.tsx
├── lib/                   # Utilities dan helpers
│   ├── api/              # API client
│   │   ├── client.ts     # Axios client
│   │   └── students.ts   # Students API
│   ├── store/            # State management (Zustand)
│   │   └── auth.ts       # Auth store
│   ├── utils/            # Utility functions
│   │   ├── date.ts       # Date formatting
│   │   └── cn.ts         # Class name utility
│   └── hooks/            # Custom hooks
│       └── useDebounce.ts
└── public/                # Static files
```

## Setup

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Copy file environment:
```bash
cp .env.example .env.local
```

3. Update `.env.local` dengan konfigurasi API backend (NestJS):
```
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

4. Jalankan development server:
```bash
npm run dev
```

Aplikasi akan berjalan di `http://localhost:3001`

## Teknologi

- **Next.js 14** - React framework dengan App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **React Query** - Data fetching & caching
- **Axios** - HTTP client
- **React Hook Form** - Form handling (siap digunakan)
- **date-fns** - Date manipulation

## Fitur yang Sudah Dibuat

### ✅ Halaman
- Home page
- Login & Register
- Admin Dashboard
- Tenant Dashboard
- Students (CRUD lengkap)

### ✅ Komponen UI
- Button (dengan variants)
- Input, Select, Textarea
- Table (dengan komponen terkait)
- Modal
- Loading & EmptyState

### ✅ Utilities
- API Client dengan interceptors
- Auth Store (Zustand)
- Date formatting (format Indonesia)
- Class name utility (cn)

## Integrasi dengan Backend

Frontend ini terintegrasi dengan backend NestJS yang berjalan di `http://localhost:3000/api`.

### API Endpoints yang Digunakan

- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register
- `GET /api/tenants/:tenantId/students` - Get all students
- `GET /api/tenants/:tenantId/students/:id` - Get student by ID
- `POST /api/tenants/:tenantId/students` - Create student
- `PUT /api/tenants/:tenantId/students/:id` - Update student
- `DELETE /api/tenants/:tenantId/students/:id` - Delete student

Semua request API menggunakan Axios client di `lib/api/client.ts` dengan:
- Automatic token injection dari localStorage
- Error handling (redirect ke login jika 401)
- Request/response interceptors

## State Management

Menggunakan **Zustand** untuk state management:
- `lib/store/auth.ts` - Authentication state (user, token, isAuthenticated)

Menggunakan **React Query** untuk server state:
- Data fetching & caching
- Automatic refetching
- Optimistic updates

## Styling

Menggunakan **Tailwind CSS** untuk styling, konsisten dengan design system yang ada.

## Next Steps

1. ✅ Install dependencies: `cd frontend && npm install`
2. ✅ Setup environment: Copy `.env.example` ke `.env.local`
3. ✅ Start development: `npm run dev`
4. ⏳ Migrasi halaman Teachers
5. ⏳ Migrasi halaman Classes
6. ⏳ Migrasi halaman lainnya
7. ⏳ Setup pagination & search
8. ⏳ Setup file upload
9. ⏳ Setup export/import
