# Stack Teknologi Aplikasi CLASS

## Overview

Aplikasi CLASS menggunakan teknologi stack modern berikut:

## Backend - NestJS

- **Framework:** NestJS (Node.js, TypeScript)
- **ORM:** TypeORM
- **Database:** MySQL/PostgreSQL
- **Authentication:** Passport JWT
- **Location:** Folder `src/`

### Struktur Backend

```
src/
├── app.module.ts          # Root module
├── main.ts                # Entry point
├── modules/               # NestJS modules
│   ├── auth/             # Authentication
│   ├── students/         # Modul siswa
│   ├── teachers/         # Modul guru
│   ├── tenant/           # Multi-tenant support
│   └── ...               # Modul lainnya
└── common/               # Shared utilities
    ├── middleware/       # Custom middleware
    └── ...
```

## Frontend - Next.js

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **UI Library:** React 18
- **Styling:** Tailwind CSS
- **State Management:** Zustand
- **API Client:** Axios
- **Data Fetching:** React Query (TanStack Query)
- **Location:** Folder `frontend/`

### Struktur Frontend

```
frontend/
├── app/                  # Next.js App Router
│   ├── admin/           # Routes Super Admin
│   ├── [tenant]/        # Dynamic routes tenant
│   ├── login/           # Halaman login
│   └── ...
├── components/           # Komponen React
│   ├── layouts/         # Layout components
│   └── ui/              # UI components
└── lib/                 # Utilities
    ├── api/             # API client
    ├── store/           # Zustand stores
    └── utils/           # Helper functions
```

## Teknologi yang Digunakan

Aplikasi ini dibangun dengan:
- **Backend:** NestJS (Node.js, TypeScript)
- **Frontend:** Next.js 14 (React, TypeScript)
- **Database:** MySQL dengan TypeORM
- **Authentication:** JWT (Passport)

**Status:** Aplikasi menggunakan stack modern NestJS/Next.js dengan semua fitur yang tersedia.

## Development

### Menjalankan Backend (NestJS)

```bash
npm run start:dev
```

### Menjalankan Frontend (Next.js)

```bash
cd frontend
npm run dev
```

## Environment Variables

### Backend (.env)
```
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=
DB_DATABASE=class
JWT_SECRET=your-secret-key
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

## Catatan Penting

1. Backend API berjalan di port default NestJS (biasanya 3000)
2. Frontend Next.js berjalan di port 3000 (atau port lain jika 3000 sudah digunakan)
3. Pastikan backend sudah berjalan sebelum mengakses frontend
4. Database harus dikonfigurasi dengan benar di backend

